class Tween {

  constructor( options ) {

    this.target = options.target || null;
    this.duration = options.duration || 500;
    this.delay = options.delay || 0;
    this.easing = this.constructor.Easings[ options.easing || 'linear' ];
    this.from = options.from || {};
    this.to = options.to || null;
    this.onComplete = options.onComplete || ( () => {} );
    this.onUpdate = options.onUpdate || ( () => {} );

    this.start = Date.now();
    this.progress = 0;
    this.delta = 0;
    this.animate = null;
    this.values = [];

    if ( this.target !== null && this.to !== null ) {

      if ( Object.keys( this.from ).length < 1 ) {

        Object.keys( this.to ).forEach( key => { this.from[ key ] = this.target[ key ]; } );

      }

      Object.keys( this.to ).forEach( key => { this.values.push( key ) } );

    }

    this.animate = window.requestAnimationFrame( () => this.update() );

    return this;

  }

  kill() {

    window.cancelAnimationFrame( this.animate );

  }

  update() {

    const old = this.progress * 1;
    let progress = ( Date.now() - this.start ) / this.duration;
    if ( progress > 1 ) progress = 1;

    this.progress = this.easing( progress );
    this.delta = this.progress - old;

    this.values.forEach( key => {

      this.target[ key ] = this.from[ key ] + ( this.to[ key ] - this.from[ key ] ) * this.progress;

    } );

    this.onUpdate( this );

    if ( this.progress == 1 ) this.onComplete( this );
    else this.animate = window.requestAnimationFrame( () => this.update() );

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

  // easeOutBounce: p => {
  //   if ((p) < (1/2.75)) {
  //     return (7.5625*p*p);
  //   } else if (p < (2/2.75)) {
  //     return (7.5625*(p-=(1.5/2.75))*p + 0.75);
  //   } else if (p < (2.5/2.75)) {
  //     return (7.5625*(p-=(2.25/2.75))*p + 0.9375);
  //   } else {
  //     return (7.5625*(p-=(2.625/2.75))*p + 0.984375);
  //   }
  // },

  // easeInBack: p => {
  //   var s = 1.70158;
  //   return (p)*p*((s+1)*p - s);
  // },

  // easeOutBack: p => {
  //   var s = 1.70158;
  //   return (p=p-1)*p*((s+1)*p + s) + 1;
  // },

  // easeInOutBack: p => {
  //   var s = 1.70158;
  //   if((p/=0.5) < 1) return 0.5*(p*p*(((s*=(1.525))+1)*p -s));
  //   return 0.5*((p-=2)*p*(((s*=(1.525))+1)*p +s) +2);
  // },

  // elastic: p => {
  //   return -1 * Math.pow(4,-8*p) * Math.sin((p*6-1)*(2*Math.PI)/2) + 1;
  // },

  // bounce: p => {
  //   if (p < (1/2.75)) {
  //     return (7.5625*p*p);
  //   } else if (p < (2/2.75)) {
  //     return (7.5625*(p-=(1.5/2.75))*p + 0.75);
  //   } else if (p < (2.5/2.75)) {
  //     return (7.5625*(p-=(2.25/2.75))*p + 0.9375);
  //   } else {
  //     return (7.5625*(p-=(2.625/2.75))*p + 0.984375);
  //   }
  // },

  // bouncePast: p => {
  //   if (p < (1/2.75)) {
  //     return (7.5625*p*p);
  //   } else if (p < (2/2.75)) {
  //     return 2 - (7.5625*(p-=(1.5/2.75))*p + 0.75);
  //   } else if (p < (2.5/2.75)) {
  //     return 2 - (7.5625*(p-=(2.25/2.75))*p + 0.9375);
  //   } else {
  //     return 2 - (7.5625*(p-=(2.625/2.75))*p + 0.984375);
  //   }
  // },

  // easeFromTo: p => {
  //   if ((p/=0.5) < 1) return 0.5*Math.pow(p,4);
  //   return -0.5 * ((p-=2)*Math.pow(p,3) - 2);
  // },

  // easeFrom: p => {
  //   return Math.pow(p,4);
  // },

  // easeTo: p => {
  //   return Math.pow(p,0.25);
  // },

};

export { Tween };
