class AnimationEngine {

  constructor() {

    this.ids = [];
    this.animations = {};
    this.update = this.update.bind( this );
    this.animating = false;
    this.animation = null;
    this.time = 0;

    return this;

  }

  update() {

    let i = this.ids.length;

    if ( i > 0 ) requestAnimationFrame( this.update );
    else this.animating = false;

    const now = performance.now();
    const delta = now - this.time
    this.time = now;

    while ( i-- ) this.animations[ this.ids[ i ] ].update( delta );

  }

  add( animation ) {

    Object.assign( this.animations, {

      [ animation.id ]: animation

    } );

    this.ids.push( animation.id );

    if ( ! this.animating ) {

      requestAnimationFrame( this.update );
      this.time = performance.now();
      this.animating = true;

    }

  }

  remove( animation ) {

    const index = this.ids.indexOf( animation.id );

    if ( index < 0 ) return;

    this.ids.splice( index, 1 );

    delete this.animations[ animation.id ];

  }

}

const animationEngine = new AnimationEngine();

let uniqueID = 0;

class Animation {

  constructor( start ) {

    this.id = uniqueID ++;
    this.update = this.update.bind( this );

    if ( start === true ) this.start();

  }

  start() {

    animationEngine.add( this );

  }

  stop() {

    animationEngine.remove( this );

  }

  update( delta ) {}

}

export { Animation };
