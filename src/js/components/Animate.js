class Animate {

  constructor( cube, title, time ) {

    this.cube = cube;
    this.title = title;
    this.time = time;
    this.tweens = {};

    this.title.querySelectorAll('span').forEach( span => {

      const spanText = span.innerHTML;
      span.innerHTML = '';

      spanText.split( '' ).forEach( letter => {

        const i = document.createElement( 'i' );
        i.innerHTML = letter;
        i.style.opacity = 0;
        span.appendChild( i );

      } );

    } );

    this.title.style.opacity = 1;

  }

  titleIn( callback ) {

    this.tweens.title = TweenMax.staggerFromTo( this.title.querySelectorAll( 'i' ), 0.8,
      { opacity: 0, rotationY: -90 },
      { opacity: 1, rotationY: 0, ease: Sine.easeOut },
    0.05, () => { if ( typeof callback === 'function') callback(); } );

  }

  titleOut( callback ) {

    this.tweens.title = TweenMax.staggerFromTo( this.title.querySelectorAll( 'i' ), 0.4,
      { opacity: 1, rotationY: 0 },
      { opacity: 0, rotationY: 90, ease: Sine.easeIn },
    0.05, () => { if ( typeof callback === 'function') callback(); } );

  }

  dropAndFloat( callback ) {

    const cube = this.cube.object;
    const shadow = this.cube.shadow;
    const tweens = this.tweens;

    cube.position.y = 4; 
    cube.position.x = -2; 
    cube.position.z = -2; 
    cube.rotation.x = Math.PI/4;
    // cube.rotation.y = Math.PI/6;
    shadow.material.opacity = 0;

    TweenMax.to( shadow.material, 1.5, { opacity: 0.5, ease: Power1.easeOut, delay: 1 } ); 
    TweenMax.to( cube.rotation, 2.5, { x: 0, y: 0, ease: Power1.easeOut } ); 
    TweenMax.to( cube.position, 2.5, { x: 0, y: - 0.1, z: 0, ease: Power1.easeOut, onComplete: () => { 
     
      tweens.cube = TweenMax.fromTo( cube.position, 1.5, 
        { y: - 0.1 }, 
        { y: + 0.1, repeat: -1, yoyo: true, ease: Sine.easeInOut } 
      ); 
     
      tweens.shadow = TweenMax.fromTo( shadow.material, 1.5, 
        { opacity: 0.5 }, 
        { opacity: 0.3, repeat: -1, yoyo: true, ease: Sine.easeInOut } 
      ); 

      callback();

    } } ); 

  }

  game( callback, time, start ) {

    const cube = this.cube.object;
    const shadow = this.cube.shadow;
    const camera = this.cube.world.camera;
    const tweens = this.tweens;
    const zoomDuration = 0.5;

    tweens.cube.kill();
    tweens.shadow.kill();

    if ( !start ) {

      tweens.cube = TweenMax.to( cube.position, 0.75, { y: 0.1, ease: Sine.easeOut } );
      tweens.shadow = TweenMax.to( shadow.material, 0.75, { opacity: 0.5, ease: Sine.easeOut, onComplete: () => {

        tweens.cube = TweenMax.fromTo( cube.position, 1.5, 
          { y: 0.1 }, 
          { y: -0.1, repeat: -1, yoyo: true, ease: Sine.easeInOut } 
        );

        tweens.shadow = TweenMax.fromTo( shadow.material, 1.5, 
          { opacity: 0.5 }, 
          { opacity: 0.3, repeat: -1, yoyo: true, ease: Sine.easeInOut } 
        ); 

      } } );

    } else {

      tweens.cube = TweenMax.to( cube.position, zoomDuration, { y: 0, ease: Sine.easeInOut } );
      tweens.shadow = TweenMax.to( shadow.material, zoomDuration, { opacity: 0.4, ease: Sine.easeInOut, onComplete: () => {

        if ( time != 0 ) callback();

      } } );

    }

    const duration =  ( time > 0 ) ? time + zoomDuration : zoomDuration * 2;
    const rotations = ( time > 0 ) ? Math.min( Math.round( duration / 2 ), 1 ) * 2 : 2;

    const div = document.createElement( 'div' );
    const value = { old: 0, current: 0, delta: 0 };
    const matrix = new THREE.Matrix4();

    const cameraZoom = ( start ) ? 0.95 : 0.8;

    tweens.cameraZoom = TweenMax.to( camera, duration, { zoom: cameraZoom, ease: Sine.easeInOut, onUpdate: () => {

      camera.updateProjectionMatrix();

    } } );

    tweens.cameraRotation = TweenMax.to( div, duration, { x: Math.PI * rotations, ease: Sine.easeInOut, onUpdate: () => {

      value.current = this.tweens.cameraRotation.target._gsTransform.x;
      value.delta = value.current - value.old;
      value.old = value.current * 1;

      matrix.makeRotationY( value.delta );
      camera.position.applyMatrix4( matrix );
      camera.lookAt( this.cube.world.cameraOffset );

    }, onComplete: () => {

      if ( time == 0 ) callback();

    } } );

  }

  audioIn( audio ) {

    if ( !audio.musicOn ) return;

    const sound = audio.music;

    const currentVolume = { volume: 0 };

    sound.play();

    if ( this.tweens.volumeTween ) this.tweens.volumeTween.kill();

    this.tweens.volumeTween = TweenMax.to( currentVolume, 1, { volume: 0.5, ease: Sine.easeOut, onUpdate: () => {

      sound.setVolume( this.tweens.volumeTween.target.volume );

      audio.button.classList[ sound.isPlaying ? 'add' : 'remove' ]('is-active');

    } } );

  }

  audioOut( audio ) {

    const sound = audio.music;

    const currentVolume = { volume: sound.getVolume() };

    if ( this.tweens.volumeTween ) this.tweens.volumeTween.kill();

    this.tweens.volumeTween = TweenMax.to( currentVolume, 1, { volume: 0, ease: Sine.easeOut, onUpdate: () => {

      sound.setVolume( this.tweens.volumeTween.target.volume );

    }, onComplete: () => {

      sound.pause();

    } } );

  }

}

export { Animate };
