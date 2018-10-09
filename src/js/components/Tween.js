class Tween {

  constructor( options ) {

    this.target = options.target || null;
    this.duration = options.duration || 500;
    this.delay = options.delay || 0;
    this.from = options.from || {};
    this.to = options.to || null;
    this.onComplete = options.onComplete || ( () => {} );
    this.onUpdate = options.onUpdate || ( () => {} );
    this.yoyo = options.yoyo || null;

    if ( typeof options.easing == 'undefined' ) options.easing = t => p; 

    this.easing = ( typeof options.easing !== 'function' ) 
      ? this.constructor.Easings[ options.easing ]
      : options.easing;

    this.progress = 0;
    this.delta = 0;
    this.values = [];

    if ( this.yoyo != null ) this.yoyo = false;

    if ( this.target !== null && this.to !== null ) {

      if ( Object.keys( this.from ).length < 1 ) {

        Object.keys( this.to ).forEach( key => { this.from[ key ] = this.target[ key ]; } );

      }

      Object.keys( this.to ).forEach( key => { this.values.push( key ) } );

    }

    setTimeout( () => {

      this.start = performance.now();
      this.animate = requestAnimationFrame( () => this.update() );

    }, this.delay );

    return this;

  }

  kill() {

    cancelAnimationFrame( this.animate );

  }

  update() {

    const now = performance.now();
    const old = this.progress * 1;
    const delta = now - this.start;

    let progress = delta / this.duration;

    if ( this.yoyo == true ) progress = 1 - progress;

    if ( this.yoyo == null && delta > this.duration - 1000 / 60 ) progress = 1;

    if ( progress >= 1 ) { progress = 1; /*this.progress = 1;*/ }
    else if ( progress <= 0 ) { progress = 0; /*this.progress = 0;*/ }
    this.progress = this.easing( progress );

    this.delta = this.progress - old;

    this.values.forEach( key => {

      this.target[ key ] = this.from[ key ] + ( this.to[ key ] - this.from[ key ] ) * this.progress;

    } );

    this.onUpdate( this );

    if ( progress == 1 || progress == 0 ) {

      if ( this.yoyo != null ) {

        this.yoyo = ! this.yoyo;
        this.start = now;

      } else {

        this.onComplete( this );
        return;

      }

    }

    this.animate = requestAnimationFrame( () => this.update() );

  }

}

var Easing = {

  // Linear 1, Quad 2, Cubic 3, Quart 4, Quint 5

  Power: {

    In: power => {

      power = Math.round( power || 1 );

      return t => Math.pow( t, power );

    },

    Out: power => {

      power = Math.round( power || 1 );

      return t => 1 - Math.abs( Math.pow( t - 1, power ) );

    },

    InOut: power => {

      power = Math.round( power || 1 );

      return t => ( t < 0.5 )
        ? Math.pow( t * 2, power ) / 2
        : ( 1 - Math.abs( Math.pow( ( t * 2 - 1 ) - 1, power ) ) ) / 2 + 0.5;

    },

  },

  Sine: {

    In: () => t => 1 + Math.sin( Math.PI / 2 * t - Math.PI / 2 ),

    Out: () => t => Math.sin( Math.PI / 2 * t ),

    InOut: () => t => ( 1 + Math.sin( Math.PI * t - Math.PI / 2 ) ) / 2,

  },

  // https://greensock.com/ease-visualizer

  Back: {

    Out: s => {

      s = s || 1.70158;

      return t => { return ( t -= 1 ) * t * ( ( s + 1 ) * t + s ) + 1; };

    },

  },

  Elastic: {

    Out: ( amplitude, period ) => {

      let PI2 = Math.PI * 2;

      let p1 = ( amplitude >= 1 ) ? amplitude : 1;
      let p2 = ( period || 0.3 ) / ( amplitude < 1 ? amplitude : 1 );
      let p3 = p2 / PI2 * ( Math.asin( 1 / p1 ) || 0 );

      p2 = PI2 / p2;

      return t => { return p1 * Math.pow( 2, -10 * t ) * Math.sin( ( t - p3 ) * p2 ) + 1 }

    },

  },

}

export { Tween, Easing };