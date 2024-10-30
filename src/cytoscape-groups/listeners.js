const {
  isParent, isChild, 
  getBoundsTuple,
  getBounds,
  boundsOverlap,
  setParent,
} = require('./util');

const addListener = function(event, selector, callback){
  this.listeners.push({ event, selector, callback });

  if( selector == null ){
    this.cy.on(event, callback);
  } else {
    this.cy.on(event, selector, callback);
  }
};

const addListeners = function(){
  const { options, cy } = this;

  const debug = () => {
    cy.nodes().forEach(n => {
      console.log(`${n.id()} => ${isParent(n) ? `children: ${n.children().map(n => n.id())}` : ""} ${isChild(n) ? `parent: ${n.parent().id()}` : ""}`);
    });
  };

  const isMultiplySelected = n => n.selected() && cy.elements('node:selected').length > 1;
  const canBeGrabbed = n => !isMultiplySelected(n) && options.grabbedNode(n);
  const canBeDropTarget = n => !isChild(n) && !n.same(this.grabbedNode) && options.dropTarget(n, this.grabbedNode);
  const getBoundTuplesNode = n => getBoundsTuple(n, options.boundingBoxOptions);

  const canBeInBoundsTuple = n => (canBeDropTarget(n)) && !n.same(this.dropTarget);
  const updateBoundsTuples = () => this.boundsTuples = cy.nodes(canBeInBoundsTuple).map(getBoundTuplesNode);

  const reset = () => {
    this.grabbedNode.removeClass('cdnd-grabbed-node');
    this.dropTarget.removeClass('cdnd-drop-target');

    this.grabbedNode = cy.collection();
    this.dropTarget = cy.collection();
    this.dropTargetBounds = null;
    this.boundsTuples = [];
    this.inGesture = false;
  };

  this.addListener('grab', 'node', e => {
    const node = e.target;

    if( !this.enabled || !canBeGrabbed(node) ){ return; }

    this.inGesture = true;
    this.grabbedNode = node;
    this.dropTarget = cy.collection();

    updateBoundsTuples();

    this.grabbedNode.addClass('cdnd-grabbed-node');

    node.emit('cdndgrab');
    debug();
  });

  this.addListener('free', 'node', () => {
    if( !this.inGesture || !this.enabled ){ return; }

    const currentEditGrpId = cy.data("redux-grp-editMode-id");
    const currentEditGrp = currentEditGrpId ? cy.$(`#${currentEditGrpId}`) : undefined;

    if (
      currentEditGrp && // is there a group in edit mode
      this.grabbedNode.id() !== currentEditGrp.id() && // prevent adding currentEditGrp into itself
      boundsOverlap(getBounds(this.grabbedNode, options.boundingBoxOptions), getBounds(currentEditGrp, options.boundingBoxOptions)) && // grabbed node must overlap with currentEditGrp
      this.grabbedNode.parent().id() !== currentEditGrp.id() && // allow dragging around children within currentEditGrp when in edit mode
      !(currentEditGrp.ancestors() && currentEditGrp.ancestors().some(n => n.id() === this.grabbedNode.id())) && // prevent moving ancestors into descendants, TODO: ancient typescript
      !(currentEditGrp.descendants() && currentEditGrp.descendants().some(n => n.id() === this.grabbedNode.id())) // prevent moving descendants into anscestors, TODO: ancient typescript
    ) {
      setParent(this.grabbedNode, currentEditGrp);
      this.dropTarget = currentEditGrp;
      this.grabbedNode.emit('cdndover', currentEditGrp);
    }

    reset();
    const { grabbedNode, dropTarget } = this;
    grabbedNode.emit('cdnddrop', dropTarget);
    
    debug();
  });
  
  this.addListener('dblclick', 'node', (e) => {
    const targetGroup = e.target;
    if (!isParent(targetGroup)) {
      return;
    }

    const currentEditGrpId = cy.data("redux-grp-editMode-id");
    const currentEditGrp = currentEditGrpId ? cy.$(`#${currentEditGrpId}`) : undefined;
    
    if (currentEditGrp === undefined || currentEditGrp.id() !== targetGroup.id()) {
      targetGroup.addClass("grp-edit-mode");
      cy.data("redux-grp-editMode-id", targetGroup.id());
      // currentEditGrp?.removeClass("stuff");  TODO: ancient typescript
      currentEditGrp && currentEditGrp.removeClass("grp-edit-mode");
    } else {
      currentEditGrp.removeClass("grp-edit-mode");
      cy.removeData("redux-grp-editMode-id");
    }
  });
};

const removeListeners = function(){
  const { cy } = this;

  this.listeners.forEach(lis => {
    const { event, selector, callback } = lis;

    if( selector == null ){
      cy.removeListener(event, callback);
    } else {
      cy.removeListener(event, selector, callback);
    }
  });

  this.listeners = [];
};

module.exports = { addListener, addListeners, removeListeners };
