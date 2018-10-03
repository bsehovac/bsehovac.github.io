class Preferences {

  constructor( game ) {

    this.game = game;

    this.ranges = {

      speed: new CUBE.Range( 'speed', {
        value: this.game.controls.options.flipSpeed,
        range: [ 300, 100 ],
        onUpdate: value => {

          this.game.controls.options.flipSpeed = value;

        }
      } ),

      bounce: new CUBE.Range( 'bounce', {
        value: this.game.controls.options.flipBounce,
        range: [ 0, 2 ],
        onUpdate: value => {

          this.game.controls.options.flipBounce = value;

        }
      } ),

      scramble: new CUBE.Range( 'scramble', {
        value: this.game.scrambler.scrambleLength,
        range: [ 10, 30 ],
        step: 5,
        onUpdate: value => {

          this.game.scrambler.scrambleLength = value;

        },
      } ),

      fov: new CUBE.Range( 'fov', {
        value: this.game.world.fov,
        range: [ 2, 45 ],
        onUpdate: value => {

          this.game.world.fov = value;
          this.game.world.resize();

        },
      } ),

      theme: new CUBE.Range( 'theme', {
        value: 'light',
        range: [ 1, 2 ],
        step: 1,
        onUpdate: value => {},
      } ),

    };

  }

}

export { Preferences };
