var jsdom = require('jsdom');
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
    var done = false;

    runs(function() {
      jsdom.env({
        html: "<html><body></body></html>",
        scripts: [],
        done: function (err, window) {
          expect(!!err).toBe(false);
          var converter = new HTMLtoJSX(window.document, {
            createClass: false
          });
          expect(converter.convert(HELLO_COMPONENT)).toBe(
'<div>\n\
        {/* Hello world */}\n\
        <div className="awesome" style={{border: \'1px solid red\'}}>\n\
          <label htmlFor="name">Enter your name: </label>\n\
          <input type="text" id="name" />\n\
        </div>\n\
        <p>Enter your HTML here</p>\n\
      </div>\n\
'
          );
          done = true;
        }
      });
    });

    waitsFor(function() {
      return done;
    });
  });
});