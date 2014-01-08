var HTMLtoJSX = require('./HTMLtoJSX');
var handlebars = require('handlebars');

function convertToJSX(document, src) {
  var converter = new HTMLtoJSX(document, {createClass: false});
  return converter.convert(src);
}

function parseHandlebars(document, src) {
  return handlebars.parse(convertToJSX(document, src));
}

function rewriteHandlebars(document, src) {
  var parsed = parseHandlebars(document, src);

  return parsedToJSX(parsed);
}

function parsedToJSX(parsed) {
  if (parsed.type === 'program') {
    return parsed.statements.map(parsedToJSX).join('');
  } else if (parsed.type === 'content') {
    return parsed.string;
  } else if (parsed.type === 'mustache') {
    // TODO: must be valid js dot expr
    return '{this.props.' + parsed.id.original + '}';
  } else if (parsed.type === 'comment') {
    return '{/* ' + parsed.comment + ' */}';
  } else if (parsed.type === 'block') {
    // .mustasche.id.original and .program
    return (
      '<' + parsed.mustache.id.original + '>' +
        parsedToJSX(parsed.program) +
      '</' + parsed.mustache.id.original + '>'
    );
  }
}

module.exports = {
  convertToJSX: convertToJSX,
  parseHandlebars: parseHandlebars,
  rewriteHandlebars: rewriteHandlebars
};