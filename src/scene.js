import { createElement, State } from 'scriptleaf'
import { assignObject, multiArray } from './utilities.js'
import Asset from './asset.js'

class Scene {
  constructor (overide) {
    overide = overide || {}
    const defaults = {
      assets: {},
      selected: {},
      scale: 2,
      mouseBox: {},
      innerWidth: 1000,
      innerHeight: 1000,
      tickInterval: 50,
      pressedKeys: [],
      tickListeners: {},
      style: { overflow: 'hidden', width: '100%', height: '100%' },
      id: 'scene',
      elem: {},
      tick: this.tick.bind(this),
      unfollow: this.unfollow.bind(this),
      follow: this.follow.bind(this),
      addAsset: this.addAsset.bind(this),
      scroll: this.scroll.bind(this),
      scrollTo: this.scrollTo.bind(this),
      setScale: this.setScale.bind(this),
      keyPressed: this.keyPressed.bind(this),
      unselectAll: this.unselectAll.bind(this)
    }
    assignObject(this, defaults, overide)
    this.elem.id = this.id
    this.elem = createElement(Object.assign({ id: this.id }, this.elem))
    assignObject(this.elem.style, this.style)
    delete this.style
    delete this.id
    this.state = new State()
    this.floor = createElement({
      style: { width: this.scale * this.innerWidth + 'px', height: this.scale * this.innerHeight + 'px' }
    }, this.elem)
    this.floor.scene = this
    if (typeof this.mouseBox === 'object') {
      let mouseBoxStyle = {
        opacity: '0.5',
        backgroundColor: 'lightblue',
        border: '1px solid blue',
        position: 'absolute',
        display: 'none',
        pointerEvents: 'none',
        zIndex: '1'
      }
      this.mouseBox = createElement(Object.assign({ style: mouseBoxStyle }, this.mouseBox), this.floor)
      this.mouseBox.x = []
      this.mouseBox.y = []
      this.floor.addEventListener('mousedown', ev => {
        this.mouseBox.mouseDown = true
        this.mouseBox.x[0] = ev.offsetX
        this.mouseBox.y[0] = ev.offsetY
      })
      window.addEventListener('mouseup', ev => {
        if (this.mouseBox.mouseDown === true) {
          let boxX = this.mouseBox.x
          let boxY = this.mouseBox.y
          let selected = []
          this.mouseBox.mouseDown = false
          this.unselectAll()
          let startX = Math.round(boxX[0] < boxX[1] ? boxX[0] : boxX[1] / this.scale)
          let startY = Math.round(boxY[0] < boxY[1] ? boxY[0] : boxY[1] / this.scale)
          let endX = Math.round(boxX[0] > boxX[1] ? boxX[0] : boxX[1] / this.scale)
          let endY = Math.round(boxY[0] > boxY[1] ? boxY[0] : boxY[1] / this.scale)
          for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
              for (let o in this.boundary[x][y]) {
                let asset = this.boundary[x][y][o]
                if (selected.includes(asset.id) === false) {
                  selected.push(asset.id)
                  asset.select()
                }
              }
            }
          }
        }
        this.mouseBox.style.display = 'none'
      })
      this.floor.addEventListener('mousemove', ev => {
        this.mouseBox.x[1] = ev.offsetX
        this.mouseBox.y[1] = ev.offsetY
        if (this.mouseBox.mouseDown === true) {
          this.mouseBox.style.display = 'block'
          let { x, y } = this.mouseBox
          let left, top, width, height
          if (x[0] > x[1]) {
            width = x[0] - x[1] + 'px'
            left = x[1] + 'px'
          } else {
            width = x[1] - x[0] + 'px'
            left = x[0] + 'px'
          }
          if (y[0] > y[1]) {
            height = y[0] - y[1] + 'px'
            top = y[1] + 'px'
          } else {
            height = y[1] - y[0] + 'px'
            top = y[0] + 'px'
          }
          this.mouseBox.style.left = left
          this.mouseBox.style.top = top
          this.mouseBox.style.width = width
          this.mouseBox.style.height = height
        }
      }, false)
    }
    if (this.background) this.floor.style.backgroundImage = `url(${this.background})`
    if (this.fixedBackground) this.elem.style.backgroundImage = `url(${this.fixedBackground})`
    if (this.scene && this.follow) this.scene.follow(this)
    window.addEventListener('keydown', ev => {
      if (this.pressedKeys.indexOf(ev.key) === -1) this.pressedKeys.push(ev.key)
    })
    window.addEventListener('keyup', ev => {
      let index = this.pressedKeys.indexOf(ev.key)
      if (ev.key !== -1) this.pressedKeys.splice(index, 1)
    })
    this.boundary = multiArray(this.innerWidth, this.innerHeight)
    if (typeof this.oncreation === 'function') this.oncreation()
    setInterval(this.tick.bind(this), this.tickInterval)
  }
  
  tick () {
    for (let key in this.tickListeners) {
      if (typeof this.tickListeners[key] === 'function') this.tickListeners[key].bind(this)()
      else delete this.tickListeners[key]
    }
    for (let id in this.assets) {
      let asset = this.assets[id]
      if (typeof asset.ontick === 'function') asset.ontick()
      if (asset.moveX || asset.moveY) asset.move(asset.moveX, asset.moveY)
    }
  }
  
  unfollow () {
    if (this.follow['follow']) this.follow['follow'] = false
    this.follow = false
  }
  
  follow (asset) {
    if (asset instanceof Asset === false) return false
    if (this.follow) this.follow['follow'] = false
    this.follow = asset
    asset.scene = this
    asset.follow = true
    asset.focus()
  }
  
  addAsset (asset) {
    if (asset instanceof Asset === false) return false
    this.elem.appendChild(asset.elem)
    asset.scene = this
    this.assets[asset.id] = asset
    asset.place(asset.x, asset.y)
    if (typeof asset.oncreation === 'function') asset.oncreation()
  }
  
  scroll (x, y) {
    if (x) this.scene.elem.scrollLeft += this.scale * x
    if (y) this.scene.elem.scrollTop += this.scale * y
  }
  
  scrollTo (x, y) {
    if (x) this.scene.elem.scrollLeft = this.scale * x
    if (y) this.scene.elem.scrollTop = this.scale * y
  }
  
  setScale (scale) {
    this.scale = scale
    Object.assign(this.floor.style, { width: this.scale * this.innerWidth + 'px', height: this.scale * this.innerHeight + 'px' })
    for (let id in this.assets) {
      this.assets[id].render()
    }
  }
  
  keyPressed (key) {
    return this.pressedKeys.includes(key)
  }
  
  unselectAll () {
    for (let id in this.selected) {
      if (typeof this.selected[id].onunselect === 'function') this.selected[id].unselect()
    }
  }
}

export default Scene