const getBounds = (n, boundingBoxOptions) => n.boundingBox(boundingBoxOptions);

const setParent = (n, parent) => n.move({ parent: parent.id() });

const boundsOverlap = (bb1, bb2) => {
  // case: one bb to right of other
  if( bb1.x1 > bb2.x2 ){ return false; }
  if( bb2.x1 > bb1.x2 ){ return false; }

  // case: one bb to left of other
  if( bb1.x2 < bb2.x1 ){ return false; }
  if( bb2.x2 < bb1.x1 ){ return false; }

  // case: one bb above other
  if( bb1.y2 < bb2.y1 ){ return false; }
  if( bb2.y2 < bb1.y1 ){ return false; }

  // case: one bb below other
  if( bb1.y1 > bb2.y2 ){ return false; }
  if( bb2.y1 > bb1.y2 ){ return false; }

  // otherwise, must have some overlap
  return true;
};

// module.exports = { isParent, isChild, getBoundsTuple, boundsOverlap, getBounds, setParent };
module.exports = { boundsOverlap, getBounds, setParent };
