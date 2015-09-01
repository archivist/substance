'use strict';

var _ = require('./helpers');
var oo = require('./oo');

/**
 * An adapter to access an object via path.
 *
 * @class PathAdapter
 * @module Basics
 * @constructor
 */
function PathAdapter(obj) {
  if (obj) {
    this.root = obj;
  }
}

PathAdapter.Prototype = function() {

  // use this to create extra scope for children ids
  // Example: {
  //   "foo": {
  //      "bar": true
  //      "children": {
  //          "bla": {
  //            "blupp": true
  //          }
  //      }
  //   }
  // }
  this.childrenScope = false;

  this.getRoot = function() {
    return this.root || this;
  };

  this._resolve = function(path, create) {
    var lastIdx = path.length-1;
    var context = this.getRoot();
    for (var i = 0; i < lastIdx; i++) {
      var key = path[i];
      if (context[key] === undefined) {
        if (create) {
          context[key] = {};
          if (this.childrenScope) {
            context[key].children = {};
          }
        } else {
          return undefined;
        }
      }
      context = context[key];
      if (this.childrenScope) {
        context = context.children;
      }
    }
    return context;
  };

  this.get = function(path) {
    if (_.isString(path)) {
      return this[path];
    } else if (!path || path.length === 0) {
      return this.getRoot();
    } else {
      var key = path[path.length-1];
      var context = this._resolve(path);
      if (context) {
        return context[key];
      } else {
        return undefined;
      }
    }
  };

  this.set = function(path, value) {
    if (_.isString(path)) {
      this[path] = value;
    } else {
      var key = path[path.length-1];
      this._resolve(path, true)[key] = value;
    }
  };

  this.delete = function(path, strict) {
    if (_.isString(path)) {
      delete this[path];
    } else {
      var key = path[path.length-1];
      var obj = this._resolve(path);
      if (strict && !obj || !obj[key]) {
        throw new Error('Invalid path.');
      }
      delete obj[key];
    }
  };

  this.clear = function() {
    var root = this.getRoot();
    for (var key in root) {
      if (root.hasOwnProperty(key)) {
        delete root[key];
      }
    }
  };

  this._traverse = function(root, path, fn, ctx) {
    for (var id in root) {
      if (!root.hasOwnProperty(id)) continue;
      if (id !== '__values__') {
        var childPath = path.concat([id]);
        fn.call(ctx, childPath, root[id]);
        this._traverse(root[id], childPath, fn, ctx);
      }
    }
  };

  this.traverse = function(fn, ctx) {
    this._traverse(this.getRoot(), [], fn, ctx);
  };

};

oo.initClass( PathAdapter );

PathAdapter.Arrays = function() {
  PathAdapter.apply(this, arguments);
};

PathAdapter.Arrays.Prototype = function() {

  this.get = function(path) {
    if (_.isString(path)) {
      return this[path];
    } else if (!path || path.length === 0) {
      return this.getRoot();
    } else {
      var key = path[path.length-1];
      var context = this._resolve(path);
      if (context && context[key]) {
        return context[key].__values__;
      } else {
        return undefined;
      }
    }
  };

  this.add = function(path, value) {
    var key = path[path.length-1];
    var context = this._resolve(path, true);
    if (!context[key]) {
      context[key] = {__values__: []};
    }
    var values = context[key].__values__;
    values.push(value);
  };

  this.remove = function(path, value) {
    var values = this.get(path);
    if (values) {
      _.deleteFromArray(values, value);
    } else {
      console.warn('Warning: trying to remove a value for an unknown path.', path, value);
    }
  };

  this.removeAll = function(path) {
    var values = this.get(path);
    values.splice(0, values.length);
  };

  this.set = function() {
    throw new Error('This method is not available for PathAdapter.Arrays');
  };

  this._traverse = function(root, path, fn, ctx) {
    for (var id in root) {
      if (!root.hasOwnProperty(id)) continue;
      if (id === '__values__') {
        fn.call(ctx, path, root.__values__);
      } else {
        var childPath = path.concat([id]);
        this._traverse(root[id], childPath, fn, ctx);
      }
    }
  };

};

oo.inherit(PathAdapter.Arrays, PathAdapter);

module.exports = PathAdapter;
