class Animate {

  constructor( cube ) {

    this.cube = cube;
    this.tweens = {};

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
    TweenMax.to( cube.position, 2.5, { x: 0, y: -0.1, z: 0, ease: Power1.easeOut, onComplete: () => { 
     
      tweens.cube = TweenMax.fromTo( cube.position, 1.5, 
        { y: -0.1 }, 
        { y: 0.1, repeat: -1, yoyo: true, ease: Sine.easeInOut } 
      ); 
     
      tweens.shadow = TweenMax.fromTo( shadow.material, 1.5, 
        { opacity: 0.5 }, 
        { opacity: 0.3, repeat: -1, yoyo: true, ease: Sine.easeInOut } 
      ); 

      callback();

    } } ); 

  }

  gameStop() {

    const cube = this.cube.object;
    const shadow = this.cube.shadow;
    const tweens = this.tweens;
    const camera = this.cube.world.camera;
    const zoomDuration = 0.5;

    tweens.cameraZoom = TweenMax.to( camera, zoomDuration, { zoom: 0.8, ease: Sine.easeInOut, onUpdate: () => {

       camera.updateProjectionMatrix();

    }, onComplete: () => {

      tweens.cube = TweenMax.to( cube.position, 0.75, { y: -0.1, ease: Sine.easeOut } );
      tweens.shadow = TweenMax.to( shadow.material, 0.75, { opacity: 0.5, ease: Sine.easeOut, onComplete: () => {

        tweens.cube = TweenMax.fromTo( cube.position, 1.5, 
          { y: -0.1 }, 
          { y: 0.1, repeat: -1, yoyo: true, ease: Sine.easeInOut } 
        );

        tweens.shadow = TweenMax.fromTo( shadow.material, 1.5, 
          { opacity: 0.5 }, 
          { opacity: 0.3, repeat: -1, yoyo: true, ease: Sine.easeInOut } 
        ); 

      } } );

    } } );

  }

  gameStart( callback, time ) {

    const cube = this.cube.object;
    const shadow = this.cube.shadow;
    const camera = this.cube.world.camera;
    const tweens = this.tweens;
    const zoomDuration = 0.5;

    tweens.cube.kill();
    tweens.shadow.kill();

    tweens.cube = TweenMax.to( cube.position, zoomDuration, { y: 0, ease: Sine.easeInOut } );
    tweens.shadow = TweenMax.to( shadow.material, zoomDuration, { opacity: 0.4, ease: Sine.easeInOut, onComplete: () => {

      callback();

    } } );

    if ( time > 0 ) {

      const div = document.createElement( 'div' );
      const value = { old: 0, current: 0, delta: 0 };
      const matrix = new THREE.Matrix4();
      const duration = time + zoomDuration;
      const rotations = Math.min( Math.round( duration / 2 ), 1 ) * 2;

      tweens.cameraZoom = TweenMax.to( camera, duration, { zoom: 1, ease: Sine.easeInOut, onUpdate: () => {

        camera.updateProjectionMatrix();

      } } );

      tweens.cameraRotation = TweenMax.to( div, duration, { x: Math.PI * rotations, ease: Sine.easeInOut, onUpdate: () => {

        value.current = this.tweens.cameraRotation.target._gsTransform.x;
        value.delta = value.current - value.old;
        value.old = value.current * 1;

        matrix.makeRotationY( value.delta );
        camera.position.applyMatrix4( matrix );
        camera.lookAt( this.cube.world.scene.position );

      } } );

    } else {

      tweens.cameraZoom = TweenMax.to( camera, zoomDuration, { zoom: 1, ease: Sine.easeInOut, onUpdate: () => {

         camera.updateProjectionMatrix();

      } } );

    }

  }

}

export { Animate };
