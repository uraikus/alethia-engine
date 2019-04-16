import { createElement, State } from 'scriptleaf'
import Scene from './scene.js'
import { assignObject, randID } from './utilities.js'

class Asset {
  constructor (overide) {
    overide = overide || {}
    const defaults = {
      solid: true,
      follow: false,
      speed: 5,
      moveX: 0,
      moveY: 0,
      x: 0,
      y: 0,
      width: 20,
      height: 20,
      style: { position: 'absolute', backgroundSize: 'fill' },
      elem: { className: 'asset' },
      changeSprite: this.changeSprite.bind(this),
      validateMovement: this.validateMovement.bind(this),
      move: this.move.bind(this),
      place: this.place.bind(this),
      render: this.render.bind(this),
      focus: this.focus.bind(this),
      destroyInstance: this.destroyInstance.bind(this),
      getScene: this.getScene.bind(this),
      rotate: this.rotate.bind(this),
      select: this.select.bind(this),
      unselect: this.unselect.bind(this),
      moveTowardsWaypoint: this.moveTowardsWaypoint.bind(this)
    }
    assignObject(this, defaults, overide)
    this.id = this.id || randID()
    this.elem = createElement(Object.assign({ id: this.id }, this.elem))
    assignObject(this.elem.style, this.style)
    delete this.style
    if (this.className) {
      this.elem.className = this.className
      delete this.className
    }
    this.state = new State()
    if (this.getScene() !== false) this.scene.addAsset(this)
    if (typeof this.sprite === 'string') this.changeSprite(this.sprite)
    this.place(this.x, this.y)
    this.elem.addEventListener('mousedown', this.select.bind(this))
  }
  
  oncollision (object) {
    if (this.solid && object.solid) return false
  }
  
  changeSprite (sprite) {
    this.sprite = sprite
    this.elem.style.backgroundImage = `url(${sprite})`
  }

  move (x, y) {
    let scene = this.getScene()
    let newX = this.x + x < 0 ? 0 : this.x + x
    let newY = this.y + y < 0 ? 0 : this.y + y
    if (scene) {
      if (newX + this.width > scene.innerWidth) newX = scene.innerWidth - this.width
      if (newY + this.height > scene.innerHeight) newY = scene.innerHeight - this.height
      if (this.solid && this.validateMovement(newX, newY) === false) return false
    }
    this.place(newX, newY)
  }
  
  validateMovement (coordX, coordY) {
    coordX = Math.round(coordX)
    coordY = Math.round(coordY)
    let scene = this.getScene()
    let xLength = coordX + this.width
    let yLength = coordY + this.height
    for (let x = coordX; x < xLength; x++) {
      for (let y = coordY; y < yLength; y++) {
        let coord = scene.boundary[x][y]
        for (let id in coord) {
          let obj = coord[id]
          if (obj.solid && obj !== this) {
            if (typeof obj.oncollision === 'function') obj.oncollision.bind(obj)(this)
            if (typeof this.oncollision === 'function') {
              if (this.oncollision.bind(this)(obj) === false) return false
            }
          }
        }
      }
    }
    return true
  }
  
  place (newX, newY) {
    newX = Math.round(newX)
    newY = Math.round(newY)
    let scene = this.getScene()
    if (scene) {
      let xLength = this.x + this.width
      let yLength = this.y + this.height
      for (let x = this.x; x < xLength; x++) {
        for (let y = this.y; y < yLength; y++) {
          delete scene.boundary[x][y][this.id]
        }
      }
      xLength = newX + this.width
      yLength = newY + this.height
      for (let x = newX; x < xLength; x++) {
        for (let y = newY; y < yLength; y++) {
          scene.boundary[x][y][this.id] = this
        }
      }
    }
    this.x = newX
    this.y = newY
    this.render()
  }
  
  render () {
    let scene = this.getScene()
    this.elem.style.left = scene ? (scene.scale * this.x) + 'px' : this.x + 'px'
    this.elem.style.top = scene ? (scene.scale * this.y) + 'px' : this.y + 'px'
    this.elem.style.width = scene ? (scene.scale * this.width) + 'px' : this.width + 'px'
    this.elem.style.height = scene ? (scene.scale * this.height) + 'px' : this.height + 'px'
    if (this.follow === true) this.focus()
  }
  
  focus () {
    let scene = this.getScene()
    if (scene === false) return false
    scene.elem.scrollLeft = this.elem.offsetLeft + (this.elem.offsetWidth / 2) - (scene.elem.offsetWidth / 2)
    scene.elem.scrollTop = this.elem.offsetTop + (this.elem.offsetHeight / 2) - (scene.elem.offsetHeight / 2)
  }
  
  destroyInstance () {
    if (typeof this.ondestroy === 'function') this.ondestroy()
    let scene = this.getScene()
    if (scene) {
      if (this.follow) scene.unfollow()
      delete scene.assets[this.id]
    }
    this.elem.deleteElement()
  }
  
  getScene () {
    let scene = this.scene
    if (scene instanceof Scene === false) return false
    return scene
  }
  
  rotate (deg) {
    this.elem.style.transform = `rotate(${deg}deg)`
  }
  
  select () {
    let scene = this.getScene()
    if (scene === false) return false
    scene.selected[this.id] = this
    if (typeof this.onselect === 'function') return this.onselect()
  }
  
  unselect () {
    let scene = this.getScene()
    if (scene === false) return false
    delete scene.selected[this.id]
    if (typeof this.onunselect === 'function') return this.onunselect()
  }
  
  moveTowardsWaypoint () {
    let moveX = 0, moveY = 0
    if (this.waypoint[0] < this.x) {
      let newSpot = this.x - this.speed
      if (newSpot < this.waypoint[0]) moveX = this.waypoint[0] - newSpot
      else if (newSpot > this.waypoint[0]) moveX = this.speed * -1
    } else if (this.waypoint[0] > this.x) {
      let newSpot = this.x + this.speed
      if (newSpot > this.waypoint[0]) moveX = this.waypoint[0] - newSpot
      else if (newSpot < this.waypoint[0]) moveX = this.speed
    }
    if (this.waypoint[1] < this.y) {
      let newSpot = this.y - this.speed
      if (newSpot < this.waypoint[1]) moveY = this.waypoint[1] - newSpot
      else if (newSpot > this.waypoint[1]) moveY = this.speed * -1
    } else if (this.waypoint[1] > this.y) {
      let newSpot = this.y + this.speed
      if (newSpot > this.waypoint[1]) moveY = this.waypoint[1] - newSpot
      else if (newSpot < this.waypoint[1]) moveY = this.speed
    }
    if (Math.round(this.waypoint[0]) === this.x && this.waypoint[1] === Math.round(this.y)) {
      this.place(this.waypoint[0], this.waypoint[1])
      if (typeof this.onwaypointarrival === 'function') {
        let response
        response = this.onwaypointarrival()
        if (Array.isArray(response)) this.waypoint = response
        else if (response !== true) delete this.waypoint
      }
      else delete this.waypoint
    } else {
      this.move(moveX, moveY)
    }
  }
}

export default Asset