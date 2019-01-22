/*
   Main Game Class
*/

function Game(canvasid,playerid) {
  /* Textures */
  this.texturesBank = {
    'fairway':'textures/fairw.png'
  }
  this.levelData = {
    "elements":[
      {"type":"fairway","path":[[-300,-300],[300,-100],[-300,100],[300,300]],"width":80,"closed":true,"curved":true},
      {"type":"water","shape":"polygon","coords":[260,180],"points":[[0,0],[-30,30],[0,60],[30,30]],"curve":15},
      {"type":"obstacle","obstacle":"crate","coords":[260,300]}
    ],
    "starter":{"coords":[-280,-293]},
    "hole":{"coords":[280,293],"type":"default"}
  }
  /* DOM */
  this.powerBar  = document.getElementById('powerBar')
  this.shotCount = document.getElementById('shotCount')
  /* Attributes */
  this.this_player = playerid // This player
  this.current_player = playerid // The player currently playing
  this.level = new Level('GameCanvas',this.texturesBank,this.levelData,() => {
    this.update() // Updates game
    return {'players':this.players,'club':this.club}
  })
  this.players = {0:{'coords':[-280,-293],'color':'#0000ff','shot':0,'speed':[0,0]}} // Players list
  // Club object
  this.club = {'orientation':0.33,'power':0,'onHold':false,'turning':0,'inMotion':false,'display':true}

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

  /* Physics */

  // Emulates friction on a speed vector
  this.slowDown = (v) => {
    let d = 0.05
    let dd = 0.97
    v = [v[0]*dd,v[1]*dd]
    if(Math.abs(v[0]) < d) v[0] = 0
    if(Math.abs(v[1]) < d) v[1] = 0
    return v
  }

  // Updates balls position in level
  this.update = () => {
    /* Collisions & interactions */
    this.players[this.current_player] = this.level.bounceMotion(this.players[this.current_player])
    /* Motion update */
    let pl = this.players[this.current_player]
    let c = pl.coords
    c[0] += pl.speed[0]
    c[1] += pl.speed[1]
    this.players[this.current_player].speed = this.slowDown(pl.speed)
    this.club.display = (this.players[this.current_player].speed[0] == 0 && this.players[this.current_player].speed[1] == 0)
    this.players[this.current_player].coords = c
  }

  // Sets play data
  this.play = (club) => {
    let p = club.power/3
    this.players[this.current_player].bouncedFrom = undefined
    this.players[this.current_player].last_coords = this.players[this.current_player].coords
    this.players[this.current_player].speed = [p*Math.cos(club.orientation) , p*Math.sin(club.orientation)]
  }

  /* Code */

  // Loads level and starts game
  this.level.loadLevel(() => {
    setInterval(() => {
      if(!this.club.inMotion && this.club.display) { // Init shot
        this.powerBar.value = 0
      }
      if(this.club.onHold && this.club.display) { // Loading shot (adding power)
        this.club.power = (this.club.power + 2) % this.powerBar.max
        this.powerBar.value = this.club.power % this.powerBar.max
      }
      if(this.club.turning != 0) { // Adjusting shot angle
        this.club.orientation += 0.03*this.club.turning
      }
      if(this.club.inMotion != false) { // Starting shot animation
        this.club.inMotion -= 5
        if(this.club.inMotion <= 0) { // Shot fired
          this.play(this.club) // Giving ball speed
          // Reset
          this.club.power = 0
          this.club.display = false
          this.club.inMotion = 0
          this.onHold = false
        }
      }
      this.level.draw([0,0]) // Draws level
    },33)
  })
}
