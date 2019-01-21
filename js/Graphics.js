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
