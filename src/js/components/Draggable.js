class Draggable {

  constructor( options ) {

    window.addEventListener( 'touchmove', function () {} );
    document.addEventListener( 'touchmove', function( event ){ event.preventDefault(); }, { passive: false } );

    this.options = Object.assign( {
      vector: false,
      mouseMove: false,
    }, options || {} );

    this.position = ( typeof this.options.vector === 'function' ) ? {
      start: new this.options.vector(),
      current: new this.options.vector(),
      deltaTotal: new this.options.vector(),
      deltaCurrent: new this.options.vector(),
    } : {
      start: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      deltaTotal: { x: 0, y: 0 },
      deltaCurrent: { x: 0, y: 0 },
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
        this.getPosition( event, this.position.start );
        this.getPosition( event, this.position.current );
        this.touch = ( event.type == 'touchstart' );
        this.onStart( event, this.position, this.touch );
        window.addEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.triggers.drag, false );
        window.addEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.triggers.end, false );

      },

      drag: ( event ) => {

        const old = this.position.current.clone();
        this.getPosition( event, this.position.current );
        this.position.deltaTotal = this.position.current.clone().sub( this.position.start );
        this.position.deltaCurrent = this.position.current.clone().sub( old );
        this.onDrag( event, this.position, this.touch );

      },

      end: ( event ) => {

        this.getPosition( event, this.position.current );
        this.onEnd( event, this.position, this.touch );
        window.removeEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.triggers.drag, false );
        window.removeEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.triggers.end, false );

      },

      move: ( event ) => {

        this.getPosition( event, this.position.current );
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

  getPosition( event, position ) {

    const dragEvent = event.touches ? ( event.touches[ 0 ] || event.changedTouches[ 0 ] ) : event;

    position.x = dragEvent.pageX;
    position.y = dragEvent.pageY;

  }

  convertPosition( position ) {

    position.x = ( position.x / this.element.offsetWidth ) * 2 - 1,
    position.y = ( position.y / this.element.offsetHeight ) * 2 - 1;

    return position;

  }

}

export { Draggable };