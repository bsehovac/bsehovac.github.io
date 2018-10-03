class Transition {

  constructor( game ) {

    this.game = game;

    this.data = {};
    this.tweens = {};

    this.data.cubeY = -0.2;
    this.data.floatScale = 1;
    this.data.cameraZoom = 0.85;

  }

  title( show, timeout ) {

    if ( typeof this.data.titleLetters == 'undefined' ) {

      this.data.titleLetters = [];

      this.game.dom.title.querySelectorAll( 'span' ).forEach( span => {

        const spanText = span.innerHTML;
        span.innerHTML = '';

        spanText.split( '' ).forEach( letter => {

          const i = document.createElement( 'i' );
          i.innerHTML = letter;
          i.style.opacity = 0;
          span.appendChild( i );
          this.data.titleLetters.push( i );

        } );

      } );

      this.game.dom.title.style.opacity = 1;
      this.tweens.title = [];

    }

    setTimeout( () => {

      if ( show ) setTimeout( () => { this.game.dom.menu.classList.add( 'is-active' ); }, 600 );
      else this.game.dom.menu.classList.remove( 'is-active' );

      this.data.titleLetters.forEach( ( letter, index ) => {

        this.tweens.title[ index ] = new CUBE.Tween( {
          duration: ( show ) ? 800 : 400,
          delay: index * 50,
          easing: 'easeOutSine',
          onUpdate: tween => {

            const rotation = ( ( show ) ? - 80 : 0 ) + 80 * tween.progress;
            letter.style.transform = 'rotateY(' + rotation + 'deg)';
            letter.style.opacity = ( show ) ? tween.progress : 1 - tween.progress;

          },
        } );

      } );

      if ( typeof this.tweens.start !== 'undefined' ) this.tweens.start.kill()

      this.tweens.start = new CUBE.Tween( {
        duration: 400,
        easing: 'easeOutSine',
        onUpdate: tween => {

          this.game.dom.note.style.opacity = ( show ) ? tween.progress : 1 - tween.progress

        },
        onComplete: () => {

          if ( show ) this.tweens.start = new CUBE.Tween( {
            duration: 800,
            easing: 'easeInOutSine',
            yoyo: true,
            onUpdate: tween => {

              this.game.dom.note.style.opacity = 1 - tween.progress;

            },
          } );

        },
      } );

    }, timeout );

  }

  ranges( show ) {

    if ( show ) {

      Object.keys( this.game.preferences.ranges ).forEach( ( name, index ) => {

        this.game.preferences.ranges[ name ].element.classList.remove( 'is-inactive' );

        setTimeout( () => {

          this.game.preferences.ranges[ name ].element.classList.add( 'is-active' );

        }, index * 100 );

      } );

    } else {

      Object.keys( this.game.preferences.ranges ).forEach( name => {

        this.game.preferences.ranges[ name ].element.classList.add( 'is-inactive' );
        this.game.preferences.ranges[ name ].element.classList.remove( 'is-active' );

      } );

    }

  }

  timer( show, timeout ) {

    this.data.timerLetters = [];

    const timerText = this.game.dom.timer.innerHTML;
    this.game.dom.timer.innerHTML = '';

    timerText.split( '' ).forEach( letter => {

      const i = document.createElement( 'i' );
      i.innerHTML = letter;
      i.style.opacity = ( show ) ? 0 : 1;
      this.game.dom.timer.appendChild( i );
      this.data.timerLetters.push( i );

    } );

    this.game.dom.timer.style.opacity = 1;

    this.tweens.timer = [];

    setTimeout( () => {

      this.data.timerLetters.forEach( ( letter, index ) => {

        this.tweens.timer[ index ] = new CUBE.Tween( {
          duration: ( show ) ? 800 : 400,
          delay: index * 50,
          easing: 'easeOutSine',
          onUpdate: tween => {

            const rotation = ( ( show ) ? - 80 : 0 ) + 80 * tween.progress;
            letter.style.transform = 'rotateY(' + rotation + 'deg)';
            letter.style.opacity = ( show ) ? tween.progress : 1 - tween.progress;

          },
        } );

      } );

    }, timeout );

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
      onUpdate: () => { this.game.cube.shadow.material.opacity = 0.4 - this.game.cube.animator.position.y * 0.5; },
      onComplete: () => { this.float( true ); },
    } );

    this.tweens.rotate = new CUBE.Tween( {
      target: this.game.cube.animator.rotation,
      duration: 2500,
      easing: 'easeOutCubic',
      to: { x: 0 },
    } );

    setTimeout( () => { this.title( true ); }, 2000 );

  }

  float( drop ) {

    if ( typeof this.data.floatScale == 'undefined' ) this.data.floatScale = 1;

    if ( drop ) {

      this.tweens.float = new CUBE.Tween( {
        duration: 2500,
        easing: 'easeInOutSine',
        yoyo: true,
        onUpdate: tween => {

          this.game.cube.animator.position.y = - 0.1 * this.data.floatScale + tween.progress * 0.2 * this.data.floatScale;
          this.game.cube.shadow.material.opacity = 0.4 - this.game.cube.animator.position.y * 0.5;

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

    // this.tweens.cubeY = new CUBE.Tween( {
    //   target: this.game.cube.object.position,
    //   duration: duration,
    //   easing: easing,
    //   to: { y: cubeY },
    // } );

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
  
}

export { Transition };
