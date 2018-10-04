class Transition {

  constructor( game ) {

    this.game = game;

    this.data = {};
    this.tweens = {};

    this.data.cubeY = -0.2;
    this.data.floatScale = 1;
    this.data.cameraZoom = 0.85;

  }

  drop() {

    this.game.controls.disabled = true;
    this.data.floatScale = 1;
    this.data.cubeY = -0.2;

    this.game.cube.object.position.y = this.data.cubeY;
    this.game.controls.edges.position.y = this.data.cubeY;
    this.game.cube.animator.position.set( -2, 4, -2 );
    this.game.cube.animator.rotation.x = - Math.PI / 4;
    this.game.cube.shadow.material.opacity = 0;
    this.game.world.camera.zoom = this.data.cameraZoom;
    this.game.world.camera.updateProjectionMatrix();

    this.tweens.drop = new CUBE.Tween( {
      target: this.game.cube.animator.position,
      duration: 2500,
      easing: 'easeOutCubic',
      to: { x: 0, y: - 0.1 * this.data.floatScale, z: 0 },
      onUpdate: () => {

        this.game.cube.shadow.material.opacity = 0.4 - this.game.cube.animator.position.y * 0.5;

      },
      onComplete: () => { this.float( true ); this.game.animating = false; },
    } );

    this.tweens.rotate = new CUBE.Tween( {
      target: this.game.cube.animator.rotation,
      duration: 2500,
      easing: 'easeOutCubic',
      to: { x: 0 },
    } );

    setTimeout( () => { this.title( true, 0 ); }, 2000 );

  }

  float( drop ) {

    if ( typeof this.data.floatScale == 'undefined' ) this.data.floatScale = 1;

    if ( drop ) {

      this.tweens.float = new CUBE.Tween( {
        duration: 2500,
        easing: 'easeInOutSine',
        yoyo: true,
        onUpdate: tween => {

          this.game.cube.animator.position.y =
            - 0.1 * this.data.floatScale + tween.progress * 0.2 * this.data.floatScale;

          this.game.cube.shadow.material.opacity =
            0.4 - this.game.cube.animator.position.y * 0.5;

        },
      } );

    } else {

      this.tweens.float = new CUBE.Tween( {
        duration: 2500 / 2,
        easing: 'easeOutSine',
        onUpdate: tween => {

          this.game.cube.animator.position.y = tween.progress * - 0.1 * this.data.floatScale;
          this.game.cube.shadow.material.opacity = 0.4 - this.game.cube.animator.position.y * 0.5;

        },
        onComplete: () => { this.float( true ); },
      } );

    }

  }

  zoom( game, time, callback ) {

    const floatScale = ( game ) ? 0.25 : 1;
    const zoom = ( game ) ? 1 : this.data.cameraZoom;
    const cubeY = ( game ) ? 0 : this.data.cubeY;
    const duration = ( time > 0 ) ? Math.max( time, 1500 ) : 1500;
    const rotations = ( time > 0 ) ? Math.round( duration / 1500 ) : 1;
    const easing = ( time > 0 ) ? 'easeInOutQuad' : 'easeInOutCubic';

    this.tweens.scale = new CUBE.Tween( {
      target: this.data,
      duration: duration,
      easing: easing,
      to: { floatScale: floatScale },
    } );

    this.tweens.zoom = new CUBE.Tween( {
      target: this.game.world.camera,
      duration: duration,
      easing: easing,
      to: { zoom: zoom },
      onUpdate: () => { this.game.world.camera.updateProjectionMatrix(); },
    } );

    this.tweens.rotate = new CUBE.Tween( {
      target: this.game.cube.animator.rotation,
      duration: duration,
      easing: easing,
      to: { y: - Math.PI * 2 * rotations },
      onComplete: () => { this.game.cube.animator.rotation.y = 0; callback(); },
    } );

  }

  title( show, callback ) {

    if ( this.game.dom.title.querySelector( 'span i' ) === null )
      this.game.dom.title.querySelectorAll( 'span' ).forEach( span => CUBE.Lettering( span ) );

    this.game.dom.title.classList.add( ( show ) ? 'show' : 'hide' );
    this.game.dom.title.classList.remove( ( show ) ? 'hide' : 'show' );

    this.game.dom.note.classList.remove( ( show ) ? 'hide' : 'show' );
    this.game.dom.note.classList.add( ( show ) ? 'show' : 'hide' );

    const callbackTimeout = parseFloat( getComputedStyle( this.game.dom.title ).animationDuration ) * 1000;

    if ( typeof callback === 'function' )
      setTimeout( () => callback(), callbackTimeout );

  }

  timer( show, callback ) {

    CUBE.Lettering( this.game.dom.timer );

    this.game.dom.timer.classList.add( ( show ) ? 'flip-in' : 'flip-out' );
    this.game.dom.timer.classList.remove( ( show ) ? 'flip-out' : 'flip-in' );

    const callbackTimeout = parseFloat( getComputedStyle( this.game.dom.timer ).animationDuration ) * 1000;

    if ( typeof callback === 'function' )
      setTimeout( () => callback(), callbackTimeout );

  }  

  preferences( show, callback ) {

    this.game.dom.prefs.classList.add( ( show ) ? 'show' : 'hide' );
    this.game.dom.prefs.classList.remove( ( show ) ? 'hide' : 'show' );

    const callbackTimeout = parseFloat( getComputedStyle( this.game.dom.prefs ).animationDuration ) * 1000;

    if ( typeof callback === 'function' )
      setTimeout( () => callback(), callbackTimeout );

  }
  
}

export { Transition };
