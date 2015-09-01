var Node = require('../node');
var _ = require('../../basics/helpers');

var TableSection = Node.extend({
  name: "table-section",
  properties: {
    "parent": "id",
    "rows": ["array", "id"],
    "sectionType": "string",
  },
  getRows: function() {
    var doc = this.getDocument();
    return _.map(this.rows, function(id) {
      return doc.get(id);
    }, this);
  },
  getRowAt: function(rowIdx) {
    var doc = this.getDocument();
    var rowId = this.rows[rowIdx];
    if (rowId) {
      return doc.get(rowId);
    } else {
      return null;
    }
  },
});

TableSection.static.components = ['rows'];


// HtmlImporter

TableSection.static.matchElement = function($el) {
  return $el.is('thead, tbody, tfoot');
};

TableSection.static.fromHtml = function($el, converter) {
  var tagName = $el[0].tagName.toLowerCase();
  var sectionType = tagName.substring(1);
  var id = converter.defaultId($el, tagName);
  var tableSection = {
    id: id,
    sectionType: sectionType,
    rows: []
  };
  $el.find('tr').each(function() {
    var $row = $(this);
    var rowNode = converter.convertElement($row, { parent: id });
    tableSection.rows.push(rowNode.id);
  });
  return tableSection;
};

TableSection.static.toHtml = function(sec, converter) {
  var id = sec.id;
  var $el = $('<t' + sec.sectionType + '>')
    .attr('id', id);
  _.each(sec.getRows(), function(row) {
    $el.append(row.toHtml(converter));
  });
  return $el;
};

Object.defineProperties(TableSection.prototype, {
  cellNodes: {
    'get': function() {
      return this.getCells();
    }
  }
});

module.exports = TableSection;
