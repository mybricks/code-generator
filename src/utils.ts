
function getObjectStr (obj: any) {
  return JSON.stringify(obj)
}

function isNumber (num: any) {
  return typeof num === "number" && !isNaN(num)
}

export {
  getObjectStr,
  isNumber
}