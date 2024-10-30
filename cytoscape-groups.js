(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeGroups"] = factory();
	else
		root["cytoscapeGroups"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 432:
/***/ ((module) => {

// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }
  srcs.filter(function (src) {
    return src != null;
  }).forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });
  return tgt;
};

/***/ }),

/***/ 590:
/***/ ((module) => {

/* eslint-disable no-unused-vars */

module.exports = {
  grabbedNode: function grabbedNode(node) {
    return true;
  },
  // filter function to specify which nodes are valid to grab and drop into other nodes
  dropTarget: function dropTarget(_dropTarget, grabbedNode) {
    return true;
  },
  // filter function to specify which parent nodes are valid drop targets
  boundingBoxOptions: {
    // same as https://js.cytoscape.org/#eles.boundingBox, used when calculating if one node is dragged over another
    includeOverlays: false,
    includeLabels: true
  }
};

/***/ }),

/***/ 122:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assign = __webpack_require__(432);
var defaults = __webpack_require__(590);
var toggle = __webpack_require__(836);
var listeners = __webpack_require__(263);
var DragAndDrop = function DragAndDrop(cy, options) {
  this.cy = cy;
  this.options = assign({}, defaults, options);
  this.listeners = [];
  this.enabled = true;
  this.addListeners();
};
var destroy = function destroy() {
  this.removeListeners();
};
[toggle, listeners, {
  destroy: destroy
}].forEach(function (def) {
  assign(DragAndDrop.prototype, def);
});
module.exports = function (options) {
  var cy = this;
  return new DragAndDrop(cy, options);
};

/***/ }),

/***/ 263:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _require = __webpack_require__(212),
  getBounds = _require.getBounds,
  boundsOverlap = _require.boundsOverlap,
  setParent = _require.setParent;
