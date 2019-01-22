/*
  Main Level Class
*/

function Level(canvasid,textures,lvldata,updateCallback) {
  /* Properties */
  this.size = {'h':800,'w':800}
  this.texturesBank = textures
  this.level = lvldata
  this.ballSize = 10
  this.holeSize = 15
  /* Attributes */
  this.texturesToLoad = Object.keys(textures).length
  this.canvas = document.getElementById(canvasid)
  this.context = this.canvas.getContext('2d')
  this.players = {}
  this.club = {}
  this.updateData = updateCallback

  /* Methods */

  // Loads textures and starts game action
  this.loadLevel = (then) => {
    // Prep canvas
    this.canvas.width  = this.size.w
    this.canvas.height = this.size.h
    this.canvas.style.border = '1px solid black'
    // Loads texture
    for(let text in this.texturesBank) {
      let img = new Image()
      img.src = this.texturesBank[text]
      img.onload = () => {this.texturesToLoad--}
      this.texturesBank[text] = img
    }
    var texturesLoaded = setInterval(() => {
      if(this.texturesToLoad == 0) {
        clearInterval(texturesLoaded)
        then() // All good
      }
    },100)
  }

  // Updates game data
  this.update = () => {
    let data = updateCallback()
    this.players = data.players
    this.club = data.club
  }

  // Detects if player is in the hole
  this.inHole = (player) => {

  }

  // Detects bouncing on a prop
  this.bounceMotion = (player) => {
    for(let i in this.level.elements) {
      let prop = this.level.elements[i]
      if(prop.type == "fairway") {
        if(prop.closed) { // Fairway with solid borders
          let points = widenPath(prop.path,prop.width)
          // Check if it bounces on a border
          for(let j = 0;j < points.length;j++) {
            let line = [points[j],points[(j + 1) % points.length]]
            if(distance2line(player.coords,line) <= this.ballSize) { // ball touched a border
              if(player.bouncedFrom == undefined || !sameLine(player.bouncedFrom,line)) {
                player.speed = reflect(player.speed,normal(line2vec(line)))
              }
              player.bouncedFrom = line
            }
          }
        }
      }
    }
    return player
  }

  /* Drawing */

  // Draws level
  this.draw = (center) => {
    this.context.fillStyle = 'rgba(140,60,10,0.9)'
    this.context.fillRect(0,0,this.size.w,this.size.h)
    this.update() // Updates level data
    // Drawing terrain
    for(let i in this.level.elements) {
      let prop = this.level.elements[i]
      this.drawProp(center,prop)
    }
    // Drawing starter
    if(pointInBounds(this.size,center,this.level.starter.coords)) {
      this.drawStarter(coords2center(this.size,center,this.level.starter.coords))
    }
    // Drawing hole
    if(pointInBounds(this.size,center,this.level.hole.coords)) {
      this.drawHole(coords2center(this.size,center,this.level.hole.coords))
    }
    // Drawing players
    for(let i in this.players) {
      let player = this.players[i]
      this.drawPlayer(coords2center(this.size,center,player.coords),player.color)
    }
    // Drawing club
    if(this.club.display)
      this.drawClub(coords2center(this.size,center,this.players[0].coords),this.club)
  }

  /* Drawing props */

  // Draw props
  this.drawProp = (center,prop) => {
    if(prop.type == "fairway") { // Simple fairway path
      let path = widenPath(prop.path,prop.width)
      // @TODO : handle closed and curved
      path = path.map((x) => {return coords2center(this.size,center,x)})
      drawTexturedPath(this.context,path,this.texturesBank.fairway)
    }
  }

  // Draws starter
  this.drawStarter = (coords) => {
    drawCross(this.context,coords,10,3,'yellow')
  }

  // Draws hole
  this.drawHole = (coords) => {
    drawCircle(this.context,coords,this.holeSize,1,'black','black')
  }

  // Draws a player ball
  this.drawPlayer = (coords,color) => {
    drawCircle(this.context,coords,this.ballSize,1,color,'black')
  }

  // Draws the club
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
}
