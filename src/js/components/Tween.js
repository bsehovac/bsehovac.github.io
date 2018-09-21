class Tween {

  constructor( options ) {

    this.target = options.target || null;
    this.duration = options.duration || 500;
    this.delay = options.delay || 0;
    this.easing = options.easing || 'linear';
    this.from = options.from || {};
    this.to = options.to || null;
    this.onComplete = options.onComplete || ( () => {} );
    this.onUpdate = options.onUpdate || ( () => {} );

    this.start = Date.now();
    this.progress = 0;
    this.animate = null;
    this.values = [];

    if ( Object.keys( this.from ).length < 1 )
      Object.keys( this.to ).forEach( key => { this.from[ key ] = this.target[ key ]; } );

    Object.keys( this.to ).forEach( key => { this.values.push( key ) } );

    this.animate = window.requestAnimationFrame( () => this.update() );

    return this;

  }

  kill() {

    window.cancelAnimationFrame( this.animate );

  }

  update() {

    this.progress = ( Date.now() - this.start ) / this.duration;

    if ( this.progress >= 1 ) this.progress = 1;

    const current = this.constructor.Easings[ this.easing ]( this.progress );

    this.values.forEach( key => {

      this.target[ key ] = this.from[ key ] + ( this.to[ key ] - this.from[ key ] ) * current;

    } );

    this.onUpdate( current );

    if ( this.progress == 1 ) {

      this.onComplete();

    } else {

      this.animate = window.requestAnimationFrame( () => this.update() );

    }

  }

}

Tween.Easings = {

  linear: t => { return t; },
  easeInQuad: t => { return t * t; },
  easeOutQuad: t => { return t * ( 2 - t ); },
  easeInOutQuad: t => { return t < .5 ? 2 * t * t : - 1 + ( 4 - 2 * t ) * t; },
  easeInCubic: t => { return t * t * t; },
  easeOutCubic: t => { return ( -- t ) * t * t + 1; },
  easeInOutCubic: t => { return t < .5 ? 4 * t * t * t : ( t - 1 ) * ( 2 * t - 2 ) * ( 2 * t - 2 ) + 1; },
  easeInQuart: t => { return t * t * t * t; },
  easeOutQuart: t => { return 1 - ( -- t ) * t * t * t; },
  easeInOutQuart: t => { return t < .5 ? 8 * t * t * t * t : 1 - 8 * ( -- t ) * t * t * t; },
  easeInQuint: t => { return t * t * t * t * t; },
  easeOutQuint: t => { return 1 + ( -- t ) * t * t * t * t; },
  easeInOutQuint: t => { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * ( -- t ) * t * t * t * t; },
  easeInBack: t => { return t * t * ( ( 1.2 + 1 ) * t - 1.2 ); },
  easeOutBack: t => { return -- t * t * ( ( 1.2 + 1 ) * t + 1.2 ) + 1; },
  easeInOutBack: t => { return ( t *= 2 ) < 1 ? t * t * ( ( 2.6 + 1 ) * t - 2.6 ) * .5 : .5 * ( ( t -= 2 ) * t * ( ( 2.6 + 1 ) * t + 2.6 ) + 2 ); },

};

export { Tween };

/*
tween = new RUBIK.Tween({
  target: { x: 0, y: 0 },
  to: { x: 1, y: 1 },
  onUpdate: progress => {
    console.log( progress )
  }
});
*/
