function Game(canvasid) {
  /* Textures */
  this.texturesBank = {
    'fairway':'textures/fairw.png'
  }
  this.texturesToLoad = 1
  /* Properties */
  this.size = {'h':800,'w':800}
  /* Attributes */
  this.player = 0
  this.canvas = document.getElementById(canvasid)
  this.context = this.canvas.getContext('2d')
  this.level = {
    "elements":[{"type":"fairway","path":{"from":[-300,0],"to":[300,0]},"width":40,"closed":true}],
    "starter":{"coords":[-280,0]},
    "hole":{"coords":[280,0],"type":"default"}
  }
  this.players = {0:{'coords':[-280,0],'color':'#0000ff','shot':0}}
  this.club = {'orientation':0,'power':0,'onHold':false,'turning':0,'inMotion':false,'display':true}
  this.move = {'speed':[0,0],'on':0}
  /* DOM */
  this.powerBar = document.getElementById('powerBar')
  /* Event listenning */
  document.onkeydown = (e) => { // Key Down
    switch (e.keyCode) {
      case 32: // Spacebar
        this.club.onHold = true
      break;
      case 81: // Left turn
      case 37:
        this.club.turning = 1
      break;
      case 68: // Right turn
      case 39:
        this.club.turning = -1
      break;
      default:
        console.log(e.keyCode)
    }
  }
  document.onkeyup = (e) => { // Key Up
    switch (e.keyCode) {
      case 32: // Spacebar
        if(this.club.onHold) {
          this.club.onHold = false
          this.club.inMotion = this.club.power
        }
      break;
      case 81: // Left turn
      case 37:
      case 68: // Right turn
      case 39:
        this.club.turning = 0
      break;
    }
  }
  /* Methods */

  // Loads textures and starts game action
  this.loadGame = (then) => {
    for(let text in this.texturesBank) {
      let img = new Image()
      img.src = this.texturesBank[text]
      img.onload = () => {this.texturesToLoad--}
      this.texturesBank[text] = img
    }
    var texturesLoaded = setInterval(() => {
      if(this.texturesToLoad == 0) {
        clearInterval(texturesLoaded)
        then()
      }
    },100)
  }

  // Draws level
  this.draw = (center) => {
    this.context.fillStyle = 'rgba(140,60,10,0.9)'
    this.context.fillRect(0,0,this.size.w,this.size.h)
    // Drawing terrain
    for(let i in this.level.elements) {
      let prop = this.level.elements[i]
      this.drawProp(center,prop)
    }
    // Drawing starter
    if(this.pointInBounds(center,this.level.starter.coords)) {
      this.drawStarter(this.coords2center(center,this.level.starter.coords))
    }
    // Drawing hole
    if(this.pointInBounds(center,this.level.hole.coords)) {
      this.drawHole(this.coords2center(center,this.level.hole.coords))
    }
    // Drawing players
    this.update()
    for(let i in this.players) {
      let player = this.players[i]
      this.drawPlayer(this.coords2center(center,player.coords),player.color)
    }
    // Drawing club
    if(this.club.display)
      this.drawClub(this.coords2center(center,this.players[0].coords),this.club)
  }

  /* Drawing */

  this.drawProp = (center,prop) => {
    if(prop.type == "fairway") {
      let rfl = this.rectFromLine(prop.path,prop.width)
      if(this.inBounds(center,[rfl[0],rfl[3]])) {
        rfl = rfl.map((x) => this.coords2center(center,x))
        this.context.beginPath()
        this.context.moveTo(rfl[0][0],rfl[0][1])
        this.context.lineTo(rfl[1][0],rfl[1][1])
        this.context.lineTo(rfl[2][0],rfl[2][1])
        this.context.lineTo(rfl[3][0],rfl[3][1])
        this.context.fillStyle = this.context.createPattern(this.texturesBank.fairway,'repeat')
        this.context.fill()
      }
    }
  }

  this.drawStarter = (coords) => {
    this.context.lineWidth = 3
    this.context.strokeStyle = 'yellow'
    this.context.beginPath()
    this.context.moveTo(coords[0] - 10,coords[1] - 10)
    this.context.lineTo(coords[0] + 10,coords[1] + 10)
    this.context.moveTo(coords[0] + 10,coords[1] - 10)
    this.context.lineTo(coords[0] - 10,coords[1] + 10)
    this.context.stroke()
  }

  this.drawHole = (coords) => {
    this.context.lineWidth = 1
    this.context.strokeStyle = 'black'
    this.context.beginPath()
    this.context.arc(coords[0],coords[1],15,0,2 * Math.PI)
    this.context.fillStyle = 'black'
    this.context.fill()
    this.context.stroke()
  }

  this.drawPlayer = (coords,color) => {
    this.context.lineWidth = 1
    this.context.strokeStyle = 'black'
    this.context.beginPath()
    this.context.arc(coords[0],coords[1],10,0,2 * Math.PI)
    this.context.fillStyle = color
    this.context.fill()
    this.context.stroke()
  }

  this.drawClub = (ballCoords,club) => {
    this.context.lineWidth = 4
    this.context.strokeStyle = 'black'
    let size = 15
    let distance = (club.inMotion == false) ? club.power + 15 : club.inMotion + 9
    let a = - Math.cos(club.orientation)*distance + ballCoords[0]
    let b = - Math.sin(club.orientation)*distance + ballCoords[1]
    let t = club.orientation + Math.PI/2
    let coords = [Math.cos(t)*size,Math.sin(t)*size]
    this.context.beginPath()
    this.context.moveTo(a + coords[0],b + coords[1])
    this.context.lineTo(a - coords[0],b - coords[1])
    this.context.fillStyle = 'white'
    this.context.fill()
    this.context.stroke()
  }

  /* Geometry */

  this.rectFromLine = (path,width) => {
    let m = width/2
    let x = path.to[0] - path.from[0]
    let y = path.to[1] - path.from[1]
    let t = Math.atan2(y,x)
    let t2 = t + Math.PI/2
    let a = Math.cos(t2)
    let b = Math.sin(t2)
    return [
      [path.from[0] - a*m,path.from[1] - b*m],
      [path.to[0] - a*m,path.to[1] - b*m],
      [path.to[0] + a*m,path.to[1] + b*m],
      [path.from[0] + a*m,path.from[1] + b*m],
    ]
  }

  this.formatRect = (center,rect) => {
    let c = this.coords2center(center,rect[0])
    let w = Math.abs(rect[0][0] - rect[2][0])
    let h = Math.abs(rect[0][1] - rect[2][1])
    return [c[0],c[1],w,h]
  }

  this.coords2center = (center,coords) => {
    let mid = [this.size.w/2,this.size.h/2]
    return [center[0] + coords[0] + mid[0],center[1] + coords[1] + mid[0]]
  }

  // Is point in bound
  this.pointInBounds = (center,point) => {
    let mid = [this.size.w/2,this.size.h/2]
    return (center[0] - mid[0] <= point[0] && center[1] - mid[1] <= point[1])
        && (center[0] + mid[0] >= point[0] && center[1] + mid[1] >= point[1])
  }

  // Should we draw prop based on camera position
  this.inBounds = (center,bounds) => {
    return this.pointInBounds(center,bounds[0])
        || this.pointInBounds(center,bounds[1])
        || this.pointInBounds(center,[bounds[0][0],bounds[1][1]])
        || this.pointInBounds(center,[bounds[1][0],bounds[0][1]])
  }

  /* Physics */

  this.slowDown = (v) => {
    let d = 0.05
    let dd = 0.97
    v = [v[0]*dd,v[1]*dd]
    if(Math.abs(v[0]) < d) v[0] = 0
    if(Math.abs(v[1]) < d) v[1] = 0
    return v
  }

  this.update = () => {
    let c = this.players[this.move.on].coords
    c[0] += this.move.speed[0]
    c[1] += this.move.speed[1]
    this.move.speed = this.slowDown(this.move.speed)
    this.club.display = (this.move.speed[0] == 0 && this.move.speed[1] == 0)
    this.players[this.move.on].coords = c
  }

  this.play = (club) => {
    let p = club.power/3
    this.move.speed = [p*Math.cos(club.orientation) , p*Math.sin(club.orientation)]
  }

  /* Code */

  this.canvas.width  = this.size.w
  this.canvas.height = this.size.h
  this.canvas.style.border = '1px solid black'
  this.loadGame(() => {
    setInterval(() => {
      if(this.club.onHold) {
        this.club.power = (this.club.power + 2) % 100
        this.powerBar.value = this.club.power % 100
      }
      if(this.club.turning != 0) {
        this.club.orientation += 0.03*this.club.turning
      }
      if(this.club.inMotion != false) {
        this.club.inMotion -= 5
        if(this.club.inMotion <= 0) {
          // Putting
          this.play(this.club)
          this.club.power = 0
          this.club.display = false
          this.club.inMotion = 0
          this.onHold = false
        }
      }
      this.draw([0,0])
    },33)
  })
}
