class Transition {

  constructor( game ) {

    this.game = game;

    this.data = {};
    this.tweens = {};

    this.data.cubeY = -0.2;
    this.data.cameraZoom = 0.85;

    this.springs = {};

  }

  drop() {

    this.game.controls.disabled = true;
    this.data.cubeY = -0.2;

    this.game.cube.object.position.y = this.data.cubeY;
    this.game.controls.edges.position.y = this.data.cubeY;
    this.game.world.camera.zoom = this.data.cameraZoom;
    this.game.world.camera.updateProjectionMatrix();

    this.springs.drop = this.game.springSystem.createSpring( 30, 6 ).setSpringSpeedFix( 0.04 );
    this.springs.drop.data.direction = 1;

    this.springs.drop.addListener( {

      onSpringUpdate: spring => {

        const current = spring.getCurrentValue();
        // const rotation = current * Math.PI / 2;

        this.game.cube.animator.position.y = 4 * current;
        this.game.cube.animator.rotation.x = Math.PI / 3 * current;
        this.game.cube.shadow.material.opacity =
          Math.max( this.progressForValueInRange(
            this.game.cube.animator.position.y, 1, this.game.cube.shadow.position.y + 0.5 + this.data.cubeY ),
          0 );

      },

      onSpringAtRest: spring => {},

    } );

    this.springs.drop.setCurrentValue( 1 ).setAtRest();

    setTimeout( () => {

      this.title( true, () => {

        this.game.animating = false;
        this.game.controls.disabled = false;

      } );
      this.springs.drop.setEndValue( 0 );

    }, 200 );

  }

  float() {

    this.tweens.float = new CUBE.Tween( {
      duration: 1500,
      easing: 'easeInOutSine',
      yoyo: true,
      onUpdate: tween => {

        this.game.cube.holder.position.y = -0.015 + tween.progress * 0.03;
        this.game.cube.holder.rotation.z = 0.006 - tween.progress * 0.012 ;

      },
    } );

  }

  zoom( game, time, callback ) {

    const zoom = ( game ) ? 1 : this.data.cameraZoom;
    const cubeY = ( game ) ? 0 : this.data.cubeY;
    const duration = ( time > 0 ) ? Math.max( time, 1500 ) : 1500;
    const rotations = ( time > 0 ) ? Math.round( duration / 1500 ) : 1;
    const easing = ( time > 0 ) ? 'easeInOutQuad' : 'easeInOutCubic';

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
      setTimeout( () => callback(), callbackTimeout * 0.5 );

  }

  timer( show, callback ) {

    CUBE.Lettering( this.game.dom.timer );

    this.game.dom.timer.classList.add( ( show ) ? 'show' : 'hide' );
    this.game.dom.timer.classList.remove( ( show ) ? 'hide' : 'show' );

    const callbackTimeout = parseFloat( getComputedStyle( this.game.dom.timer ).animationDuration ) * 1000;

    if ( typeof callback === 'function' )
      setTimeout( () => callback(), callbackTimeout * 0.75 );

  }  

  preferences( show, callback ) {

    this.game.dom.prefs.classList.add( ( show ) ? 'show' : 'hide' );
    this.game.dom.prefs.classList.remove( ( show ) ? 'hide' : 'show' );

    const callbackTimeout = parseFloat( getComputedStyle( this.game.dom.prefs ).animationDuration ) * 1000;

    if ( typeof callback === 'function' )
      setTimeout( () => callback(), callbackTimeout * 0.75 );

  }

  progressForValueInRange(value, start, end) { return (value - start) / (end - start) }
  
}

export { Transition };
