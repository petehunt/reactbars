var HTMLtoJSX = require('../lib/HTMLtoJSX');

describe('HTMLtoJSX', function() {
  it('should mostly work... mostly', function() {
    var HELLO_COMPONENT = "\
<!-- Hello world -->\n\
<div class=\"awesome\" style=\"border: 1px solid red\">\n\
  <label for=\"name\">Enter your name: </label>\n\
  <input type=\"text\" id=\"name\" />\n\
</div>\n\
<p>Enter your HTML here</p>\
";
    var converter = new HTMLtoJSX({
      createClass: false
    });
    expect(converter.convert(HELLO_COMPONENT)).toBe('');
  });
});