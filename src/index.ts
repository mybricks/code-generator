import codePrettier from './prettier'
import { getObjectStr, isNumber } from './utils'
import slotWrapper from './slotWrapper'


interface ComItem {
  def: { namespace: string, rtType?: string, version: string }
  id: string
  slots: { [slotId: string]: ToJsonSlot }
}

interface ToJsonSlot {
  comAry: ComItem[]
  style: any
  type?: 'scope'
}

interface ToJson {
  coms: any
  comsAutoRun: any
  cons: any
  deps: any[]
  inputs: any[]
  outputs: any[]
  pinProxies: any
  pinRels: any
  slot: ToJsonSlot
}

const COM_LIBS = '__comlibs_edit_'

const targetType = {
  react: 'toReact'
}

const comMaps = new Map()
const comToCodeFnMaps = new Map()

function generateCode (options: {
  target?: 'react',
  toJson: ToJson
}) {
  const { toJson, target } = options

  const { slot, coms } = toJson

  const slotContentScript = slotContent(slot, coms)

  const importsScript = getComDeps(target)

  const jsxScript = `export default function () {
    return (
      ${slotContentScript}
    )
  }
  `

  const result = `
    ${importsScript}

    ${jsxScript}
  `

  return codePrettier(result)
}

function getComTargetCode (target: 'react', namespace: string, comProps: any, comAray?: any) {
  /**
   * 获取组件库信息，暂时从 window 上获取
   */
  const comlibs = comAray || window[COM_LIBS][0]
  let toCodeResult: any

  // 找到对应组件的模版，执行后拿到出码字符串。
  // Todo 暂时忽略 version
  if (comMaps.get(namespace)){
    const toCodeFn = comToCodeFnMaps.get(namespace)
    toCodeResult = comMaps.get(namespace)

    if (toCodeFn) {
      toCodeResult = { ...toCodeResult, ...toCodeFn(comProps) } 
    }

  } else {
    comlibs.comAray.forEach((comlib: any) => {
      if (comlib.namespace) {
        if (comlib.namespace === namespace) {
          // console.log(comlib)
          const toCodeFn = comlib.target?.[targetType[target]]
          if (toCodeFn) {
            toCodeResult = toCodeFn(comProps)
            comToCodeFnMaps.set(comlib.namespace, toCodeFn)
          }

          comMaps.set(comlib.namespace, toCodeResult)
        }
      } else {
        if (comlib.comAray) {
          toCodeResult = getComTargetCode(target, namespace, comProps, comlib)
        }
      }
    })
  }

  return toCodeResult
}
/**
 * @description 递归获取 slot 内容
 * @param slot 
 * @param coms 
 * @param params 
 * @returns 
 */
function slotContent (slot: ToJsonSlot, coms: any, params?: { wrap: any, itemWrap: any, style: any }) {
  const { comAry, style }  = slot
  let result = ''
  const wrapComAry: { id: string, jsx: string, style: any }[] = []
  const slotStyle = params?.style || style

  comAry.forEach(comItem => {
    const { slots } = comItem
    const comInfo = coms[comItem.id]
    const comModel = comInfo.model

    const slotsProxy = new Proxy(slots || {}, {
      get (target, slotId: string) {
        return {
          render(renderParams: { wrap: any; itemWrap: any, style: any }) {
            const slotNext = slots[slotId]
            if (slotNext) {
              return slotContent(slotNext, coms, renderParams)
            }
          }
        }
      }
    })

    const comProps = {
      data: comModel.data,
      style: comModel.style,
      slots: slotsProxy
    }

    const toCodeResult = getComTargetCode('react', comItem.def.namespace, comProps)

    let jsx

    if (toCodeResult?.jsx) {
      if (comInfo.def.rtType === 'popup') {
        // 对 popup 类型进行特殊处理
        jsx = toCodeResult.jsx
      } else {
        jsx = comWrapper(toCodeResult.jsx, comProps)
      }
      
    } else {
      jsx = comWrapper(`${comInfo.def.namespace} Todo...`, comProps)
    }

    if (typeof params?.itemWrap === 'function') {
      jsx = params.itemWrap({ id: comItem.id, jsx })
    } 

    wrapComAry.push({
      style: comModel.style,
      id: comItem.id,
      jsx
    })

    result += jsx

  })

  if (typeof params?.wrap === 'function') {
    result = params.wrap(wrapComAry)
  } else {
    // 此处做了与 render-web 不同的处理，对于插槽内没有组件的情况，不渲染插槽的wrapper层
    result = result ? slotWrapper({ slotStyle, paramsStyle: params?.style, content: result }) : ''
  }

  return result
}

