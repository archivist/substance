var _ = require('../../helpers');

QUnit.assert.isEmpty = function(a, msg) {
  this.push(_.isEmpty(a), false, true, msg);
};

QUnit.assert.isNullOrUndefined = function(a, msg) {
  this.push((a === null)||(a === undefined), false, true, msg);
};

QUnit.assert.isDefinedAndNotNull = function(a, msg) {
  this.push((a !== null)&&(a !== undefined), false, true, msg);
};

QUnit.uiModule = function(name) {
  var hooks = {
    beforeEach: function() {
      if (!window.document.querySelector('#qunit-fixture')) {
        var fixtureElement = window.document.createElement('div');
        fixtureElement.id = "qunit-fixture";
        window.document.querySelector('body').appendChild(fixtureElement);
      }
    },
    afterEach: function() {
    }
  };
  QUnit.module(name, hooks);
};
