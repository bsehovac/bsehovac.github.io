class Tween {

  constructor() {

    this.animations = [];

    this.animate = null;

    this.animation = () => {

      if ( this.animations.length == 0 ) return;

      const now = Date.now();

      this.animations.forEach( animation => animation.update( now, this.constructor.Easings[ animation.easing ] ) );

      this.animate = window.requestAnimationFrame( () => this.animation() );

    }

  }

  to( target, duration, options ) {

    const animation = new this.constructor.Animation( target, duration, options, this.animations );

    this.animations.push( animation );

    if ( this.animate !== null ) return animation;

    this.animation();

    return animation;

  }

}

Tween.Easings = {

  linear: function (t) { return t },
  easeInQuad: function (t) { return t*t },
  easeOutQuad: function (t) { return t*(2-t) },
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  easeInCubic: function (t) { return t*t*t },
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  easeInQuart: function (t) { return t*t*t*t },
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  easeInQuint: function (t) { return t*t*t*t*t },
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }

}

Tween.Animation = class {

  constructor( target, duration, options, animations ) {

    this.target = target || null;
    this.duration = duration;
    this.start = Date.now();
    this.progress = 0;
    this.easing = options.easing || 'easeInOutQuad';
    this.animations = animations;

    console.log( this.easing );

    this.onComplete = options.onComplete || ( () => {} );
    this.onUpdate = options.onUpdate || ( () => {} );

    delete options.easing;
    delete options.onComplete;
    delete options.onUpdate;

    this.values = options;

  }

  update( now, easing ) {

    this.progress = ( now - this.start ) / this.duration;

    if ( this.progress >= 1 ) {

      this.progress = 1;
      this.onUpdate( easing( this.progress ) );
      this.onComplete( 1 );

      this.animations.splice( this.animations.indexOf( this ), 1 );

    } else {

      this.onUpdate( easing( this.progress ) );

    }

  }

}

// export { Tween };