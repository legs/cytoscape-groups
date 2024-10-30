const {
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
      console.log(`${n.id()} => ${n.isParent() ? `children: ${n.children().map(n => n.id())}` : ""} ${n.isChild() ? `parent: ${n.parent().id()}` : ""}`);
    });
  };

  const isMultiplySelected = n => n.selected() && cy.elements('node:selected').length > 1;
  const canBeGrabbed = n => !isMultiplySelected(n) && options.grabbedNode(n);

  const reset = () => {
    this.grabbedNode.removeClass('cdnd-grabbed-node');
    this.dropTarget.removeClass('cdnd-drop-target');

    this.grabbedNode = cy.collection();
    this.dropTarget = cy.collection();
    this.inGesture = false;
  };

  this.addListener('grab', 'node', e => {
    const node = e.target;

    if( !this.enabled || !canBeGrabbed(node) ){ return; }

    this.inGesture = true;
    this.grabbedNode = node;
    this.dropTarget = cy.collection();

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
    const editMode = document.querySelector('input[name="mode"]:checked').value;
    const targetGroup = e.target;
    if (!targetGroup.isParent()) {
      return;
    }

    const currentEditGrpId = cy.data("redux-grp-editMode-id");
    const currentEditGrp = currentEditGrpId ? cy.$(`#${currentEditGrpId}`) : undefined;
    
    if (currentEditGrp === undefined || currentEditGrp.id() !== targetGroup.id()) {
      targetGroup.addClass(`grp-${editMode}-mode`);
      cy.data("redux-grp-editMode-id", targetGroup.id());
      cy.data("redux-grp-editMode", editMode);
      // currentEditGrp?.removeClass("stuff");  TODO: ancient typescript
      currentEditGrp && currentEditGrp.removeClass("grp-add-mode") && currentEditGrp.removeClass("grp-remove-mode");
    } else {
      currentEditGrp.removeClass("grp-add-mode");
      currentEditGrp.removeClass("grp-remove-mode");
      cy.removeData("redux-grp-editMode-id");
      cy.removeData("redux-grp-editMode");
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
