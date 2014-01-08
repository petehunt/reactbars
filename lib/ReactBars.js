var HTMLtoJSX = require('./HTMLtoJSX');
var handlebars = require('handlebars');
var transform = require('react-tools').transform;

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

function mustacheExprToJS(parsed) {
  if (parsed.type === 'mustache') {
    return mustacheExprToJS(parsed.id);
  } else if (parsed.type === 'STRING') {
    return JSON.stringify(parsed.original);
  }
  // parsed.type === 'ID"
  if (parsed.original === 'this') {
    return '__this';
  }
  return parsed.original;
}

function mustacheIfToJSX(parsed) {
  return (
    '{ ((' +
      mustacheExprToJS(parsed.mustache.params[0]) + ') ? <span>' +
      parsedToJSX(parsed.program) + '</span> : <span>' +
      (parsed.inverse ? parsedToJSX(parsed.inverse) : 'null') + '</span>' +
      ') }'
  );
}

function mustacheUnlessToJSX(parsed) {
  return (
    '{ ((' +
      mustacheExprToJS(parsed.mustache.params[0]) + ') ? null : <span>' +
      parsedToJSX(parsed.program) + '</span>' +
      ') }'
  );
}

function mustacheWithToJSX(parsed) {
  return (
    '{ (function() { with (__this = ' +
      mustacheExprToJS(parsed.mustache.params[0]) + ') { return (<span>' +
      parsedToJSX(parsed.program) + '</span>); }' +
      '}).call(this) }'
  );
}

function mustacheEachToJSXHelper(param, program) {
  return (
    '{ (' +
      mustacheExprToJS(param) + ').map(function(item) { with (__this = item) { return (<span>' +
      parsedToJSX(program) + '</span>); } })' +
      ' }'
  );
}

function mustacheEachToJSX(parsed) {
  return mustacheEachToJSXHelper(parsed.mustache.params[0], parsed.program);
}

function parsedToJSX(parsed) {
  if (parsed.type === 'program') {
    return parsed.statements.map(parsedToJSX).join('');
  } else if (parsed.type === 'content') {
    return parsed.string;
  } else if (parsed.type === 'mustache') {
    if (parsed.id.original === 'log') {
      return '{console.log(' + parsed.params.map(mustacheExprToJS).join(', ') + ')}';
    } else {
      return '{' + mustacheExprToJS(parsed) + '}';
    }
  } else if (parsed.type === 'comment') {
    return '{/* ' + parsed.comment + ' */}';
  } else if (parsed.type === 'block') {
    // .mustasche.id.original and .program
    // params.original
    if (parsed.mustache.id.original === 'if') {
      return mustacheIfToJSX(parsed);
    } else if (parsed.mustache.id.original === 'unless') {
      return mustacheUnlessToJSX(parsed);
    } else if (parsed.mustache.id.original === 'with') {
      return mustacheWithToJSX(parsed);
    } else if (parsed.mustache.id.original === 'each') {
      return mustacheEachToJSX(parsed);
    } else {
      return mustacheEachToJSXHelper(parsed.mustache.id, parsed.program);
    }
  }
}

function compileSrc(document, name, src) {
  var compiled = rewriteHandlebars(document, src);
  return transform('/** @jsx React.DOM */\nvar ' + name + ' = React.createClass({\n  render: function() {\n    with (__this = this.props) { return (' + compiled + ');\n }  }\n});\n');
}

function compile(src, name, React, doc) {
  doc = doc || document;
  name = name || 'ReactBarsComponent';
  return eval(compileSrc(doc, name, src) + ';' + name);
}

module.exports = {
  convertToJSX: convertToJSX,
  parseHandlebars: parseHandlebars,
  rewriteHandlebars: rewriteHandlebars,
  compileSrc: compileSrc,
  compile: compile
};