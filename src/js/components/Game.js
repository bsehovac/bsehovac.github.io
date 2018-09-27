class Game {

  constructor( container ) {

    this.dom = {
      container: document.querySelector( '.game' ),
      main: document.querySelector( '.ui__main' ),
      title: document.querySelector( '.ui__title' ),
      start: document.querySelector( '.ui__start' ),
      timer: document.querySelector( '.ui__timer' ),
      preferences: document.querySelector( '.ui__preferences' ),
      buttons: {
        settings: document.querySelector( '.ui__icon--settings' ),
        home: document.querySelector( '.ui__icon--home' ),
        // share: document.querySelector( '.ui__icon--share' ),
        // about: document.querySelector( '.ui__icon--about' ),
      }
    };

    this.options = {
      cubeSize: 3,
      scrambleLength: 20,
    }

    this.world = new RUBIK.World( this.dom.container, this.options );
    this.cube = new RUBIK.Cube( this.options.cubeSize );
    this.controls = new RUBIK.Controls( this.cube, this.options );
    this.animation = new RUBIK.Animations( this );
    this.audio = new RUBIK.Audio( /*this.dom.buttons.audio*/ );
    this.timer = new RUBIK.Timer( this.world, this.dom.timer );
    this.icons = new RUBIK.SvgIcons( { observer: false, convert: true } );

    this.world.addCube( this.cube );
    this.world.addControls( this.controls );
    this.initDoupleTap();
    this.initPreferences();

    this.saved = this.cube.loadState();
    this.playing = false;

    this.animation.drop();

    this.controls.onMove = data => { if ( this.audio.musicOn ) this.audio.click.play(); }
    this.controls.onSolved = () => { this.timer.stop(); this.cube.clearState(); }

    this.dom.buttons.settings.onclick = e => {

      e.stopPropagation();
      this.dom.preferences.classList.toggle( 'is-active' );

    }

    this.dom.buttons.home.onclick = e => {

      e.stopPropagation();
      if ( this.playing ) this.pause();

    }

  }

  start() {

    const start = Date.now();
    let duration = 0;

    this.dom.buttons.home.style.visibility = 'visible';

    if ( ! this.saved ) {

      this.dom.timer.innerHTML = 'o:oo';

      const scramble = new RUBIK.Scramble( this.cube, this.options.scrambleLength );
      duration = scramble.converted.length * this.controls.options.scrambleSpeed;
      this.controls.scrambleCube( scramble, () => { this.saved = true; } );

    } else {

      this.dom.timer.innerHTML = this.timer.convert( this.world.timer.deltaTime );

    }

    this.animation.title( false, 0 );
    this.animation.timer( true, 600 );

    this.animation.zoom( true, duration, () => {

      this.playing = true;
      this.controls.disabled = false;
      this.timer.start( this.saved );

    } );

  }

  pause() {

    this.dom.buttons.home.style.visibility = 'hidden';

    this.playing = false;
    this.timer.stop();
    this.controls.disabled = true;

    this.animation.title( true, 600 );
    this.animation.timer( false, 0 );

    this.animation.zoom( false, 0, () => {} );

  }

  initDoupleTap() {

    let tappedTwice = false

    const tapHandler = event => {

      if ( event.target !== this.dom.main ) return;

      event.preventDefault();

      if ( ! tappedTwice ) {

          tappedTwice = true;
          setTimeout( () => { tappedTwice = false; }, 300 );
          return false;

      }

      this.start();

    };

    this.dom.main.addEventListener( 'click', tapHandler, false );
    this.dom.main.addEventListener( 'touchstart', tapHandler, false );

  }

  initPreferences() {

    const flipSpeed = new RUBIK.Range( {
      element: '.range[type="speed"]',
      handle: '.range__handle',
      value: this.controls.options.flipSpeed,
      values: [ 100, 300 ],
      onUpdate: value => { this.controls.options.flipSpeed = value; }
    } );

    const flipBounce = new RUBIK.Range( {
      element: '.range[type="bounce"]',
      handle: '.range__handle',
      value: this.controls.options.flipBounce,
      values: [ 0.1, 2 ],
      onUpdate: value => { this.controls.options.flipBounce = value; }
    } );

    const cameraFOV = new RUBIK.Range( {
      element: '.range[type="fov"]',
      handle: '.range__handle',
      value: this.world.fov,
      values: [ 2, 45 ],
      onUpdate: value => { this.world.fov = value; this.world.updateCamera(); }
    } );

  }

}

export { Game };


// new Range( 'test1', {
//   value: 180,
//   range: [ 100, 300 ],
//   step: 200 / 3,
//   list: {
//     values: [ 0, 33.33, 66.66, 100 ],
//     labels: [ '1', '2', '3', '4' ]
//   },
//   onUpdate: value => { /*console.log( value );*/ }
// } );

// new Range( 'test2', {
//   value: 1.7023,
//   range: [ 0, 200 ],
//   step: 50,
//   list: {
//     values: [ 0, 100 ],
//     labels: [ 'fast', 'slow' ]
//   },
//   onUpdate: value => { /*console.log( value );*/ }
// } );

// new Range( 'test3', {
//   value: 0,
//   range: [ 1, 5 ],
//   step: 1,
//   onUpdate: value => { /*console.log( value ); */ }
// } );