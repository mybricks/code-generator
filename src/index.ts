import codePrettier from './prettier'
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
  const { toJson } = options

  const { slot, coms } = toJson

  // console.log(toJson)

  const slotContentScript = slotContent(slot, coms)

  const importsScript = getComDeps()

  const jsxScript = `export default function () {
    return (
      <div>
        ${slotContentScript}
      </div>
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
function slotContent (slot: ToJsonSlot, coms: any, params?: { wrap: any, itemWrap: any }) {
  let result = ''
  const wrapComAry: { id: string, jsx: string, style: any }[] = []

  slot.comAry.forEach(comItem => {
    const { slots } = comItem
    const comInfo = coms[comItem.id]
    const comModel = comInfo.model
    const slotsProxy = new Proxy(slots || {}, {
      get (target, slotId: string) {
        return {
          render(renderParams: { wrap: any; itemWrap: any }) {
            const slot = slots[slotId]
            if (slot) {
              return slotContent(slot, coms, renderParams)
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
      jsx = comWrapper(toCodeResult.jsx, comProps)
    } else {
      jsx = `<div>${comInfo.def.namespace} Todo...</div>`
    }

    if (typeof params?.itemWrap === 'function') {
      jsx = params.itemWrap({ id: comItem.id, jsx })
    } else {
      jsx = `<div>${jsx}</div>`
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
  }

  return result
}

/**
 * @description 获取组件依赖信息
 * @returns 
 */
function getComDeps () {
  const deps: { [key: string]: string[] } = {}
  const defaultExp: { [key: string]: string } = {}
  let result = `import React from "react"`

  comMaps.forEach(item => {
    if (item) {
      item?.imports?.forEach((dep: { from: string, coms: string[], default?: string }) => {
        if (deps[dep.from]) { // Todo 有覆盖风险
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
      depsStr += (depsStr ? '\n' : '' )+ `import ${defaultExp[libKey]} from "${libKey}"`
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
  return `
    <div style={${getObjectStr(comProps.style)}}>
      ${content}
    </div>
  `
}

function getObjectStr (obj: any) {
  return JSON.stringify(obj)
}

export default {
  generateCode
}