class Animate {

  constructor( cube ) {

    this.cube = cube;
    this.tweens = {};

  }

  dropAndFloat( callback ) {

    const bounce = 0.1;
    const duration = 2;

    let bounces = [];
    let durations = [];

    ( () => {

      const bouncePower = 1.25;
      const timePower = 1.01
      const stepsCount = 4;

      let step = bounce;
      let time = duration;
      let switcher = stepsCount % 2 === 0;

      const stepsReversed = [], timesReversed = [];

      for ( var i = 0 ; i < stepsCount; i++ ) {
        timesReversed.push( time );
        stepsReversed.push( step * (switcher ? 1 : -1) );
        switcher = !switcher;
        step = step * bouncePower;
        time = time / timePower;
      }

      bounces = stepsReversed.reverse();
      durations = timesReversed.reverse();

    } )();

    // console.log(bounces, durations);

    const cube = this.cube.object;
    const shadow = this.cube.shadow;

    let step = 0;

    TweenMax.to( cube.rotation, durations[step], {
      x: 0,
      y: 0,
      ease: Power2.easeOut
    } );

    const dropBox = () => {

      if ( step == 1 ) callback();

      if ( step != bounces.length ) {

        this.tweens.position = TweenMax.to( cube.position, durations[step], {
          y: bounces[step] * ( step == 0 ? 2 : 1 ),
          ease: (step == 0) ? Sine.easeOut : Sine.easeInOut,
          onComplete: dropBox,
        });

        this.tweens.shadow = TweenMax.to( shadow.material, durations[step], {
          opacity: 0.4 - bounces[step],
          ease: (step == 0) ? Sine.easeOut : Sine.easeInOut,
        });

        console.log( 0.4 - bounces[step] )

        step++;

      } else {

        step = bounces.length - 1;

        this.tweens.position = TweenMax.fromTo( cube.position, durations[step],
          { y: bounces[step] },
          { y: bounces[step] * -1, repeat: -1, yoyo: true, ease: Sine.easeInOut }
        );

        this.tweens.shadow = TweenMax.fromTo( shadow.material, durations[step],
          { opacity: 0.4 - bounces[step] },
          { opacity: 0.4 + bounces[step], repeat: -1, yoyo: true, ease: Sine.easeInOut }
        );

      }

    }

    dropBox();

  }

  gameStart( callback ) {

    this.tweens.position.kill();
    this.tweens.shadow.kill();

    TweenMax.to( cube.object.position, 0.5, { y: 0, ease: Sine.easeInOut } );
    TweenMax.to( cube.shadow.material, 0.5, { opacity: 0.4, ease: Sine.easeInOut } );
    TweenMax.to( world.camera, 0.5, { zoom: 1, ease: Elastic.easeOut.config(1,0.5),
      onUpdate: function() {
        world.camera.updateProjectionMatrix();
      },
      onComplete: callback
    } );

  }

}

export { Animate };
