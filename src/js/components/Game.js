class Game {

  constructor( container ) {

    this.dom = {
      container: document.querySelector( '.ui__game' ),
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
    };

    this.world = new RUBIK.World( this );
    this.cube = new RUBIK.Cube( this );
    this.controls = new RUBIK.Controls( this );
    this.animation = new RUBIK.Animations( this );
    this.audio = new RUBIK.Audio( this );
    this.timer = new RUBIK.Timer( this );
    this.icons = new RUBIK.SvgIcons();

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

      this.dom.timer.innerHTML = this.timer.convert( this.timer.deltaTime );

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

    this.preferences = {};

    this.preferences.speed = new RUBIK.Range( 'speed', {
      value: this.controls.options.flipSpeed,
      range: [ 300, 100 ],
      onUpdate: value => {

        this.controls.options.flipSpeed = value;

      }
    } );

    this.preferences.bounce = new RUBIK.Range( 'bounce', {
      value: this.controls.options.flipBounce,
      range: [ 0, 2 ],
      onUpdate: value => {

        this.controls.options.flipBounce = value;

      }
    } );

    this.preferences.fov = new RUBIK.Range( 'fov', {
      value: this.world.fov,
      range: [ 2, 45 ],
      onUpdate: value => {

        this.world.fov = value;
        this.world.updateCamera();

      },
    } );

    this.preferences.scramble = new RUBIK.Range( 'scramble', {
      value: this.options.scrambleLength,
      range: [ 10, 30 ],
      step: 5,
      onUpdate: value => {

        this.options.scrambleLength = value;

      },
    } );

    this.preferences.graphics = new RUBIK.Range( 'graphics', {
      value: 2,
      range: [ 1, 2 ],
      step: 1,
      onUpdate: value => {

        this.world.renderer.setPixelRatio = ( value == 1 ) ? 1 : window.devicePixelRatio;

      },
    } );

    // VOLUME - 0-100%

    // THEME - dark, light, blue, green, orange

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
