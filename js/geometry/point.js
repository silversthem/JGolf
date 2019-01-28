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

// If two points are identical
function samePoint(p1,p2) {
  return (p1[0] == p2[0]) && (p1[1] == p2[1])
}
