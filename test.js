(function( doc, win ){

	'use strict';

	var biggles = 'woot';

	var ARTIFACT_TYPE = 'application/vnd.mogul-artifact'

	, list = doc.querySelector( '[data-list]' )
	, editor = doc.querySelector( '[data-editor]' )
	, editorDoc = editor.contentWindow.document
	, getLayoutHTML = function( id ){

		var template = doc.querySelector( 'link[data-layout][rel="import"]#' + id ).import.querySelector( 'template' );

		return template.innerHTML;
	};

	var cells = null;

	var artifacts = [
	{
		name: 'text',
		contentType: 'text/html',
		creator: 'artifacts/text/creator.js',
		icon: 'artifacts/text/icon.svg',
		dropContext: [ 'cell', 'text/html' ],
		data: 'text'
	},
	{
		name: 'image',
		contentType: 'application/json',
		creator: 'artifacts/image/creator.js',
		icon: 'artifacts/image/icon.svg',
		dropContext: [ 'cell', 'text/html', 'canvas' ],
		data: 'image'
	}
	];

	var handleDragStart = function( e ){
		var artifact = artifacts.reduce(
			(function( name ) {
				return function( p, c, i, a ){
					return c.name === name ? c : p;
				}
			})( this.getAttribute( 'data-name' ) )
		);

		this.style.opacity = '0.4';

		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData( ARTIFACT_TYPE, JSON.stringify( artifact ) );
	};

	var handleDragEnd = function( e ){
		this.style.opacity = '';
		this.removeAttribute( 'data-over' );
	};

	var handleDragEnter = function( e ){
		this.style.border = 'solid 2px #000';
	};

	var handleDragOver = function( e ){
		if (e.preventDefault) {
			e.preventDefault();
		}
		e.dataTransfer.dropEffect = 'move';
		this.setAttribute( 'data-over', '' );
	};

	var handleDragLeave = function( e ){
		this.style.border = '';
		this.removeAttribute( 'data-over' );
	};

	var handleDrop = function( e ) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}

		var self = this;
		var payload = JSON.parse( e.dataTransfer.getData( ARTIFACT_TYPE ) );
		var worker = new Worker( payload.creator );

		worker.addEventListener( 'message', function( e ) {
			if ( e.data.event ) {
				switch ( e.data.event ) {
					case 'CONTENT' :
						self.innerHTML += e.data.content;
						worker.postMessage({
							event: 'CONTENT_ADDED'
						});
						break;
						case 'SHOW_UI' :
							showUI.call( self, e.data );
							break;
						}
					}
				}, false );

				worker.postMessage({
					event: 'START'
				});

				this.style.border = '';
				this.removeAttribute( 'data-over' );

				return false;
			};

			var showUI = function( data ){

			};

			editorDoc.querySelector( 'body' ).addEventListener( 'mouseover', function( e ){
				e.target.setAttribute( 'data-active', '' );
			});
			editorDoc.querySelector( 'body' ).addEventListener( 'mouseout', function( e ){
				e.target.removeAttribute( 'data-active' );
			});

			editorDoc.body.innerHTML = getLayoutHTML( 'layout' );;

			cells = editorDoc.querySelectorAll( '[data-cell]' );

			// artifacts.forEach( function( artifact ) {
			// 	var artifactEl = doc.createElement( 'div' );
			// 	var iconEl = doc.createElement( 'img' );
			// 	artifactEl.setAttribute( 'data-item', '' );
			// 	artifactEl.setAttribute( 'draggable', true );
			// 	artifactEl.setAttribute( 'data-name', artifact.name );
			// 	iconEl.src = artifact.icon;
			// 	artifactEl.appendChild( iconEl );
			// 	list.appendChild( artifactEl );
			// 	artifactEl.addEventListener( 'dragstart', handleDragStart, false );
			// 	artifactEl.addEventListener( 'dragend', handleDragEnd, false );
			// });

			[].forEach.call( cells, function( cell ) {
				cell.addEventListener( 'dragenter', handleDragEnter, false );
				cell.addEventListener( 'dragover', handleDragOver, false );
				cell.addEventListener( 'dragleave', handleDragLeave, false );
				cell.addEventListener( 'drop', handleDrop, false );
			});

		})( document, window );