var addListener = function addListener(event, selector, callback) {
  this.listeners.push({
    event: event,
    selector: selector,
    callback: callback
  });
  if (selector == null) {
    this.cy.on(event, callback);
  } else {
    this.cy.on(event, selector, callback);
  }
};
var addListeners = function addListeners() {
  var _this = this;
  var options = this.options,
    cy = this.cy;
  var debug = function debug() {
    cy.nodes().forEach(function (n) {
      console.log("".concat(n.id(), " => ").concat(n.isParent() ? "children: ".concat(n.children().map(function (n) {
        return n.id();
      })) : "", " ").concat(n.isChild() ? "parent: ".concat(n.parent().id()) : ""));
    });
  };
  var isMultiplySelected = function isMultiplySelected(n) {
    return n.selected() && cy.elements('node:selected').length > 1;
  };
  var canBeGrabbed = function canBeGrabbed(n) {
    return !isMultiplySelected(n) && options.grabbedNode(n);
  };
  var reset = function reset() {
    _this.grabbedNode.removeClass('cdnd-grabbed-node');
    _this.dropTarget.removeClass('cdnd-drop-target');
    _this.grabbedNode = cy.collection();
    _this.dropTarget = cy.collection();
    _this.inGesture = false;
  };
  this.addListener('grab', 'node', function (e) {
    var node = e.target;
    if (!_this.enabled || !canBeGrabbed(node)) {
      return;
    }
    _this.inGesture = true;
    _this.grabbedNode = node;
    _this.dropTarget = cy.collection();
    _this.grabbedNode.addClass('cdnd-grabbed-node');
    node.emit('cdndgrab');
    debug();
  });
  this.addListener('free', 'node', function () {
    if (!_this.inGesture || !_this.enabled) {
      return;
    }
    var currentEditGrpId = cy.data("redux-grp-editMode-id");
    var currentEditGrp = currentEditGrpId ? cy.$("#".concat(currentEditGrpId)) : undefined;
    if (currentEditGrp &&
    // is there a group in edit mode
    _this.grabbedNode.id() !== currentEditGrp.id() &&
    // prevent adding currentEditGrp into itself
    boundsOverlap(getBounds(_this.grabbedNode, options.boundingBoxOptions), getBounds(currentEditGrp, options.boundingBoxOptions)) &&
    // grabbed node must overlap with currentEditGrp
    _this.grabbedNode.parent().id() !== currentEditGrp.id() &&
    // allow dragging around children within currentEditGrp when in edit mode
    !(currentEditGrp.ancestors() && currentEditGrp.ancestors().some(function (n) {
      return n.id() === _this.grabbedNode.id();
    })) &&
    // prevent moving ancestors into descendants, TODO: ancient typescript
    !(currentEditGrp.descendants() && currentEditGrp.descendants().some(function (n) {
      return n.id() === _this.grabbedNode.id();
    })) // prevent moving descendants into anscestors, TODO: ancient typescript
    ) {
      setParent(_this.grabbedNode, currentEditGrp);
      _this.dropTarget = currentEditGrp;
      _this.grabbedNode.emit('cdndover', currentEditGrp);
    }
    reset();
    var grabbedNode = _this.grabbedNode,
      dropTarget = _this.dropTarget;
    grabbedNode.emit('cdnddrop', dropTarget);
    debug();
  });
  this.addListener('dblclick', 'node', function (e) {
    var editMode = document.querySelector('input[name="mode"]:checked').value;
    var targetGroup = e.target;
    if (!targetGroup.isParent()) {
      return;
    }
    var currentEditGrpId = cy.data("redux-grp-editMode-id");
    var currentEditGrp = currentEditGrpId ? cy.$("#".concat(currentEditGrpId)) : undefined;
    if (currentEditGrp === undefined || currentEditGrp.id() !== targetGroup.id()) {
      targetGroup.addClass("grp-".concat(editMode, "-mode"));
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
var removeListeners = function removeListeners() {
  var cy = this.cy;
  this.listeners.forEach(function (lis) {
    var event = lis.event,
      selector = lis.selector,
      callback = lis.callback;
    if (selector == null) {
      cy.removeListener(event, callback);
    } else {
      cy.removeListener(event, selector, callback);
    }
  });
  this.listeners = [];
};
module.exports = {
  addListener: addListener,
  addListeners: addListeners,
  removeListeners: removeListeners
};

/***/ }),

/***/ 836:
/***/ ((module) => {

function enable() {
  this.enabled = true;
}
function disable() {
  this.enabled = false;
}
module.exports = {
  enable: enable,
  disable: disable
};

/***/ }),

/***/ 212:
/***/ ((module) => {

var getBounds = function getBounds(n, boundingBoxOptions) {
  return n.boundingBox(boundingBoxOptions);
};
var setParent = function setParent(n, parent) {
  return n.move({
    parent: parent.id()
  });
};
var boundsOverlap = function boundsOverlap(bb1, bb2) {
  // case: one bb to right of other
  if (bb1.x1 > bb2.x2) {
    return false;
  }
  if (bb2.x1 > bb1.x2) {
    return false;
  }

  // case: one bb to left of other
  if (bb1.x2 < bb2.x1) {
    return false;
  }
  if (bb2.x2 < bb1.x1) {
    return false;
  }

  // case: one bb above other
  if (bb1.y2 < bb2.y1) {
    return false;
  }
  if (bb2.y2 < bb1.y1) {
    return false;
  }

  // case: one bb below other
  if (bb1.y1 > bb2.y2) {
    return false;
  }
  if (bb2.y1 > bb1.y2) {
    return false;
  }

  // otherwise, must have some overlap
  return true;
};

// module.exports = { isParent, isChild, getBoundsTuple, boundsOverlap, getBounds, setParent };
module.exports = {
  boundsOverlap: boundsOverlap,
  getBounds: getBounds,
  setParent: setParent
};

/***/ }),

/***/ 497:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var impl = __webpack_require__(122);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('core', 'cytoscapeGroups', impl); // register with cytoscape.js
};
if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}
module.exports = register;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(497);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUcsQ0FBQ0ksRUFBRSxHQUFHTCxHQUFHLENBQUNJLEVBQUUsRUFBRTtJQUFFLE9BQU8sS0FBSztFQUFFOztFQUVyQztFQUNBLE9BQU8sSUFBSTtBQUNiLENBQUM7O0FBRUQ7QUFDQS9GLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHO0VBQUVxQyxhQUFhLEVBQWJBLGFBQWE7RUFBRUQsU0FBUyxFQUFUQSxTQUFTO0VBQUVFLFNBQVMsRUFBVEE7QUFBVSxDQUFDOzs7Ozs7O0FDMUJ4RCxJQUFNMEQsSUFBSSxHQUFHMUUsbUJBQU8sQ0FBQyxHQUFvQixDQUFDOztBQUUxQztBQUNBLElBQUkyRSxRQUFRLEdBQUcsU0FBWEEsUUFBUUEsQ0FBYUMsU0FBUyxFQUFFO0VBQ2xDLElBQUksQ0FBQ0EsU0FBUyxFQUFFO0lBQUU7RUFBUSxDQUFDLENBQUM7O0VBRTVCQSxTQUFTLENBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFRixJQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRCxJQUFJLE9BQU9FLFNBQVMsS0FBSyxXQUFXLEVBQUU7RUFBRTtFQUN0Q0QsUUFBUSxDQUFFQyxTQUFVLENBQUM7QUFDdkI7QUFFQW5HLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHaUcsUUFBUTs7Ozs7O1VDYnpCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jeXRvc2NhcGVHcm91cHMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2N5dG9zY2FwZUdyb3Vwcy8uL3NyYy9hc3NpZ24uanMiLCJ3ZWJwYWNrOi8vY3l0b3NjYXBlR3JvdXBzLy4vc3JjL2N5dG9zY2FwZS1ncm91cHMvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vY3l0b3NjYXBlR3JvdXBzLy4vc3JjL2N5dG9zY2FwZS1ncm91cHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vY3l0b3NjYXBlR3JvdXBzLy4vc3JjL2N5dG9zY2FwZS1ncm91cHMvbGlzdGVuZXJzLmpzIiwid2VicGFjazovL2N5dG9zY2FwZUdyb3Vwcy8uL3NyYy9jeXRvc2NhcGUtZ3JvdXBzL3RvZ2dsZS5qcyIsIndlYnBhY2s6Ly9jeXRvc2NhcGVHcm91cHMvLi9zcmMvY3l0b3NjYXBlLWdyb3Vwcy91dGlsLmpzIiwid2VicGFjazovL2N5dG9zY2FwZUdyb3Vwcy8uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9jeXRvc2NhcGVHcm91cHMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY3l0b3NjYXBlR3JvdXBzL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vY3l0b3NjYXBlR3JvdXBzL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9jeXRvc2NhcGVHcm91cHMvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImN5dG9zY2FwZUdyb3Vwc1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJjeXRvc2NhcGVHcm91cHNcIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCAoKSA9PiB7XG5yZXR1cm4gIiwiLy8gU2ltcGxlLCBpbnRlcm5hbCBPYmplY3QuYXNzaWduKCkgcG9seWZpbGwgZm9yIG9wdGlvbnMgb2JqZWN0cyBldGMuXG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiAhPSBudWxsID8gT2JqZWN0LmFzc2lnbi5iaW5kKE9iamVjdCkgOiBmdW5jdGlvbiAodGd0LCAuLi5zcmNzKSB7XG4gIHNyY3MuZmlsdGVyKHNyYyA9PiBzcmMgIT0gbnVsbCkuZm9yRWFjaChzcmMgPT4ge1xuICAgIE9iamVjdC5rZXlzKHNyYykuZm9yRWFjaChrID0+IHRndFtrXSA9IHNyY1trXSk7XG4gIH0pO1xuXG4gIHJldHVybiB0Z3Q7XG59O1xuIiwiLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdyYWJiZWROb2RlOiBub2RlID0+IHRydWUsIC8vIGZpbHRlciBmdW5jdGlvbiB0byBzcGVjaWZ5IHdoaWNoIG5vZGVzIGFyZSB2YWxpZCB0byBncmFiIGFuZCBkcm9wIGludG8gb3RoZXIgbm9kZXNcbiAgZHJvcFRhcmdldDogKGRyb3BUYXJnZXQsIGdyYWJiZWROb2RlKSA9PiB0cnVlLCAvLyBmaWx0ZXIgZnVuY3Rpb24gdG8gc3BlY2lmeSB3aGljaCBwYXJlbnQgbm9kZXMgYXJlIHZhbGlkIGRyb3AgdGFyZ2V0c1xuICBib3VuZGluZ0JveE9wdGlvbnM6IHsgLy8gc2FtZSBhcyBodHRwczovL2pzLmN5dG9zY2FwZS5vcmcvI2VsZXMuYm91bmRpbmdCb3gsIHVzZWQgd2hlbiBjYWxjdWxhdGluZyBpZiBvbmUgbm9kZSBpcyBkcmFnZ2VkIG92ZXIgYW5vdGhlclxuICAgIGluY2x1ZGVPdmVybGF5czogZmFsc2UsXG4gICAgaW5jbHVkZUxhYmVsczogdHJ1ZVxuICB9XG59O1xuIiwiY29uc3QgYXNzaWduID0gcmVxdWlyZSgnLi4vYXNzaWduJyk7XG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcbmNvbnN0IHRvZ2dsZSA9IHJlcXVpcmUoJy4vdG9nZ2xlJyk7XG5jb25zdCBsaXN0ZW5lcnMgPSByZXF1aXJlKCcuL2xpc3RlbmVycycpO1xuXG5jb25zdCBEcmFnQW5kRHJvcCA9IGZ1bmN0aW9uKGN5LCBvcHRpb25zKXtcbiAgdGhpcy5jeSA9IGN5O1xuICB0aGlzLm9wdGlvbnMgPSBhc3NpZ24oe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICB0aGlzLmFkZExpc3RlbmVycygpO1xufTtcblxuY29uc3QgZGVzdHJveSA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMucmVtb3ZlTGlzdGVuZXJzKCk7XG59O1xuXG5bXG4gIHRvZ2dsZSxcbiAgbGlzdGVuZXJzLFxuICB7IGRlc3Ryb3kgfVxuXS5mb3JFYWNoKGRlZiA9PiB7XG4gIGFzc2lnbihEcmFnQW5kRHJvcC5wcm90b3R5cGUsIGRlZik7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgbGV0IGN5ID0gdGhpcztcblxuICByZXR1cm4gbmV3IERyYWdBbmREcm9wKGN5LCBvcHRpb25zKTtcbn07XG4iLCJjb25zdCB7XG4gIGdldEJvdW5kcyxcbiAgYm91bmRzT3ZlcmxhcCxcbiAgc2V0UGFyZW50LFxufSA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5jb25zdCBhZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBzZWxlY3RvciwgY2FsbGJhY2spe1xuICB0aGlzLmxpc3RlbmVycy5wdXNoKHsgZXZlbnQsIHNlbGVjdG9yLCBjYWxsYmFjayB9KTtcblxuICBpZiggc2VsZWN0b3IgPT0gbnVsbCApe1xuICAgIHRoaXMuY3kub24oZXZlbnQsIGNhbGxiYWNrKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmN5Lm9uKGV2ZW50LCBzZWxlY3RvciwgY2FsbGJhY2spO1xuICB9XG59O1xuXG5jb25zdCBhZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpe1xuICBjb25zdCB7IG9wdGlvbnMsIGN5IH0gPSB0aGlzO1xuXG4gIGNvbnN0IGRlYnVnID0gKCkgPT4ge1xuICAgIGN5Lm5vZGVzKCkuZm9yRWFjaChuID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGAke24uaWQoKX0gPT4gJHtuLmlzUGFyZW50KCkgPyBgY2hpbGRyZW46ICR7bi5jaGlsZHJlbigpLm1hcChuID0+IG4uaWQoKSl9YCA6IFwiXCJ9ICR7bi5pc0NoaWxkKCkgPyBgcGFyZW50OiAke24ucGFyZW50KCkuaWQoKX1gIDogXCJcIn1gKTtcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBpc011bHRpcGx5U2VsZWN0ZWQgPSBuID0+IG4uc2VsZWN0ZWQoKSAmJiBjeS5lbGVtZW50cygnbm9kZTpzZWxlY3RlZCcpLmxlbmd0aCA+IDE7XG4gIGNvbnN0IGNhbkJlR3JhYmJlZCA9IG4gPT4gIWlzTXVsdGlwbHlTZWxlY3RlZChuKSAmJiBvcHRpb25zLmdyYWJiZWROb2RlKG4pO1xuXG4gIGNvbnN0IHJlc2V0ID0gKCkgPT4ge1xuICAgIHRoaXMuZ3JhYmJlZE5vZGUucmVtb3ZlQ2xhc3MoJ2NkbmQtZ3JhYmJlZC1ub2RlJyk7XG4gICAgdGhpcy5kcm9wVGFyZ2V0LnJlbW92ZUNsYXNzKCdjZG5kLWRyb3AtdGFyZ2V0Jyk7XG5cbiAgICB0aGlzLmdyYWJiZWROb2RlID0gY3kuY29sbGVjdGlvbigpO1xuICAgIHRoaXMuZHJvcFRhcmdldCA9IGN5LmNvbGxlY3Rpb24oKTtcbiAgICB0aGlzLmluR2VzdHVyZSA9IGZhbHNlO1xuICB9O1xuXG4gIHRoaXMuYWRkTGlzdGVuZXIoJ2dyYWInLCAnbm9kZScsIGUgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBlLnRhcmdldDtcblxuICAgIGlmKCAhdGhpcy5lbmFibGVkIHx8ICFjYW5CZUdyYWJiZWQobm9kZSkgKXsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLmluR2VzdHVyZSA9IHRydWU7XG4gICAgdGhpcy5ncmFiYmVkTm9kZSA9IG5vZGU7XG4gICAgdGhpcy5kcm9wVGFyZ2V0ID0gY3kuY29sbGVjdGlvbigpO1xuXG4gICAgdGhpcy5ncmFiYmVkTm9kZS5hZGRDbGFzcygnY2RuZC1ncmFiYmVkLW5vZGUnKTtcblxuICAgIG5vZGUuZW1pdCgnY2RuZGdyYWInKTtcbiAgICBcbiAgICBkZWJ1ZygpO1xuICB9KTtcblxuICB0aGlzLmFkZExpc3RlbmVyKCdmcmVlJywgJ25vZGUnLCAoKSA9PiB7XG4gICAgaWYoICF0aGlzLmluR2VzdHVyZSB8fCAhdGhpcy5lbmFibGVkICl7IHJldHVybjsgfVxuXG4gICAgY29uc3QgY3VycmVudEVkaXRHcnBJZCA9IGN5LmRhdGEoXCJyZWR1eC1ncnAtZWRpdE1vZGUtaWRcIik7XG4gICAgY29uc3QgY3VycmVudEVkaXRHcnAgPSBjdXJyZW50RWRpdEdycElkID8gY3kuJChgIyR7Y3VycmVudEVkaXRHcnBJZH1gKSA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChcbiAgICAgIGN1cnJlbnRFZGl0R3JwICYmIC8vIGlzIHRoZXJlIGEgZ3JvdXAgaW4gZWRpdCBtb2RlXG4gICAgICB0aGlzLmdyYWJiZWROb2RlLmlkKCkgIT09IGN1cnJlbnRFZGl0R3JwLmlkKCkgJiYgLy8gcHJldmVudCBhZGRpbmcgY3VycmVudEVkaXRHcnAgaW50byBpdHNlbGZcbiAgICAgIGJvdW5kc092ZXJsYXAoZ2V0Qm91bmRzKHRoaXMuZ3JhYmJlZE5vZGUsIG9wdGlvbnMuYm91bmRpbmdCb3hPcHRpb25zKSwgZ2V0Qm91bmRzKGN1cnJlbnRFZGl0R3JwLCBvcHRpb25zLmJvdW5kaW5nQm94T3B0aW9ucykpICYmIC8vIGdyYWJiZWQgbm9kZSBtdXN0IG92ZXJsYXAgd2l0aCBjdXJyZW50RWRpdEdycFxuICAgICAgdGhpcy5ncmFiYmVkTm9kZS5wYXJlbnQoKS5pZCgpICE9PSBjdXJyZW50RWRpdEdycC5pZCgpICYmIC8vIGFsbG93IGRyYWdnaW5nIGFyb3VuZCBjaGlsZHJlbiB3aXRoaW4gY3VycmVudEVkaXRHcnAgd2hlbiBpbiBlZGl0IG1vZGVcbiAgICAgICEoY3VycmVudEVkaXRHcnAuYW5jZXN0b3JzKCkgJiYgY3VycmVudEVkaXRHcnAuYW5jZXN0b3JzKCkuc29tZShuID0+IG4uaWQoKSA9PT0gdGhpcy5ncmFiYmVkTm9kZS5pZCgpKSkgJiYgLy8gcHJldmVudCBtb3ZpbmcgYW5jZXN0b3JzIGludG8gZGVzY2VuZGFudHMsIFRPRE86IGFuY2llbnQgdHlwZXNjcmlwdFxuICAgICAgIShjdXJyZW50RWRpdEdycC5kZXNjZW5kYW50cygpICYmIGN1cnJlbnRFZGl0R3JwLmRlc2NlbmRhbnRzKCkuc29tZShuID0+IG4uaWQoKSA9PT0gdGhpcy5ncmFiYmVkTm9kZS5pZCgpKSkgLy8gcHJldmVudCBtb3ZpbmcgZGVzY2VuZGFudHMgaW50byBhbnNjZXN0b3JzLCBUT0RPOiBhbmNpZW50IHR5cGVzY3JpcHRcbiAgICApIHtcbiAgICAgIHNldFBhcmVudCh0aGlzLmdyYWJiZWROb2RlLCBjdXJyZW50RWRpdEdycCk7XG4gICAgICB0aGlzLmRyb3BUYXJnZXQgPSBjdXJyZW50RWRpdEdycDtcbiAgICAgIHRoaXMuZ3JhYmJlZE5vZGUuZW1pdCgnY2RuZG92ZXInLCBjdXJyZW50RWRpdEdycCk7XG4gICAgfVxuXG4gICAgcmVzZXQoKTtcbiAgICBjb25zdCB7IGdyYWJiZWROb2RlLCBkcm9wVGFyZ2V0IH0gPSB0aGlzO1xuICAgIGdyYWJiZWROb2RlLmVtaXQoJ2NkbmRkcm9wJywgZHJvcFRhcmdldCk7XG4gICAgXG4gICAgZGVidWcoKTtcbiAgfSk7XG4gIFxuICB0aGlzLmFkZExpc3RlbmVyKCdkYmxjbGljaycsICdub2RlJywgKGUpID0+IHtcbiAgICBjb25zdCBlZGl0TW9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJtb2RlXCJdOmNoZWNrZWQnKS52YWx1ZTtcbiAgICBjb25zdCB0YXJnZXRHcm91cCA9IGUudGFyZ2V0O1xuICAgIGlmICghdGFyZ2V0R3JvdXAuaXNQYXJlbnQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRFZGl0R3JwSWQgPSBjeS5kYXRhKFwicmVkdXgtZ3JwLWVkaXRNb2RlLWlkXCIpO1xuICAgIGNvbnN0IGN1cnJlbnRFZGl0R3JwID0gY3VycmVudEVkaXRHcnBJZCA/IGN5LiQoYCMke2N1cnJlbnRFZGl0R3JwSWR9YCkgOiB1bmRlZmluZWQ7XG4gICAgXG4gICAgaWYgKGN1cnJlbnRFZGl0R3JwID09PSB1bmRlZmluZWQgfHwgY3VycmVudEVkaXRHcnAuaWQoKSAhPT0gdGFyZ2V0R3JvdXAuaWQoKSkge1xuICAgICAgdGFyZ2V0R3JvdXAuYWRkQ2xhc3MoYGdycC0ke2VkaXRNb2RlfS1tb2RlYCk7XG4gICAgICBjeS5kYXRhKFwicmVkdXgtZ3JwLWVkaXRNb2RlLWlkXCIsIHRhcmdldEdyb3VwLmlkKCkpO1xuICAgICAgY3kuZGF0YShcInJlZHV4LWdycC1lZGl0TW9kZVwiLCBlZGl0TW9kZSk7XG4gICAgICAvLyBjdXJyZW50RWRpdEdycD8ucmVtb3ZlQ2xhc3MoXCJzdHVmZlwiKTsgIFRPRE86IGFuY2llbnQgdHlwZXNjcmlwdFxuICAgICAgY3VycmVudEVkaXRHcnAgJiYgY3VycmVudEVkaXRHcnAucmVtb3ZlQ2xhc3MoXCJncnAtYWRkLW1vZGVcIikgJiYgY3VycmVudEVkaXRHcnAucmVtb3ZlQ2xhc3MoXCJncnAtcmVtb3ZlLW1vZGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnRFZGl0R3JwLnJlbW92ZUNsYXNzKFwiZ3JwLWFkZC1tb2RlXCIpO1xuICAgICAgY3VycmVudEVkaXRHcnAucmVtb3ZlQ2xhc3MoXCJncnAtcmVtb3ZlLW1vZGVcIik7XG4gICAgICBjeS5yZW1vdmVEYXRhKFwicmVkdXgtZ3JwLWVkaXRNb2RlLWlkXCIpO1xuICAgICAgY3kucmVtb3ZlRGF0YShcInJlZHV4LWdycC1lZGl0TW9kZVwiKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgcmVtb3ZlTGlzdGVuZXJzID0gZnVuY3Rpb24oKXtcbiAgY29uc3QgeyBjeSB9ID0gdGhpcztcblxuICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKGxpcyA9PiB7XG4gICAgY29uc3QgeyBldmVudCwgc2VsZWN0b3IsIGNhbGxiYWNrIH0gPSBsaXM7XG5cbiAgICBpZiggc2VsZWN0b3IgPT0gbnVsbCApe1xuICAgICAgY3kucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3kucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIHNlbGVjdG9yLCBjYWxsYmFjayk7XG4gICAgfVxuICB9KTtcblxuICB0aGlzLmxpc3RlbmVycyA9IFtdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IGFkZExpc3RlbmVyLCBhZGRMaXN0ZW5lcnMsIHJlbW92ZUxpc3RlbmVycyB9O1xuIiwiZnVuY3Rpb24gZW5hYmxlKCl7XG4gIHRoaXMuZW5hYmxlZCA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGRpc2FibGUoKXtcbiAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBlbmFibGUsIGRpc2FibGUgfTtcbiIsImNvbnN0IGdldEJvdW5kcyA9IChuLCBib3VuZGluZ0JveE9wdGlvbnMpID0+IG4uYm91bmRpbmdCb3goYm91bmRpbmdCb3hPcHRpb25zKTtcblxuY29uc3Qgc2V0UGFyZW50ID0gKG4sIHBhcmVudCkgPT4gbi5tb3ZlKHsgcGFyZW50OiBwYXJlbnQuaWQoKSB9KTtcblxuY29uc3QgYm91bmRzT3ZlcmxhcCA9IChiYjEsIGJiMikgPT4ge1xuICAvLyBjYXNlOiBvbmUgYmIgdG8gcmlnaHQgb2Ygb3RoZXJcbiAgaWYoIGJiMS54MSA+IGJiMi54MiApeyByZXR1cm4gZmFsc2U7IH1cbiAgaWYoIGJiMi54MSA+IGJiMS54MiApeyByZXR1cm4gZmFsc2U7IH1cblxuICAvLyBjYXNlOiBvbmUgYmIgdG8gbGVmdCBvZiBvdGhlclxuICBpZiggYmIxLngyIDwgYmIyLngxICl7IHJldHVybiBmYWxzZTsgfVxuICBpZiggYmIyLngyIDwgYmIxLngxICl7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8vIGNhc2U6IG9uZSBiYiBhYm92ZSBvdGhlclxuICBpZiggYmIxLnkyIDwgYmIyLnkxICl7IHJldHVybiBmYWxzZTsgfVxuICBpZiggYmIyLnkyIDwgYmIxLnkxICl7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8vIGNhc2U6IG9uZSBiYiBiZWxvdyBvdGhlclxuICBpZiggYmIxLnkxID4gYmIyLnkyICl7IHJldHVybiBmYWxzZTsgfVxuICBpZiggYmIyLnkxID4gYmIxLnkyICl7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8vIG90aGVyd2lzZSwgbXVzdCBoYXZlIHNvbWUgb3ZlcmxhcFxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8vIG1vZHVsZS5leHBvcnRzID0geyBpc1BhcmVudCwgaXNDaGlsZCwgZ2V0Qm91bmRzVHVwbGUsIGJvdW5kc092ZXJsYXAsIGdldEJvdW5kcywgc2V0UGFyZW50IH07XG5tb2R1bGUuZXhwb3J0cyA9IHsgYm91bmRzT3ZlcmxhcCwgZ2V0Qm91bmRzLCBzZXRQYXJlbnQgfTtcbiIsImNvbnN0IGltcGwgPSByZXF1aXJlKCcuL2N5dG9zY2FwZS1ncm91cHMnKTtcblxuLy8gcmVnaXN0ZXJzIHRoZSBleHRlbnNpb24gb24gYSBjeXRvc2NhcGUgbGliIHJlZlxubGV0IHJlZ2lzdGVyID0gZnVuY3Rpb24oIGN5dG9zY2FwZSApe1xuICBpZiggIWN5dG9zY2FwZSApeyByZXR1cm47IH0gLy8gY2FuJ3QgcmVnaXN0ZXIgaWYgY3l0b3NjYXBlIHVuc3BlY2lmaWVkXG5cbiAgY3l0b3NjYXBlKCAnY29yZScsICdjeXRvc2NhcGVHcm91cHMnLCBpbXBsICk7IC8vIHJlZ2lzdGVyIHdpdGggY3l0b3NjYXBlLmpzXG59O1xuXG5pZiggdHlwZW9mIGN5dG9zY2FwZSAhPT0gJ3VuZGVmaW5lZCcgKXsgLy8gZXhwb3NlIHRvIGdsb2JhbCBjeXRvc2NhcGUgKGkuZS4gd2luZG93LmN5dG9zY2FwZSlcbiAgcmVnaXN0ZXIoIGN5dG9zY2FwZSApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlZ2lzdGVyO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0OTcpO1xuIiwiIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJPYmplY3QiLCJhc3NpZ24iLCJiaW5kIiwidGd0IiwiX2xlbiIsImFyZ3VtZW50cyIsImxlbmd0aCIsInNyY3MiLCJBcnJheSIsIl9rZXkiLCJmaWx0ZXIiLCJzcmMiLCJmb3JFYWNoIiwia2V5cyIsImsiLCJncmFiYmVkTm9kZSIsIm5vZGUiLCJkcm9wVGFyZ2V0IiwiYm91bmRpbmdCb3hPcHRpb25zIiwiaW5jbHVkZU92ZXJsYXlzIiwiaW5jbHVkZUxhYmVscyIsInJlcXVpcmUiLCJkZWZhdWx0cyIsInRvZ2dsZSIsImxpc3RlbmVycyIsIkRyYWdBbmREcm9wIiwiY3kiLCJvcHRpb25zIiwiZW5hYmxlZCIsImFkZExpc3RlbmVycyIsImRlc3Ryb3kiLCJyZW1vdmVMaXN0ZW5lcnMiLCJkZWYiLCJwcm90b3R5cGUiLCJfcmVxdWlyZSIsImdldEJvdW5kcyIsImJvdW5kc092ZXJsYXAiLCJzZXRQYXJlbnQiLCJhZGRMaXN0ZW5lciIsImV2ZW50Iiwic2VsZWN0b3IiLCJjYWxsYmFjayIsInB1c2giLCJvbiIsIl90aGlzIiwiZGVidWciLCJub2RlcyIsIm4iLCJjb25zb2xlIiwibG9nIiwiY29uY2F0IiwiaWQiLCJpc1BhcmVudCIsImNoaWxkcmVuIiwibWFwIiwiaXNDaGlsZCIsInBhcmVudCIsImlzTXVsdGlwbHlTZWxlY3RlZCIsInNlbGVjdGVkIiwiZWxlbWVudHMiLCJjYW5CZUdyYWJiZWQiLCJyZXNldCIsInJlbW92ZUNsYXNzIiwiY29sbGVjdGlvbiIsImluR2VzdHVyZSIsImUiLCJ0YXJnZXQiLCJhZGRDbGFzcyIsImVtaXQiLCJjdXJyZW50RWRpdEdycElkIiwiZGF0YSIsImN1cnJlbnRFZGl0R3JwIiwiJCIsInVuZGVmaW5lZCIsImFuY2VzdG9ycyIsInNvbWUiLCJkZXNjZW5kYW50cyIsImVkaXRNb2RlIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwidmFsdWUiLCJ0YXJnZXRHcm91cCIsInJlbW92ZURhdGEiLCJsaXMiLCJyZW1vdmVMaXN0ZW5lciIsImVuYWJsZSIsImRpc2FibGUiLCJib3VuZGluZ0JveCIsIm1vdmUiLCJiYjEiLCJiYjIiLCJ4MSIsIngyIiwieTIiLCJ5MSIsImltcGwiLCJyZWdpc3RlciIsImN5dG9zY2FwZSJdLCJzb3VyY2VSb290IjoiIn0=