/* eslint-disable no-unused-vars */

module.exports = {
  grabbedNode: node => true, // filter function to specify which nodes are valid to grab and drop into other nodes
  dropTarget: (dropTarget, grabbedNode) => true, // filter function to specify which parent nodes are valid drop targets
  boundingBoxOptions: { // same as https://js.cytoscape.org/#eles.boundingBox, used when calculating if one node is dragged over another
    includeOverlays: false,
    includeLabels: true
  }
};
