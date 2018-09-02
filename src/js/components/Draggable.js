class Draggable {

  constructor( options ) {

    const draggable = this;

    draggable.options = Object.assign( {
      useVector: false,
      invertY: false,
      mouseMove: false,
    }, options || {} );

    draggable.position = ( typeof draggable.options.useVector === 'function' ) ? {
      start: new draggable.options.useVector(),
      current: new draggable.options.useVector(),
      delta: new draggable.options.useVector(),
    } : {
      start: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    };

    draggable.element = null;
    draggable.touch = null;
    draggable.onStart = () => {};
    draggable.onDrag = () => {};
    draggable.onEnd = () => {};
    draggable.onMove = () => {};

    draggable.createTriggers();

    return draggable;

  }

  createTriggers() {

    const draggable = this;
    const position = draggable.position;
    let touch = draggable.touch;

    draggable.triggers = {

      start: ( event ) => {

        if ( event.type == 'mousedown' && event.which != 1 ) return;
        if ( event.type == 'touchstart' && event.touches.length > 1 ) return;
        draggable.getPosition( event, 'start' );
        touch = ( event.type == 'touchstart' );
        draggable.onStart( event, position, touch );
        window.addEventListener( ( touch ) ? 'touchmove' : 'mousemove', draggable.triggers.drag, false );
        window.addEventListener( ( touch ) ? 'touchend' : 'mouseup', draggable.triggers.end, false );

      },

      drag: ( event ) => {

        draggable.getPosition( event, 'current' );
        draggable.onDrag( event, position, touch );

      },

      end: ( event ) => {

        draggable.getPosition( event, 'current' );
        draggable.onEnd( event, position, touch );
        window.removeEventListener( ( touch ) ? 'touchmove' : 'mousemove', draggable.triggers.drag, false );
        window.removeEventListener( ( touch ) ? 'touchend' : 'mouseup', draggable.triggers.end, false );

      },

      move: ( event ) => {

        console.log('moving');
        draggable.getPosition( event, 'current' );
        draggable.onMove( event, position, false );

      },

    };

  }

  init( element ) {

    const draggable = this;
    const triggers = draggable.triggers;

    draggable.element = ( typeof element === 'string' )
      ? document.querySelector( element )
      : element;

    element.addEventListener( 'touchstart', triggers.start, false );
    element.addEventListener( 'mousedown', triggers.start, false );

    if ( draggable.options.mouseMove )
      element.addEventListener( 'mousemove', triggers.move, false );

    draggable.element = element;

    return draggable;

  }

  dispose() {

    const draggable = this;
    const element = draggable.element;
    const triggers = draggable.triggers;

    element.removeEventListener( 'touchstart', triggers.start, false );
    element.removeEventListener( 'mousedown', triggers.start, false );

    if ( draggable.options.mouseMove )
      element.removeEventListener( 'mousemove', triggers.start, false );

    return draggable;

  }

  getPosition( event, type ) {

    const draggable = this;
    const position = draggable.position;
    const offset = draggable.element.getBoundingClientRect();
    const dragEvent = event.touches ? ( event.touches[ 0 ] || event.changedTouches[ 0 ] ) : event;

    position[ type ].x = dragEvent.pageX - offset.left;
    position[ type ].y = dragEvent.pageY - offset.top;

    if ( type == 'current' ) {

      position.delta.x = position.current.x - position.start.x;
      position.delta.y = ( position.current.y - position.start.y ) * ( draggable.options.invertY ? - 1 : 1 );

    }

  }

  convertPosition( position ) {

    const draggable = this;
    const element = draggable.element;

    position.x = ( position.x / element.offsetWidth ) * 2 - 1,
    position.y = ( position.y / element.offsetHeight ) * 2 - 1;

    return position;

  }

}

export { Draggable };
