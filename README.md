Cytoscape Groups Demo
================================================================================

## Description

Use cytoscape.js compound nodes to create groups of nodes, including nested groups. Forked from the cytoscape.js-compound-drag-and-drop extension.

### Usage

- Double-click a compound node to put it into "edit mode".
- Single nodes or compound nodes can be dragged onto the compound node to add them.
- Only one node may be dragged into a compound node at a time.
- Cannot add an ancestor to a descendent, or a descendent to an ancestor.

### Caveats

- Deliberately not using a drag listener because of performance concerns. Add one at your own risk.


## Definitions

- **Grabbed node** : The grabbed node is the node that is grabbed by the user (by touch or cursor), which starts the drag-and-drop gesture.
  - A grabbed node may not be selected if multiple nodes are selected.
  - A grabbed node must result in a `true` return value for `options.grabbedNode(node)`.
- **Drop target** : The drop target node is the parent node currently under consideration by the drag-and-drop gesture.
  - A drop target is a compound node.
  - The compound node must be in "edit mode", usually achieved by double-clicking.
  - A drop target must result in a `true` return value for `options.dropTarget(node)`.


## API

Create an instance of the drag-and-drop UI:

```js
const cdnd = cy.cytoscapeGroups(options);
```

The `options` object is outlined below with the default values:

```js
const options = {
  grabbedNode: node => true, // filter function to specify which nodes are valid to grab and drop into other nodes
  dropTarget: (dropTarget, grabbedNode) => true, // filter function to specify which parent nodes are valid drop targets
  boundingBoxOptions: { // same as https://js.cytoscape.org/#eles.boundingBox, used when calculating if one node is dragged over another
    includeOverlays: false,
    includeLabels: true
  }
};
```

There are a number of functions available on the `cdnd` object:

```js
cdnd.disable(); // disables the UI

cdnd.enable(); // re-enables the UI

cdnd.destroy(); // removes the UI
```

## Events

These events are emitted by the extension during its gesture cycle.

- `cdndgrab` : Emitted on a grabbed node that is compatible with the drag-and-drop gesture.
  - `grabbedNode.on('cdndgrab', (event) => {})`
- `cdndover` : Emitted on a grabbed node when it is dragged over another node.
  - `grabbedNode.on('cdndover', (event, dropTarget) => {})`
- `cdnddrop` : Emitted on a grabbed node when it is dropped (freed).
  - `droppedNode.on('cdnddrop', (event, dropTarget) => {})`

For these events:

- `dropTarget` is always the parent node under consideration.

## Classes

These classes are applied to nodes during the gesture cycle.  You can use them in your stylesheet to customise the look of the nodes during different phases of the gesture.

- `cdnd-grabbed-node` : Applied to the grabbed node, until it is dropped.
- `cdnd-drop-target` : Applied to a drop target node, while the grabbed node is over it.

## Build targets

* `npm run build` : Build `./src/**` into `cytoscape-groups.js`
* `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
* `npm run lint` : Run eslint on the source
