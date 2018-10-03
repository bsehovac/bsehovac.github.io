class AnimateController {

  constructor() {

    this.started = false;
    this.animations = [];
    this.animation = null;

  }

  animate() {

    let i = this.animations.length;

    while ( i-- ) this.animations[ i ]();

    requestAnimationFrame( () => this.animate() );

  }

  add( animation ) {

    this.animations.push( animation );

    if ( this.started ) return;

    this.started = true;
    this.animation = requestAnimationFrame( () => this.animate() );

  }

  remove( animation ) {

    const index = this.animations.indexOf( animation );

    if ( index < 0 ) return;

    this.animations.splice( index, 1 );

    if ( this.animations.length > 1 ) return;

    this.started = false;
    cancelAnimationFrame( this.animation );

  }

}

const Animate = new AnimateController();

export { Animate };
