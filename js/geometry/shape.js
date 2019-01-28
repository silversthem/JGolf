// Returns the first corners of a rectangle centered around a line
function rectFromLine(line,width) {
  let m = width/2
  let x = line[1][0] - line[0][0]
  let y = line[1][1] - line[0][1]
  let t = Math.atan2(y,x)
  let t2 = t + Math.PI/2
  let a = Math.cos(t2)
  let b = Math.sin(t2)
  return [
    [line[0][0] - a*m,line[0][1] - b*m],
    [line[1][0] - a*m,line[1][1] - b*m],
    [line[1][0] + a*m,line[1][1] + b*m],
    [line[0][0] + a*m,line[0][1] + b*m],
  ]
}

// Returns each corner of a wide path
function widenPath(path,width) {
  let front = []
  let back  = []
  for(let i = 0;i < path.length - 1;i++) {
    let rect = rectFromLine([path[i],path[i+1]],width)
    front.push(rect[0],rect[1])
    back.unshift(rect[3])
    back.unshift(rect[2])
  }
  front = front.concat(back)
  for(let i = 0;i < (front.length - 3);i++) {
    let ln  = [front[i],front[i+1]]
    let nln = [front[i+2],front[i+3]]
    let interp = intersection(ln,nln)
    if(!Number.isNaN(interp)) {
      front.splice(i+2,1)
      front[i+1] = interp
    }
  }
  return front
}

// checks if point is in polygon
function inPolygon(polygon,point) {
  let lnodes = 0 // Nodes leftside of point
  let rnodes = 0 // Nodes rightside of point
  for(let i = 0;i < polygon.length;i++) {
    let line = [polygon[i],polygon[(i+1)%polygon.length]]
    if(line[1][1] == point[1]) { // Point is vertically aligned with polygon edge
      if(line[1][0] == point[0]) { // Point is polygon edge -> in polygon
        return true
      } else {
        if(line[1][0] < point[0]) { // Point is rightside of edge
          lnodes++
        } else { // Point is leftside of edge
          rnodes++
        }
        i++ // Skipping next line as well
      }
    }
    else if(onLine(point,line)) {  // Point is on a side -> in polygon
      return true
    }
    else if(inInterval(point[1],[line[0][1],line[1][1]])) {
      let f = lineAsLFunc(line)
      let c = (Number.isNaN(f)) ? line[0][0] : (point[1] - f[1])/f[0] // y = a*x+b <=> x = (y-b)/a || x = a if line is vertical
      if(c < point[0]) {
        lnodes++
      } else {
        rnodes++
      }
    }
  }
  return (lnodes % 2 == 1) && (rnodes % 2 == 1)
}

// Is rect in bounds
function inBounds(b,center,bounds) {
  return this.pointInBounds(b,center,bounds[0])
      || this.pointInBounds(b,center,bounds[1])
      || this.pointInBounds(b,center,[bounds[0][0],bounds[1][1]])
      || this.pointInBounds(b,center,[bounds[1][0],bounds[0][1]])
}
