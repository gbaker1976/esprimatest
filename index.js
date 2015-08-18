#!/usr/local/bin/node

var parser = require('esprima');
var formatter = require('escodegen');
var traverser = require('estraverse');
var data = [];
var options = {
        format: {
            indent: {
                style: '  ',
                base: 0,
                adjustMultilineComment: false
            },
            newline: '\n',
            space: ' ',
            json: false,
            renumber: false,
            hexadecimal: false,
            quotes: 'single',
            escapeless: false,
            compact: false,
            parentheses: true,
            semicolons: true,
            safeConcatenation: false
        },
        moz: {
            starlessGenerator: false,
            parenthesizedComprehensionBlock: false,
            comprehensionExpressionStartsWithAssignment: false
        },
        parse: null,
        comment: false,
        sourceMap: undefined,
        sourceMapRoot: null,
        sourceMapWithCode: false,
        file: undefined,
        directive: false,
        verbatim: undefined
    };

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    data.push(chunk);
  } else {
    if ( !data.length ) process.exit();
  }
});

process.stdin.on('end', function() {
  if ( !data.length ) process.exit();

  var ast = parser.parse( data.join('') );

  traverser.replace( ast, {
    leave: function (node, parent) {
        if (node.type == 'VariableDeclaration') {
          if ( node.declarations.length > 1 ) {
            node.declarations.forEach(function( childNode, i ){
              parent.body.unshift({
                type: node.type,
                declarations: [ childNode ],
                kind: node.kind
              });
            });
            this.remove();
          }
        }
    }
  });

  process.stdout.write( formatter.generate( ast, options ) );
});
