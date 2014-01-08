var jsdom = require('jsdom');
var ReactBars = require('../lib/ReactBars');

describe('ReactBars', function() {
  it('mostly works... mostly', function() {
    var done = false;

    runs(function() {
      jsdom.env({
        html: "<html><body></body></html>",
        scripts: [],
        done: function (err, window) {
          expect(!!err).toBe(false);
          expect(ReactBars.convertToJSX(window.document, '<ul class="wat">{{#posts}}<li>{{{link_to}}}</li>{{/posts}}</ul>')).toBe(
            '<ul className="wat">{{#posts}}<li>{{{link_to}}}</li>{{/posts}}</ul>\n'
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