/**
 * @description 获取组件依赖信息
 * @returns 
 */
function getComDeps (target?: string) {
  const deps: Record<string, string[]> = {}
  const defaultExp: Record<string, string> = {}

  const targetDefaultImport: Record<string, string> = {
    react: `import React from "react"`,
    vue: 'todo'
  }

  let result = targetDefaultImport[target || 'react']

  comMaps.forEach(item => {
    if (item) {
      item?.imports?.forEach((dep: { from: string, coms?: string[], default?: string }) => {
        if (!dep.coms) {
          dep.coms = []
        }

        if (deps[dep.from]) {
          deps[dep.from] = [...new Set([...deps[dep.from], ...dep.coms])]
        } else {
          deps[dep.from] = [...dep.coms]
        }

        if (dep.default) {
          defaultExp[dep.from] = dep.default
        }

      })
    }
  })

  Object.keys(deps).forEach(libKey => {
    const coms = deps[libKey]
    let depsStr = ''

    if (Array.isArray(coms) && coms.length > 0) {
      depsStr = `import { ${coms.join()} } from "${libKey}"`
    }
     
    if (defaultExp[libKey]) {
      depsStr += (depsStr ? '\n' : '' ) + `import ${defaultExp[libKey]} from "${libKey}"`
    }
    
    if (!defaultExp[libKey] && coms.length <= 0 ) {
      depsStr += `import "${libKey}" `
    }

    result += '\n' + depsStr
  })

  return result
}

/**
 * @description 组件根节点
 * @param content 
 * @param comProps 
 * @returns 
 */
function comWrapper (content: string, comProps: any) {
  const style = {
    display: comProps.style.display,
    position: comProps.style.position || "relative",
    ...getSizeStyle(comProps.style),
    ...getMarginStyle(comProps.style)
  }

  if (['fixed', 'absolute'].includes(comProps.style.position)) {
    if (comProps.style.position === "fixed" && comProps.style.fixedY === "bottom") {
      style.bottom = comProps.style.bottom;
    } else if (comProps.style.top) {
      style.top = comProps.style.top;
    }
    if (comProps.style.position === "fixed" && comProps.style.fixedX === "right") {
      style.right = comProps.style.right;
    } else if (comProps.style.left) {
      style.left = comProps.style.left;
    }
    style.zIndex = 1000;
  }

  return `
    <div style={${getObjectStr(style)}}>
      ${content}
    </div>
  `
}

function getSizeStyle(style: any) {
  const sizeStyle: any = {}
  const {width, height} = style

  if (!width) {
    sizeStyle.width = "100%"
  } else if (isNumber(width)) {
    sizeStyle.width = width + "px"
  } else if (width) {
    sizeStyle.width = width
  }

  if (isNumber(height)) {
    sizeStyle.height = height + "px"
  } else if (height) {
    sizeStyle.height = height
  }

  return sizeStyle
}

function getMarginStyle(style: any) {
  const marginStyle: any = {}
  const {
    width,
    marginTop,
    marginLeft,
    marginRight,
    marginBottom
  } = style

  if (isNumber(marginTop)) {
    marginStyle.marginTop = marginTop + "px"
  }
  if (isNumber(marginLeft)) {
    if (typeof width === "number" || marginLeft < 0) {
      marginStyle.marginLeft = marginLeft + "px"
    } else {
      marginStyle.paddingLeft = marginLeft + "px"
    }
  }
  if (isNumber(marginRight)) {
    if (typeof width === "number" || marginRight < 0) {
      marginStyle.marginRight = marginRight + "px"
    } else {
      marginStyle.paddingRight = marginRight + "px"
    }
  }
  if (isNumber(marginBottom)) {
    marginStyle.marginBottom = marginBottom + "px"
  }

  return marginStyle
}

export default {
  generateCode
}