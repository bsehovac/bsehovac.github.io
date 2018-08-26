import { extendObject } from './ArrayHelpers.js';

function TouchEvents( element, options ) {

	var t = this;

	options = extendObject( ( ( typeof options !== 'undefined' ) ? options : {} ), {
		touchEvents: true,
		mouseEvents: true,
		useVector: false,
		invertY: false,
		onStart: function () {},
		onDrag: function () {},
		onEnd: function () {},
		move: false,
	} );

	t.options = options;

	t.onStart = options.onStart;
	t.onDrag = options.onDrag;
	t.onEnd = options.onEnd;
	t.onMove = options.onMove;

	t.position = ( typeof options.useVector === 'function' ) ? {
		start: new options.useVector(),
		current: new options.useVector(),
		delta: new options.useVector(),
	} : {
		start: { x: 0, y: 0 },
		current: { x: 0, y: 0 },
		delta: { x: 0, y: 0 },
	};

	t.touch = null;

	t.triggers = {

		start: function ( event ) {

			if ( event.type == 'mousedown' && event.which != 1 ) return;
			if ( event.type == 'touchstart' && event.touches.length > 1 ) return;
			t.getPosition( event, 'start' );
			t.touch = ( event.type == 'touchstart' );
			t.onStart( event, t.position, t.touch );
			window.addEventListener( ( t.touch ) ? 'touchmove' : 'mousemove', t.triggers.drag, false );
			window.addEventListener( ( t.touch ) ? 'touchend' : 'mouseup', t.triggers.end, false );

		},

		drag: function ( event ) {

			event.preventDefault();
			t.getPosition( event, 'current' );
			t.onDrag( event, t.position, t.touch );

		},

		end: function ( event ) {

			t.getPosition( event, 'current' );
			t.onEnd( event, t.position, t.touch );
			window.removeEventListener( ( t.touch ) ? 'touchmove' : 'mousemove', t.triggers.drag, false );
			window.removeEventListener( ( t.touch ) ? 'touchend' : 'mouseup', t.triggers.end, false );

		},

		move: function ( event ) {

			t.getPosition( event );
			t.onMove( event, false );

		},

	};

	 return t;

}

TouchEvents.prototype.init = function ( element ) {

	var t = this;

	t.element = ( typeof element === 'string' )
		? document.querySelector( element )
		: element;

	t.element.addEventListener( 'touchstart', t.triggers.start, false );
	t.element.addEventListener( 'mousedown', t.triggers.start, false );

	if ( typeof t.options.move === 'function' )
		t.element.addEventListener( 'mousemove', t.triggers.move, false );

	return t;

};

TouchEvents.prototype.dispose = function () {

	var t = this;

	t.element.removeEventListener( 'touchstart', t.triggers.start, false );
	t.element.removeEventListener( 'mousedown', t.triggers.start, false );

	if ( typeof t.options.move === 'function' )
		t.element.removeEventListener( 'mousemove', t.triggers.start, false );

	return t;

};

TouchEvents.prototype.getPosition = function ( event, type ) {

	var t = this;
	var offset = t.element.getBoundingClientRect();
	var event = event.touches ? ( event.touches[ 0 ] || event.changedTouches[0] ) : event;

	t.position[ type ].x = event.pageX - offset.left;
	t.position[ type ].y = event.pageY - offset.top;

	if ( type == 'current' ) {

		t.position.delta.x = t.position.current.x - t.position.start.x;
		t.position.delta.y = ( t.position.current.y - t.position.start.y ) * ( t.options.invertY ? - 1 : 1 );

	}

};

TouchEvents.prototype.convertPosition = function ( position ) {

	var t = this;

	position.x = ( position.x / t.element.offsetWidth ) * 2 - 1,
	position.y = ( position.y / t.element.offsetHeight ) * 2 - 1;

	return position;

};

export { TouchEvents };
