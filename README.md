# Alethia Engine

[Example Project](https://glitch.com/~alethia-game-example)

[GitHub Page](https://github.com/uraikus/alethia-engine)

The Alethia Engine aims to provide a small, simple, and efficient 2 dimensional rendering engine for applications and games.
With essentially only two new types (Scene and Asset), developers do not have to worry about having droves of unutilized features while also having
a simple starting point to build a product designed for the users needs.

Scenes can be created like so:
```
import { Scene } from 'alethia-engine'

let overide = {
  id: 'my-new-scene'
}
let scene = new Scene(overide)
```
Assets can be created like so:
```
import { Asset } from 'alethia-engine'

let overide = {
  x: 50,
  y: 100
}
let asset = new Asset(overide)
```
To create a new Asset type, simply extend the class:
```
import { Asset } from 'alethia-engine'

class Tile extends Asset {
  constructor (sprite, x, y) {
    super({
      sprite: sprite,
      x: x,
      y: y,
      width: 25,
      height: 25,
      solid: false
    })
  }
}
```

## Scene
### Methods
```
  unfollow(): undefined // Stops the camera from following any Asset
  
  follow(asset:Asset): undefined // Makes the scene camera follow an asset on move
  
  addAsset(asset:Asset): undefined // Adds an asset to the scene
  
  scroll(x:Number, y:Number): undefined // Scrolls the scene from relative coordinates
  
  scrollTo(x:Number, y:Number): undefined // Scrolls the scene to fixed coordinates
  
  setScale(z:Number): undefined // Modifies the scale/zoom of the Scene
  
  keyPressed(key:String): Boolean // Returns true if the key is being pressed
```
### Listeners
```
  oncreation(undefined):Function
  
  tickListeners:Object
```
### Properties
```
  elem:Element // See Scriptleaf Element API
  
  state:State // See Scriptleaf State API
  
  floor:Element
  
  background:String
  
  fixedBackground:String
  
  innerWidth:Number
  
  innerHeight:Number
```

## Asset
### Methods
```
  changeSprite(imgURL:String): undefined // Changes DOM Element background to the image.

  move(x:Number, y:Number): undefined // Moves Asset to relative position
  
  place(x:Number, y:Number): undefined // Places Asset at specific point
  
  focus(): undefined // Moves scene camera to focus on Asset
  
  destroyInstance(): undefined // Destroys instance of Asset
  
  getScene(): Scene || false // Returns the Scene Object or false if not attached
  
  rotate(deg:Number): undefined // Rotates DOM Element's transform
```
### Listeners
```
  oncreation(undefined)
  
  ontick(undefined)
  
  ondestroy(undefined)
  
  oncollision(collidedObject:Asset):Boolean // if returns false, overlapping movement will not incur. Default returns false when collision is between two solid Assets.
  
  onselected(undefined)
```
### Properties
```
  elem:Element // See Scriptleaf Element API
  
  state:State // See Scriptleaf State API
  
  scene:Scene
  
  follow:Boolean
  
  moveX:Number // Moves relatively on each tick, after the ontick method fires
  
  moveY:Number // Moves relatively on each tick, after the ontick method fires
  
  x:Number
  
  y:Number
  
  id:String
```