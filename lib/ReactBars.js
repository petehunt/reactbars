var HTMLtoJSX = require('./HTMLtoJSX');
var handlebars = require('handlebars');

function convertToJSX(document, src) {
  var converter = new HTMLtoJSX(document, {createClass: false});
  var noBarsSrc = src.replace(/\{/g, '(HANDLEBAR OPEN LOL)').replace(/\}/g, '(HANDLEBAR CLOSE LOL)');
  var noBarsJsxSrc = converter.convert(src.replace());
  return noBarsJsxSrc.replace(/\(HANDLEBAR OPEN LOL\)/g, '{').replace(/\(HANDLEBAR CLOSE LOL\)/g, '}');
}

function parseHandlebars(document, src) {
  return handlebars.parse(convertToJSX(document, src));
}

module.exports = {
  convertToJSX: convertToJSX,
  parseHandlebars: parseHandlebars
};