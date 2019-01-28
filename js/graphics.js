// Draws a textured path on a canvas context
function drawTexturedPath(context,coords,textureImg) {
  context.beginPath()
  context.moveTo(coords[0][0],coords[0][1])
  for(let i = 0;i < coords.length;i++) {
    context.lineTo(coords[i][0],coords[i][1])
  }
  context.fillStyle = context.createPattern(textureImg,'repeat')
  context.fill()
}

/* Drawing shapes */

// Draws a cross
function drawCross(context,coords,size,width,color) {
  context.lineWidth = width
  context.strokeStyle = color
  context.beginPath()
  context.moveTo(coords[0] - size,coords[1] - size)
  context.lineTo(coords[0] + size,coords[1] + size)
  context.moveTo(coords[0] + size,coords[1] - size)
  context.lineTo(coords[0] - size,coords[1] + size)
  context.stroke()
}

// Draws a line
function drawLine(context,line,width,color) {
  context.lineWidth = width
  context.strokeStyle = color
  context.beginPath()
  context.moveTo(line[0][0],line[0][1])
  context.lineTo(line[1][0],line[1][1])
  context.stroke()
}

// Draws a circle
function drawCircle(context,coords,radius,lineWidth,fillColor,strokeColor) {
  context.lineWidth = lineWidth
  context.strokeStyle = strokeColor
  context.beginPath()
  context.arc(coords[0],coords[1],radius,0,2 * Math.PI)
  context.fillStyle = fillColor
  context.fill()
  context.stroke()
}
