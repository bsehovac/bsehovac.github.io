class AnimateController {

  constructor() {

    this.started = false;
    this.animations = [];
    this.completed = [];
    this.hasCompleted = false;
    this.animation = null;

  }

  animate() {

    let i = this.animations.length;

    while ( i-- ) this.animations[ i ]();

    if ( this.hasCompleted ) this.clean()

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

    if ( index < 0 ) return

    this.completed.push( index );
    this.hasCompleted = true;

  }

  clean() {

    this.completed.forEach( index => {

      this.animations.splice( index, 1 );

    } );

    this.completed = [];

    if ( this.animations.length > 1 ) return;

    this.started = false;
    cancelAnimationFrame( this.animation );

  }

}

const Animate = new AnimateController();

export { Animate };
