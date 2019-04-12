import Scene from './scene.js'
import Asset from './asset.js'

function assignObject () {
 let object = arguments[0]
 for (let x = 1; x < arguments.length; x++) {
   for (let key in arguments[x]) {
     let argValue = arguments[x][key]
     if (typeof argValue === 'object' && argValue instanceof Element === false && argValue instanceof Array === false && argValue instanceof Scene === false && argValue instanceof Asset === false) {
       object[key] = {}
       assignObject(object[key], argValue)
     } else object[key] = argValue
   }
 }
}

function randID () {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let randCharacter = characters[Math.floor(Math.random() * 53)]
  return `${randCharacter + Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function multiArray (width, height) {
  let array = []
  for (let x = 0; x < width; x++) {
    array[x] = []
    for (let y = 0; y < height; y++) {
      array[x][y] = {}
    }
  }
  return array
}

export { assignObject, randID, multiArray }