var jsdom = require('jsdom');
var ReactBars = require('../lib/ReactBars');
var React = require('react-tools').React;
var transform = require('react-tools').transform;

var HBS_EXAMPLE = '<ul class="wat">{{#yolo posts}}<li>{{{link_to}}}</li>{{/yolo}}</ul>';

describe('ReactBars', function() {
  it('can convert hbs to jsx without dying completely', function() {
    var done = false;

    runs(function() {
      jsdom.env({
        html: "<html><body></body></html>",
        scripts: [],
        done: function (err, window) {
          expect(!!err).toBe(false);
          expect(ReactBars.convertToJSX(window.document, HBS_EXAMPLE)).toBe(
            '<ul className="wat">{{#yolo posts}}<li>{{{link_to}}}</li>{{/yolo}}</ul>\n'
          );

          done = true;
        }
      });
    });

    waitsFor(function() {
      return done;
    });
  });

  it('can parse hbs', function() {
    var done = false;

    runs(function() {
      jsdom.env({
        html: "<html><body></body></html>",
        scripts: [],
        done: function (err, window) {
          expect(!!err).toBe(false);
          expect(ReactBars.parseHandlebars(window.document, HBS_EXAMPLE).statements.length).toBe(3);
          done = true;
        }
      });
    });

    waitsFor(function() {
      return done;
    });
  });

  it('can do a basic compile', function() {
    var done = false;

    runs(function() {
      jsdom.env({
        html: "<html><body></body></html>",
        scripts: [],
        done: function (err, window) {
          expect(!!err).toBe(false);
          try {
            expect(ReactBars.rewriteHandlebars(window.document, HBS_EXAMPLE)).toBe(
              '<ul className="wat">{ (yolo).map(function(item) { with (__this = item) { return (<span><li>{link_to}</li></span>); } }) }</ul>'
            );
          } catch (e) {
            console.error(e);
          }
          done = true;
        }
      });
    });

    waitsFor(function() {
      return done;
    });
  });

  it('can handle special blocks', function() {
    var done = false;

    var cases = [
      [
        '<h1>{{#if abcd}}hello{{else}}goodbye{{/if}} sup</h1>',
        '<h1>{ ((abcd) ? <span>hello</span> : <span>goodbye</span>) } sup</h1>\n'
      ],
      [
        '<h1>{{#unless abcd}}hello{{/unless}} sup</h1>',
        '<h1>{ ((abcd) ? null : <span>hello</span>) } sup</h1>\n'
      ],
      [
        '<h1>{{log "test test"}}</h1>',
        '<h1>{console.log("test test")}</h1>\n'
      ],
      [
        '<h1>{{#with jonx}} {{asdf}} {{/with}}</h1>',
        '<h1>{ (function() { with (__this = jonx) { return (<span> {asdf} </span>); }}).call(this) }</h1>\n'
      ],
      [
        '<h1>{{#each asdf}} {{item}} {{/each}}</h1>',
        '<h1>{ (asdf).map(function(item) { with (__this = item) { return (<span> {item} </span>); } }) }</h1>\n'
      ]
    ];

    runs(function() {
      jsdom.env({
        html: "<html><body></body></html>",
        scripts: [],
        done: function (err, window) {
          expect(!!err).toBe(false);
          try {
            cases.forEach(function(item) {
              expect(ReactBars.rewriteHandlebars(window.document, item[0])).toBe(item[1]);
              expect(transform.bind(null, '/** @jsx React.DOM */ ' + item[1])).not.toThrow();
            });
          } catch (e) {
            console.error(e);
          }
          done = true;
        }
      });
    });

    waitsFor(function() {
      return done;
    });
  });

  it('should work gosh darn it!', function() {
    var done = false;

    // stolen from http://jsfiddle.net/gazraa/xfWKF/

    var SRC = '<table>\n\
    <thead> \n\
        <th>Name</th> \n\
        <th>Job Title</th> \n\
        <th>Twitter</th> \n\
    </thead> \n\
    <tbody> \n\
        {{#users}} \n\
        <tr> \n\
            <td>{{person.firstName}} {{person.lastName}}</td> \n\
            <td>{{jobTitle}}</td> \n\
            <td><a href="https://twitter.com/{{twitter}}">@{{twitter}}</a></td> \n\
        </tr> \n\
        {{/users}} \n\
    </tbody> \n\
</table> \n\
';

    var DATA = {
      users: [ {
        person: {
          firstName: "Garry",
          lastName: "Finch"
        },
        jobTitle: "Front End Technical Lead",
        twitter: "gazraa"
      }, {
        person: {
          firstName: "Garry",
          lastName: "Finch"
        },
        jobTitle: "Photographer",
        twitter: "photobasics"
      }, {
        person: {
          firstName: "Garry",
          lastName: "Finch"
        },
        jobTitle: "LEGO Geek",
        twitter: "minifigures"
      } ]
    };

    runs(function() {
      jsdom.env({
        html: "<html><body></body></html>",
        scripts: [],
        done: function (err, window) {
          expect(!!err).toBe(false);
          try {
            var template = ReactBars.compile(SRC, 'Template', React, window.document);
            React.renderComponentToString(template(DATA), function(markup) {
              // manually verified in jsfiddle to be correct, also not stable
              expect(markup.length > 0).toBe(true);
              done = true;
            });
          } catch (e) {
            console.error(e);
          }
        }
      });
    });

    waitsFor(function() {
      return done;
    });
  });
});