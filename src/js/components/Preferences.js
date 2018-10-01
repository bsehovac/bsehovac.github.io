class Preferences {

  constructor( game ) {

    this.game = game;

    // document.addEventListener('touchmove', function(event) {
    //    if(event.target.parentNode.className.indexOf('noBounce') != -1 
    // || event.target.className.indexOf('noBounce') != -1 ) {
    //     event.preventDefault(); }
    // }, false);

    this.speed = new RUBIK.Range( 'speed', {
      value: game.controls.options.flipSpeed,
      range: [ 300, 100 ],
      onUpdate: value => {

        game.controls.options.flipSpeed = value;

      }
    } );

    this.bounce = new RUBIK.Range( 'bounce', {
      value: game.controls.options.flipBounce,
      range: [ 0, 2 ],
      onUpdate: value => {

        game.controls.options.flipBounce = value;

      }
    } );

    this.fov = new RUBIK.Range( 'fov', {
      value: game.world.fov,
      range: [ 2, 45 ],
      onUpdate: value => {

        game.world.fov = value;
        game.world.updateCamera();

      },
    } );

    this.scramble = new RUBIK.Range( 'scramble', {
      value: game.options.scrambleLength,
      range: [ 10, 30 ],
      step: 5,
      onUpdate: value => {

        game.options.scrambleLength = value;

      },
    } );

    this.graphics = new RUBIK.Range( 'graphics', {
      value: 2,
      range: [ 1, 2 ],
      step: 1,
      onUpdate: value => {

        game.world.renderer.setPixelRatio = ( value == 1 ) ? 1 : window.devicePixelRatio;

      },
    } );

    // VOLUME - 0-100%

    // THEME - dark, light, blue, green, orange

  }

}

export { Preferences };