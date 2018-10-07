class Preferences {

  constructor( game ) {

    this.game = game;

    this.load();

    this.elements = {

      speed: new CUBE.Range( 'speed', {
        value: this.game.controls.options.flipSpeed,
        range: [ 300, 100 ],
        onComplete: value => {

          this.game.controls.options.flipSpeed = value;
          localStorage.setItem( 'flipSpeed', value );

          this.game.controls.options.flipBounce = ( ( value - 100 ) / 200 ) * 2;
          localStorage.setItem( 'flipBounce', value );
          
        },
      } ),

      // bounce: new CUBE.Range( 'bounce', {
      //   value: this.game.controls.options.flipBounce,
      //   range: [ 0, 2 ],
      //   onUpdate: value => { this.game.controls.options.flipBounce = value; },
      //   onComplete: value => { localStorage.setItem( 'flipBounce', value ); },
      // } ),

      scramble: new CUBE.Range( 'scramble', {
        value: this.game.scrambler.scrambleLength,
        range: [ 20, 30 ],
        step: 5,
        onComplete: value => {

          this.game.scrambler.scrambleLength = value;
          localStorage.setItem( 'scrambleLength', value );

        },
      } ),

      fov: new CUBE.Range( 'fov', {
        value: this.game.world.fov,
        range: [ 2, 45 ],
        onUpdate: value => {

          this.game.world.fov = value;
          this.game.world.resize();

        },
        onComplete: value => {

          localStorage.setItem( 'fov', value );

        },
      } ),

      theme: new CUBE.Range( 'theme', {
        value: 0,
        range: [ 0, 1 ],
        step: 1,
        onUpdate: value => {},
      } ),

    };

  }

  load() {

    const flipSpeed = parseFloat( localStorage.getItem( 'flipSpeed' ) );
    const flipBounce = parseFloat( localStorage.getItem( 'flipBounce' ) );
    const scrambleLength = parseFloat( localStorage.getItem( 'scrambleLength' ) );
    const fov = parseFloat( localStorage.getItem( 'fov' ) );
    // const theme = localStorage.getItem( 'theme' );

    if ( flipSpeed != null ) this.game.controls.options.flipSpeed = flipSpeed;
    if ( flipBounce != null ) this.game.controls.options.flipBounce = flipBounce;
    if ( scrambleLength != null ) this.game.scrambler.scrambleLength = scrambleLength;

    if ( fov != null ) {

      this.game.world.fov = fov;
      this.game.world.resize();

    }

  }

}

export { Preferences };
