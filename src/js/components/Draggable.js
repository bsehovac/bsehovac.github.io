class Draggable {

  constructor( options ) {

    this.options = Object.assign( {
      useVector: false,
      invertY: false,
      mouseMove: false,
    }, options || {} );

    this.position = ( typeof this.options.useVector === 'function' ) ? {
      start: new this.options.useVector(),
      current: new this.options.useVector(),
      delta: new this.options.useVector(),
    } : {
      start: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    };

    this.element = null;
    this.touch = null;
    this.onStart = () => {};
    this.onDrag = () => {};
    this.onEnd = () => {};
    this.onMove = () => {};

    this.createTriggers();

    return this;

  }

  createTriggers() {

    this.triggers = {

      start: ( event ) => {

        if ( event.type == 'mousedown' && event.which != 1 ) return;
        if ( event.type == 'touchstart' && event.touches.length > 1 ) return;
        this.getPosition( event, 'start' );
        this.touch = ( event.type == 'touchstart' );
        this.onStart( event, this.position, this.touch );
        window.addEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.triggers.drag, false );
        window.addEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.triggers.end, false );

      },

      drag: ( event ) => {

        this.getPosition( event, 'current' );
        this.onDrag( event, this.position, this.touch );

      },

      end: ( event ) => {

        this.getPosition( event, 'current' );
        this.onEnd( event, this.position, this.touch );
        window.removeEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.triggers.drag, false );
        window.removeEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.triggers.end, false );

      },

      move: ( event ) => {

        this.getPosition( event, 'current' );
        this.onMove( event, this.position, false );

      },

    };

  }

  init( element ) {

    this.element = ( typeof element === 'string' )
      ? document.querySelector( element )
      : element;

    element.addEventListener( 'touchstart', this.triggers.start, false );
    element.addEventListener( 'mousedown', this.triggers.start, false );

    if ( this.options.mouseMove )
      element.addEventListener( 'mousemove', this.triggers.move, false );

    this.element = element;

    return this;

  }

  dispose() {

    this.element.removeEventListener( 'touchstart', this.triggers.start, false );
    this.element.removeEventListener( 'mousedown', this.triggers.start, false );

    if ( this.options.mouseMove )
      this.element.removeEventListener( 'mousemove', this.triggers.start, false );

    return this;

  }

  getPosition( event, type ) {

    const offset = this.element.getBoundingClientRect();
    const dragEvent = event.touches ? ( event.touches[ 0 ] || event.changedTouches[ 0 ] ) : event;

    this.position[ type ].x = dragEvent.pageX - offset.left;
    this.position[ type ].y = dragEvent.pageY - offset.top;

    if ( type == 'current' ) {

      this.position.delta.x = this.position.current.x - this.position.start.x;
      this.position.delta.y = ( this.position.current.y - this.position.start.y ) * ( this.options.invertY ? - 1 : 1 );

    }

  }

  convertPosition( position ) {

    position.x = ( position.x / this.element.offsetWidth ) * 2 - 1,
    position.y = ( position.y / this.element.offsetHeight ) * 2 - 1;

    return position;

  }

}

export { Draggable };
