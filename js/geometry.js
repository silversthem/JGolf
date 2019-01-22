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

// Returns coords relative to box center to draw on
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
      let p = [x,y]
      // Check if in bounds
      if(onLine(p,l1) || onLine(p,l2)) {
        // Returns pair
        return [x,y]
      }
    }
  }
  return NaN
}

// If number is in interval
function inInterval(n,int) {
  return (Math.min(int[0],int[1]) <= n && Math.max(int[0],int[1]) >= n)
}

// If point is on line
function onLine(p,l) {
  return inInterval(p[0],[l[0][0],l[1][0]]) && inInterval(p[1],[l[0][1],l[1][1]])
}
