import { getObjectStr } from './utils'
import { tagTranslate } from './tagTranslate'
import { TargetType }  from './index'

/**
 * @description 插槽根节点
 */
export default function slotWrapper ({ target, slotStyle, paramsStyle, content }: { target: TargetType, slotStyle: any, paramsStyle: any, content: string }) {

  const divTagName = tagTranslate[target].div

  return  `<${divTagName} style={${getSlotStyle(slotStyle, !!paramsStyle)}}>${content}</${divTagName}>`
}

function getSlotStyle (slotStyle: { layout: string, alignItems: string, justifyContent: string, [key: string]: string }, hasParamsStyle: boolean) {
  const {
    paddingLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    background,
    ...otherStyle
  } = slotStyle;

  let style: { [key: string]: string } = {
    width: '100%',
    height: '100%',
    position: 'relative',
    paddingLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    background
  }

  const justifyContentStyles: { [key: string]: string }  = {
    ['FLEX-START']: 'flex-start',
    CENTER: 'center',
    ['FLEX-END']: 'flex-end',
    ['SPACE-AROUND']: 'space-around',
    ['SPACE-BETWEEN']: 'space-between'
  }

  const alignItemsStyles: { [key: string]: string }  = {
    ['FLEX-START']: 'flex-start',
    CENTER: 'center',
    ['FLEX-END']: 'flex-end'
  }

  const layoutStyles: { [key: string]: any } = {
    ['flex-column']: {
      display: 'flex',
      flexDirection: 'column'
    },
    ['flex-row']: {
      display: 'flex',
      flexDirection: 'row'
    }
  }

  if (slotStyle) {
    const { layout, alignItems, justifyContent } = slotStyle
    if (layout) {
      if (layoutStyles[layout.toLowerCase()]) {
        style = {
          ...style,
          ...layoutStyles[layout.toLowerCase()]
        }
      }
    }

    if (alignItems) {
      if (alignItemsStyles[alignItems.toUpperCase()]) {
        style['alignItems'] = alignItemsStyles[alignItems.toUpperCase()]
      }
    }

    if (justifyContent) {
      if (justifyContentStyles[justifyContent.toUpperCase()]) {
        style['justifyContent'] = justifyContentStyles[justifyContent.toUpperCase()]
      }
    }
  }

  if (hasParamsStyle) {
    style = Object.assign(style, otherStyle)
  }

  return getObjectStr(style)
}