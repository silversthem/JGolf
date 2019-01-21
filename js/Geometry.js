function rectFromLine(path,width) {
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

function widenPath(path,width) {
  let front = []
  let back  = []
  for(let i = 0;i < path.length - 1;i++) {
    let rect = rectFromLine({'from':path[i],'to':path[i+1]},width)
    front.push(rect[0],rect[1])
    back.unshift(rect[3])
    back.unshift(rect[2])
  }
  return front.concat(back)
}

function formatRect(bounds,center,rect) {
  let c = this.coords2center(bounds,center,rect[0])
  let w = Math.abs(rect[0][0] - rect[2][0])
  let h = Math.abs(rect[0][1] - rect[2][1])
  return [c[0],c[1],w,h]
}

function coords2center(bounds,center,coords) {
  let mid = [bounds.w/2,bounds.h/2]
  return [center[0] + coords[0] + mid[0],center[1] + coords[1] + mid[0]]
}

// Is point in bound
function pointInBounds(bounds,center,point) {
  let mid = [bounds.w/2,bounds.h/2]
  return (center[0] - mid[0] <= point[0] && center[1] - mid[1] <= point[1])
      && (center[0] + mid[0] >= point[0] && center[1] + mid[1] >= point[1])
}

// Should we draw prop based on camera position
function inBounds(b,center,bounds) {
  return this.pointInBounds(b,center,bounds[0])
      || this.pointInBounds(b,center,bounds[1])
      || this.pointInBounds(b,center,[bounds[0][0],bounds[1][1]])
      || this.pointInBounds(b,center,[bounds[1][0],bounds[0][1]])
}

// Returns distance squared between 2 points
function dist2(p1,p2) {
  let x = p1[0] - p2[0]
  let y = p1[1] - p2[1]
  return x*x + y*y
}

// Returns distance between 2 points
function distance(p1,p2) {
  return Math.sqrt(dist2(p1,p2))
}

// Returns the distance between a point and a line
function distance2line(point,line) {
  let l2 = dist2(line[0],line[1])
  if (l2 == 0) return dist2(point,line[0])
  let t = ((point[0] - line[0][0]) * (line[1][0] - line[0][0]) + (point[1] - line[0][1]) * (line[1][1] - line[0][1])) / l2
  t = Math.max(0, Math.min(1,t))
  return distance(point, [line[0][0] + t * (line[1][0] - line[0][0]),line[0][1] + t * (line[1][1] - line[0][1])])
}

function line2vec(line) {
  return [line[1][0] - line[0][0],line[1][1] - line[0][1]]
}

// Returns vector normal (perpendicular) to vector v
function normal(v) {
  let t = Math.atan2(v[1],v[0]) + Math.PI/2
  return [Math.cos(t),Math.sin(t)]
}

// Dot product
function dot(a,b) {
  return a[0]*b[0] + a[1]*b[1]
}

// Reflection
function reflect(v,n) {
  let d = dot(v,n)
  return [v[0] - 2*d*n[0],v[1] - 2*d*n[1]]
}

function samePoint(p1,p2) {
  return (p1[0] == p2[0]) && (p1[1] == p2[1])
}

// Checks if 2 lines are the same
function sameLine(l1,l2) {
  return samePoint(l1[0],l2[0]) && samePoint(l1[1],l2[1])
}

// Returns a,b from line expressed as y = ax+b
function lineAsLFunc(line) {
  let t = line[1][0] - line[0][0]
  let p = line[1][1] - line[0][1]
  let a = p/t  // a = (y' - y)/(x' - x)
  let b = line[0][1] - line[0][0]*a // y = a*x + b <=> y - a*x = b
  return [a,b]
}

// Adds vectors
function translate(v1,v2) {
  return [v1[0] + v2[0],v1[1] + v2[1]]
}

// Returns point at intersection of 2 lines, or undefined if not
function intersection(l1,l2) {
  if(l1[0][0] == l1[1][0]) { // vertical line
    if(l2[0][0] == l2[1][0]) return NaN; // Both vertical
    // Computing intersection
    let f2 = lineAsLFunc(l2)
    let y = f2[0]*l1[0][0] + f2[1]
    // Check if intersection is in bounds
    let ymin = Math.min(l1[0][1],l1[1][1])
    let ymax = Math.max(l1[0][1],l1[1][1])
    if((ymin <= y) && (ymax >= y)) {
      return [l1[0][0],y]
    }
  } else {
    if(l2[0][0] == l2[1][0]) return intersection(l2,l1); // Second line is vertical
    let f1 = lineAsLFunc(l1)
    let f2 = lineAsLFunc(l2)
    if(f1[0] == f2[0]) { // Parallel lines
      return NaN
    } else {
      // find intersection
      let x = (f1[1] - f2[1])/(f2[0] - f1[0])
      let y = f1[0]*x + f1[1]
      // Check if its bounds
      let xmin = Math.min(Math.min(l1[0][0],l1[1][0]),Math.min(l2[0][0],l2[1][0]))
      let xmax = Math.max(Math.max(l1[0][0],l1[1][0]),Math.max(l2[0][0],l2[1][0]))
      if(xmin <= x && x <= xmax) {
        // Returns pair
        return [x,y]
      }
      return NaN
    }
  }
}
