'use strict';

var Tool = require('../tool');

var InsertRowsTool = Tool.extend({

  name: "insert_rows",

  update: function(surface, sel) {
    this.surface = surface; // IMPORTANT!
    // Set disabled when not a property selection
    if (!surface.isEnabled() || sel.isNull() || !sel.isTableSelection()) {
      return this.setDisabled();
    }
    this.setToolState({
      surface: surface,
      sel: sel,
      disabled: false
    });
  },

  performAction: function(options) {
    this.surface.transaction(function(tx, args) {
      console.log('TODO: insert rows', options);
      return args;
    });
  },

});

module.exports = InsertRowsTool;
