class Draggable {

  constructor() {

    window.addEventListener( 'touchmove', function () {} );
    document.addEventListener( 'touchmove', function( event ){ event.preventDefault(); }, { passive: false } );

    this.position = {
      start: new THREE.Vector2(),
      current: new THREE.Vector2(),
      delta: new THREE.Vector2(),
      drag: new THREE.Vector2(),
      old: new THREE.Vector2(),
      // momentum: new THREE.Vector2(),
    };

    // this.momentumPoints = [];
    this.element = null;
    this.touch = null;

    this.drag = {

      start: ( event ) => {

        if ( event.type == 'mousedown' && event.which != 1 ) return;
        if ( event.type == 'touchstart' && event.touches.length > 1 ) return;

        this.getPositionCurrent( event );
        this.position.start = this.position.current.clone();
        this.position.delta.set( 0, 0 );
        this.position.drag.set( 0, 0 );
        // this.position.momentum.set( 0, 0 );
        this.touch = ( event.type == 'touchstart' );

        this.onDragStart( this.position );

        window.addEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.drag.move, false );
        window.addEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.drag.end, false );

      },

      move: ( event ) => {

        this.position.old = this.position.current.clone();
        this.getPositionCurrent( event );
        this.position.delta = this.position.current.clone().sub( this.position.old );
        this.position.drag = this.position.current.clone().sub( this.position.start );
        // this.addMomentumPoint( this.position.delta );

        this.onDragMove( this.position );

      },

      end: ( event ) => {

        this.getPositionCurrent( event );
        // this.getMomentum();

        this.onDragEnd( this.position );

        window.removeEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.drag.move, false );
        window.removeEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.drag.end, false );

      },

    };

    this.onDragStart = () => {};
    this.onDragMove = () => {};
    this.onDragEnd = () => {};

    return this;

  }

  init( element ) {

    this.element = element;
    this.element.addEventListener( 'touchstart', this.drag.start, false );
    this.element.addEventListener( 'mousedown', this.drag.start, false );

    return this;

  }

  dispose() {

    this.element.removeEventListener( 'touchstart', this.drag.start, false );
    this.element.removeEventListener( 'mousedown', this.drag.start, false );

    return this;

  }

  getPositionCurrent( event ) {

    const dragEvent = event.touches
      ? ( event.touches[ 0 ] || event.changedTouches[ 0 ] )
      : event;

    this.position.current.set( dragEvent.pageX, dragEvent.pageY );

  }

  convertPosition( position ) {

    position.x = ( position.x / this.element.offsetWidth ) * 2 - 1;
    position.y = ( position.y / this.element.offsetHeight ) * 2 - 1;

    return position;

  }

  // addMomentumPoint( delta ) {

  //   const time = Date.now();

  //   while ( this.momentumPoints.length > 0 ) {

  //     if ( time - this.momentumPoints[0].time <= 200 ) break;
  //     this.momentumPoints.shift();

  //   }

  //   if ( delta !== false ) this.momentumPoints.push( { delta, time } );

  // }

  // getMomentum() {

  //   const points = this.momentumPoints.length;

  //   this.addMomentumPoint( false );

  //   this.momentumPoints.forEach( ( point, index ) => {

  //     this.position.momentum.add( point.delta.multiplyScalar( index / points ) )

  //   } );

  // }

}

export { Draggable };
