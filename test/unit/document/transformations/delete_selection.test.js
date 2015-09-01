"use strict";

var sample1 = require('../../../fixtures/sample1');
var containerSample = require('../../../fixtures/container_anno_sample');
var Document = require('../../../../src/document');
var deleteSelection = Document.Transformations.deleteSelection;

QUnit.module('Unit/Substance.Document/Transformations/deleteSelection');

QUnit.test("deleting a property selection", function(assert) {
  var doc = sample1();
  var sel = doc.createSelection({
    type: 'property',
    path: ['p2', 'content'],
    startOffset: 10,
    endOffset: 15
  });
  var args = {selection: sel};
  args = deleteSelection(doc, args);
  assert.equal(doc.get(['p2', 'content']), 'Paragraph annotation', 'Selected text should be deleted.');
  assert.equal(args.selection.start.offset, 10, 'Selection should be collapsed to the left');
});

QUnit.test("deleting a property selection before annotation", function(assert) {
  var doc = sample1();
  var sel = doc.createSelection({
    type: 'property',
    path: ['p2', 'content'],
    startOffset: 0,
    endOffset: 4
  });
  var anno = doc.get('em1');
  var oldStartOffset = anno.startOffset;
  var oldEndOffset = anno.endOffset;
  var args = {selection: sel};
  deleteSelection(doc, args);
  assert.equal(anno.startOffset, oldStartOffset-4, 'Annotation start should be shifted left.');
  assert.equal(anno.endOffset, oldEndOffset-4, 'Annotation end should be shifted left.');
});

QUnit.test("deleting a property selection overlapping annotation start", function(assert) {
  var doc = sample1();
  var sel = doc.createSelection({
    type: 'property',
    path: ['p2', 'content'],
    startOffset: 10,
    endOffset: 20
  });
  var anno = doc.get('em1');
  var args = {selection: sel};
  deleteSelection(doc, args);
  assert.equal(anno.startOffset, 10, 'Annotation start should be shifted left.');
  assert.equal(anno.endOffset, 15, 'Annotation end should be shifted left.');
});

QUnit.test("deleting a property selection overlapping annotation end", function(assert) {
  var doc = sample1();
  var sel = doc.createSelection({
    type: 'property',
    path: ['p2', 'content'],
    startOffset: 20,
    endOffset: 30
  });
  var anno = doc.get('em1');
  var args = {selection: sel};
  deleteSelection(doc, args);
  assert.equal(anno.startOffset, 15, 'Annotation start should not change.');
  assert.equal(anno.endOffset, 20, 'Annotation end should be shifted left.');
});

QUnit.test("deleting a container selection", function(assert) {
  var doc = sample1();
  var sel = doc.createSelection({
    type: 'container',
    containerId: 'main',
    startPath: ['h2', 'content'],
    startOffset: 8,
    endPath: ['p2', 'content'],
    endOffset: 10
  });
  var args = {selection: sel, containerId: 'main'};
  var out = deleteSelection(doc, args);
  var selection = out.selection;
  var anno = doc.get('em1');
  assert.equal(doc.get(['h2', 'content']), "Section with annotation", "Remaining content of p2 should get appended to remains of h2");
  assert.ok(selection.isCollapsed(), 'Selection should be collapsed afterwards.');
  assert.deepEqual(selection.path, ['h2', 'content'], 'Cursor should be in h2.');
  assert.equal(selection.startOffset, 8, 'Cursor should be at the end of h2s remains');
  assert.deepEqual(anno.path, ['h2', 'content'], 'Annotation should have been transferred to h2.');
  assert.deepEqual([anno.startOffset, anno.endOffset], [13, 23], 'Annotation should have been placed correctly.');
});

// QUnit.test("deleting the full document", function(assert) {
//   var doc = sample1();
//   var sel = doc.createSelection({
//     type: 'container',
//     containerId: 'main',
//     startPath: ['h1', 'content'],
//     startOffset: 0,
//     endPath: ['p3', 'content'],
//     endOffset: 11
//   });
//   var args = { selection: sel, containerId: 'main' };
//   var out = deleteSelection(doc, args);
// });

QUnit.test("Edge case: delete container selection spaning multiple nodes containing container annotations", function(assert) {
  // the annotation spans over three nodes
  // we start the selection within the anno in the first text node
  // and expand to the end of the third node
  var doc = containerSample();
  var sel = doc.createSelection({
    type: 'container',
    containerId: 'main',
    startPath: ['p1', 'content'],
    startOffset: 7,
    endPath: ['p3', 'content'],
    endOffset: 10
  });
  var args = { selection: sel, containerId: 'main' };
  var out = deleteSelection(doc, args);
  var selection = out.selection;
  var a1 = doc.get('a1');
  assert.equal(doc.get(['p1', 'content']), "0123456", "Remaining content of p1 should be truncated.");
  assert.ok(selection.isCollapsed(), 'Selection should be collapsed afterwards.');
  assert.deepEqual(a1.endPath, ['p1', 'content'], "Container annotation should be truncated");
  assert.equal(a1.endOffset, 7, "Container annotation should be truncated");
});

QUnit.test("Edge case: delete container selection with 2 fully selected paragraphs", function(assert) {
  // when all nodes under a container selection are covered
  // fully, we want to have a default text type get inserted
  // and the cursor at its first position
  var doc = containerSample();
  var sel = doc.createSelection({
    type: 'container',
    containerId: 'main',
    startPath: ['p2', 'content'],
    startOffset: 0,
    endPath: ['p3', 'content'],
    endOffset: 10
  });
  var args = { selection: sel, containerId: 'main' };
  var out = deleteSelection(doc, args);
  var selection = out.selection;
  assert.ok(selection.isCollapsed(), 'Selection should be collapsed afterwards.');
  assert.equal(selection.startOffset, 0, 'Cursor should be at first position');
  var p = doc.get(selection.path[0]);
  assert.equal(p.type, "paragraph", 'Cursor should be in an empty paragraph');
  assert.equal(p.content.length, 0, 'Paragraph should be empty.');
  assert.equal(doc.get('main').getPosition(p.id), 1);
});
