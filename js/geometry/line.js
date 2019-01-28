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

// Returns vector as unit vector
function unitvec(line) {
  let vec = line2vec(line)
  let sz = distance(line[0],line[1])
  if(sz == 0) return [0,0];
  return [vec[0]/sz,vec[1]/sz]
}

function scalevec(vec,n) {
  return [vec[0]*n,vec[1]*n]
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

// Returns a,b from line expressed as y = ax+b
function lineAsLFunc(line) {
  let t = line[1][0] - line[0][0]
  let p = line[1][1] - line[0][1]
  if(t == 0) return NaN // Vertical line
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
    let p = [l1[0][0],y]
    // Check if intersection is in bounds
    if(onLine(p,l1) && onLine(p,l2)) {
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
      if(onLine(p,l1) && onLine(p,l2)) {
        // Returns pair
        return p
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
  // def not on line since intervals dont match
  if(!(inInterval(p[0],[l[0][0],l[1][0]]) && inInterval(p[1],[l[0][1],l[1][1]]))) {
    return false
  }
  let f = lineAsLFunc(l) // Expresses l as y = a*x + b
  // Vertical line
  if(Number.isNaN(f)) return (p[0] == l[0][0] && inInterval(p[1],[l[0][1],l[1][1]]))
  // Checking if a*p.x + b = p.y
  return (f[0]*p[0] + f[1]) == p[1]
}

// Checks if 2 lines are the same
function sameLine(l1,l2) {
  return samePoint(l1[0],l2[0]) && samePoint(l1[1],l2[1])
}
