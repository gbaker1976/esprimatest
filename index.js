#!/usr/local/bin/node

var parser = require('esprima');
var formatter = require('escodegen');
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

var recurseOptions = {
	VariableDeclaration: function(){
      // if ( this.declarations ) {
      // 	this.declarations = this.declarations.map(function( node ){
      //     	if ( 'VariableDeclarator' === node.type ) {
      //             node.id.name = "foogle";
      //             node.init.value = "boogle";
      //       }
      //       return node;
      //   });
      // }
      return this;
    }
};

function write( msg ){
	process.stdout.write( msg );
}

function recurse( subtree, options ){
  var node;
  var i;

  options = options || {};

  function processNode( node, opts ){
      if ( !node.type ) return node;
      return (function(n){ return n }).call( node );
  }

  if ( subtree instanceof Array ) {
    for( i = 0; i < subtree.length; i++ ) {
      node = subtree[ i ];
      subtree[ i ] = recurse( node, options );
    }
  } else if ( subtree instanceof Object ) {
    for ( var p in subtree ) {
        if ( subtree.hasOwnProperty( p ) ) {
            node = processNode( subtree[ p ], options );
            subtree[ p ] = recurse( node, options );
        }
    }
  }

  return subtree;
}

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

  var ast = recurse( parser.parse( data.join('') ), recurseOptions );
write(JSON.stringify(ast));
  //write( formatter.generate( ast, options ) );
});
