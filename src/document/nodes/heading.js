var TextNode = require('../text_node');

var Heading = TextNode.extend({
  name: "heading",
  properties: {
    "level": "number"
  }
});

// HtmlImporter

Heading.static.blockType = true;

Heading.static.tocType = true;

Heading.static.matchElement = function($el) {
  return /^h\d$/.exec($el[0].tagName.toLowerCase());
};

Heading.static.fromHtml = function($el, converter) {
  var id = converter.defaultId($el, 'heading');
  var heading = {
    id: id,
    level: parseInt(''+$el[0].tagName[1], 10),
    content: ''
  };
  heading.content = converter.annotatedText($el, [id, 'content']);
  return heading;
};

// HtmlExporter

Heading.static.toHtml = function(heading, converter) {
  var id = heading.id;
  var $el = $('<h' + heading.level + '>')
  $el.append(converter.annotatedText([id, 'content']));
  return $el;
};

module.exports = Heading;
