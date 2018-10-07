class Transition {

  constructor( game ) {

    this.game = game;

    this.data = {};
    this.tweens = {};
    this.initialized = false;

  }

  initialize() {

    this.data.cubeY = -0.2;
    this.data.cameraZoom = 0.85;

    this.game.controls.disabled = true;

    this.game.cube.object.position.y = this.data.cubeY;
    this.game.controls.edges.position.y = this.data.cubeY;
    this.game.cube.animator.position.y = 4;
    this.game.cube.animator.rotation.x = - Math.PI / 3;
    // this.game.cube.shadow.material.opacity = 0;
    this.game.world.camera.zoom = this.data.cameraZoom;
    this.game.world.camera.updateProjectionMatrix();

    this.initialized = true;

  }

  cube( show ) {

    if ( show ) {

      if ( ! this.initialized ) this.initialize();

      try { this.tweens.drop.kill(); } catch(e) {};

      this.tweens.drop = new CUBE.Tween( {
        duration: 3000, easing: CUBE.Easing.ElasticOut( 0.5, 0.5 ),
        onUpdate: tween => {

          this.game.cube.animator.position.y = ( 1 - tween.progress ) * 4;
          this.game.cube.animator.rotation.x = ( 1 - tween.progress ) * - Math.PI / 3
          // this.game.cube.shadow.material.opacity = 0.4 - this.game.cube.animator.position.y / 6;

        }
      } );

      if ( this.game.playing ) {

        this.game.dom.timer.classList.remove( 'hide' );
        this.game.dom.timer.innerHTML = this.game.timer.convert( this.game.timer.deltaTime );
        setTimeout( () => this.timer( true ), 700 );

      } else {

        setTimeout( () => this.title( true ), 700 );

      }

      setTimeout( () => {

        this.game.animating = false;

        if ( this.game.playing ) {

          this.game.controls.disabled = false;
          this.game.timer.start( true );

        }

      }, 1500 );

    } else {

      this.game.controls.disabled = true;

      if ( this.game.playing ) {

        this.game.timer.stop();
        this.timer( false );

      } else {

        this.title( false );

      }

      try { this.tweens.drop.kill(); } catch(e) {};

      this.tweens.drop = new CUBE.Tween( {
        duration: 2000, easing: CUBE.Easing.BackOut( 0.5 ),
        onUpdate: tween => {

          this.game.cube.animator.position.y = tween.progress * 4;
          this.game.cube.animator.rotation.x = tween.progress * Math.PI / 3
          // this.game.cube.shadow.material.opacity = 0.4 - this.game.cube.animator.position.y / 6;

        }
      } );

    }

  }

  float() {

      this.tweens.float = new CUBE.Tween( {
        duration: 1500,
        easing: 'easeInOutSine',
        yoyo: true,
        onUpdate: tween => {

          this.game.cube.holder.position.y = - 0.02 + tween.progress * 0.04;
          this.game.cube.holder.rotation.x = 0.005 - tween.progress * 0.01;
          this.game.cube.holder.rotation.z = - this.game.cube.holder.rotation.x;
          this.game.cube.holder.rotation.y = this.game.cube.holder.rotation.x;

        },
      } );

  }

  zoom( game, time, callback ) {

    const zoom = ( game ) ? 1 : this.data.cameraZoom;
    const cubeY = ( game ) ? -0.3 : this.data.cubeY;
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

    // this.tweens.cubeY = new CUBE.Tween( {
    //   target: this.data,
    //   duration: duration,
    //   easing: easing,
    //   to: { cubeY: ( game ) ? -0.3 : -0.2 },
    //   onUpdate: () => {

    //     this.game.cube.object.position.y = this.data.cubeY;
    //     this.game.controls.edges.position.y = this.data.cubeY;

    //   },
    // } );

  }

  title( show ) {

    if ( this.game.dom.title.querySelector( 'span i' ) === null )
      this.game.dom.title.querySelectorAll( 'span' ).forEach( span => CUBE.Lettering( span ) );

    this.game.dom.title.classList.add( ( show ) ? 'show' : 'hide' );
    this.game.dom.title.classList.remove( ( show ) ? 'hide' : 'show' );

    this.game.dom.note.classList.remove( ( show ) ? 'hide' : 'show' );
    this.game.dom.note.classList.add( ( show ) ? 'show' : 'hide' );

  }

  timer( show ) {

    CUBE.Lettering( this.game.dom.timer );

    this.game.dom.timer.classList.add( ( show ) ? 'show' : 'hide' );
    this.game.dom.timer.classList.remove( ( show ) ? 'hide' : 'show' );

  }  

  preferences( show ) {

    this.game.dom.prefs.querySelectorAll( '.range' ).forEach( ( range, index ) => {

      if ( show ) range.classList.remove( 'hide', 'show' );

      setTimeout( () => {

        range.classList.add( ( show ) ? 'show' : 'hide' )

      }, ( show ) ? 50 + index * 100 : index * 50 );

    } );

  }
  
}

export { Transition };
