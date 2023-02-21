import { getObjectStr } from './utils'

/**
 * @description 插槽根节点
 */
export default function slotWrapper ({ slotStyle, paramsStyle, content }: { slotStyle: any, paramsStyle: any, content: string }) {

  return  `<div style={${getSlotStyle(slotStyle, !!paramsStyle)}}>${content}</div>`
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