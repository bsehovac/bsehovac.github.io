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

    if ( typeof options.easing == 'undefined' ) options.easing = 'linear'; 

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

    clearAnimationFrame( this.animate );

  }

  update() {

    const now = performance.now();
    const old = this.progress * 1;
    const delta = now - this.start;

    let progress = delta / this.duration;

    if ( this.yoyo == true ) progress = 1 - progress;

    if ( this.yoyo == null && delta > this.duration - 1000 / 60 ) progress = 1;

    if ( progress >= 1 ) { progress = 1; this.progress = 1; }
    else if ( progress <= 0 ) { progress = 0; this.progress = 0; }
    else this.progress = this.easing( progress );

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

Tween.Easings = {

  linear: p => p,

  easeInQuad: p => {
    return Math.pow(p, 2);
  },

  easeOutQuad: p => {
    return -(Math.pow((p-1), 2) -1);
  },

  easeInOutQuad: p => {
    if ((p/=0.5) < 1) return 0.5*Math.pow(p,2);
    return -0.5 * ((p-=2)*p - 2);
  },

  easeInCubic: p => {
    return Math.pow(p, 3);
  },

  easeOutCubic: p => {
    return (Math.pow((p-1), 3) +1);
  },

  easeInOutCubic: p => {
    if ((p/=0.5) < 1) return 0.5*Math.pow(p,3);
    return 0.5 * (Math.pow((p-2),3) + 2);
  },

  easeInQuart: p => {
    return Math.pow(p, 4);
  },

  easeOutQuart: p => {
    return -(Math.pow((p-1), 4) -1);
  },

  easeInOutQuart: p => {
    if ((p/=0.5) < 1) return 0.5*Math.pow(p,4);
    return -0.5 * ((p-=2)*Math.pow(p,3) - 2);
  },

  easeInQuint: p => {
    return Math.pow(p, 5);
  },

  easeOutQuint: p => {
    return (Math.pow((p-1), 5) +1);
  },

  easeInOutQuint: p => {
    if ((p/=0.5) < 1) return 0.5*Math.pow(p,5);
    return 0.5 * (Math.pow((p-2),5) + 2);
  },

  easeInSine: p => {
    return -Math.cos(p * (Math.PI/2)) + 1;
  },

  easeOutSine: p => {
    return Math.sin(p * (Math.PI/2));
  },

  easeInOutSine: p => {
    return (-0.5 * (Math.cos(Math.PI*p) -1));
  },

  easeInExpo: p => {
    return (p===0) ? 0 : Math.pow(2, 10 * (p - 1));
  },

  easeOutExpo: p => {
    return (p===1) ? 1 : -Math.pow(2, -10 * p) + 1;
  },

  easeInOutExpo: p => {
    if(p===0) return 0;
    if(p===1) return 1;
    if((p/=0.5) < 1) return 0.5 * Math.pow(2,10 * (p-1));
    return 0.5 * (-Math.pow(2, -10 * --p) + 2);
  },

  easeInCirc: p => {
    return -(Math.sqrt(1 - (p*p)) - 1);
  },

  easeOutCirc: p => {
    return Math.sqrt(1 - Math.pow((p-1), 2));
  },

  easeInOutCirc: p => {
    if((p/=0.5) < 1) return -0.5 * (Math.sqrt(1 - p*p) - 1);
    return 0.5 * (Math.sqrt(1 - (p-=2)*p) + 1);
  },

  swingFromTo: p => {
    var s = 1.70158;
    return ((p/=0.5) < 1) ? 0.5*(p*p*(((s*=(1.525))+1)*p - s)) :
    0.5*((p-=2)*p*(((s*=(1.525))+1)*p + s) + 2);
  },

  swingFrom: p => {
    var s = 1.70158;
    return p*p*((s+1)*p - s);
  },

  swingTo: p => {
    var s = 1.70158;
    return (p-=1)*p*((s+1)*p + s) + 1;
  },

};

export { Tween };
