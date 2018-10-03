class Preferences {

  constructor( game ) {

    this.game = game;

    this.ranges = {};

    // document.addEventListener('touchmove', function(event) {
    //    if(event.target.parentNode.className.indexOf('noBounce') != -1 
    // || event.target.className.indexOf('noBounce') != -1 ) {
    //     event.preventDefault(); }
    // }, false);

    this.ranges = new CUBE.Range( 'speed', {
      value: this.game.controls.options.flipSpeed,
      range: [ 300, 100 ],
      onUpdate: value => {

        this.game.controls.options.flipSpeed = value;

      }
    } );

    this.ranges = new CUBE.Range( 'bounce', {
      value: this.game.controls.options.flipBounce,
      range: [ 0, 2 ],
      onUpdate: value => {

        this.game.controls.options.flipBounce = value;

      }
    } );

    this.ranges = new CUBE.Range( 'fov', {
      value: this.game.world.fov,
      range: [ 2, 45 ],
      onUpdate: value => {

        this.game.world.fov = value;
        this.game.world.updateCamera();

      },
    } );

    this.ranges = new CUBE.Range( 'scramble', {
      value: this.game.scrambler.scrambleLength,
      range: [ 10, 30 ],
      step: 5,
      onUpdate: value => {

        this.game.options.scrambleLength = value;

      },
    } );

    this.ranges = new CUBE.Range( 'graphics', {
      value: 2,
      range: [ 1, 2 ],
      step: 1,
      onUpdate: value => {

        this.game.world.renderer.setPixelRatio = ( value == 1 ) ? 1 : window.devicePixelRatio;

      },
    } );

    // VOLUME - 0-100%

    // THEME - dark, light, blue, green, orange

  }

}

export { Preferences };
