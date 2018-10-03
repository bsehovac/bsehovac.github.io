class Game {

  constructor() {

    this.dom = {
      container: document.querySelector( '.ui__game' ),
      menu: document.querySelector( '.ui__screen--menu' ),
      title: document.querySelector( '.ui__text--title' ),
      note: document.querySelector( '.ui__text--note' ),
      timer: document.querySelector( '.ui__text--timer' ),
      preferences: document.querySelector( '.ui__screen--prefs' ),
      buttons: {
        // settings: document.querySelector( '.ui__icon--settings' ),
        // home: document.querySelector( '.ui__icon--home' ),
        // share: document.querySelector( '.ui__icon--share' ),
        // about: document.querySelector( '.ui__icon--about' ),
      }
    };

    this.world = new CUBE.World( this );
    this.cube = new CUBE.Cube( this );
    this.controls = new CUBE.Controls( this );
    this.scrambler = new CUBE.Scrambler( this );
    this.transition = new CUBE.Transition( this );
    this.audio = new CUBE.Audio( this );
    this.timer = new CUBE.Timer( this );
    this.preferences = new CUBE.Preferences( this );
    this.icons = new CUBE.Icons();

    this.initDoupleTap();

    this.saved = this.cube.loadState();
    this.playing = false;

    this.transition.drop();

    this.controls.onMove = data => { if ( this.audio.musicOn ) this.audio.click.play(); }
    this.controls.onSolved = () => { this.timer.stop(); this.cube.clearState(); }

    // this.dom.buttons.settings.onclick = e => {

    //   e.stopPropagation();
    //   this.dom.preferences.classList.toggle( 'is-active' );

    // }

    // this.dom.buttons.home.onclick = e => {

    //   e.stopPropagation();
    //   if ( this.playing ) this.pause();

    // }

  }

  start() {

    const start = Date.now();
    let duration = 0;

    // this.dom.buttons.home.style.visibility = 'visible';

    if ( ! this.saved ) {

      this.dom.timer.innerHTML = '0:00';

      this.scrambler.scramble();
      this.controls.scrambleCube( () => {} );

      duration = this.scrambler.converted.length * this.controls.options.scrambleSpeed;

    } else {

      this.dom.timer.innerHTML = this.timer.convert( this.timer.deltaTime );

    }

    this.transition.title( false, 0 );
    this.transition.timer( true, 600 );

    this.transition.zoom( true, duration, () => {

      this.playing = true;
      this.controls.disabled = false;
      this.timer.start( this.saved );
      this.saved = true;

    } );

  }

  pause() {

    // this.dom.buttons.home.style.visibility = 'hidden';

    this.playing = false;
    this.timer.stop();
    this.controls.disabled = true;

    this.transition.title( true, 600 );
    this.transition.timer( false, 0 );

    this.transition.zoom( false, 0, () => {} );

  }

  initDoupleTap() {

    let tappedTwice = false

    const tapHandler = event => {

      event.preventDefault();

      if ( ! tappedTwice ) {

          tappedTwice = true;
          setTimeout( () => { tappedTwice = false; }, 300 );
          return false;

      }

      this.start();

    };

    this.dom.container.addEventListener( 'click', tapHandler, false );
    this.dom.container.addEventListener( 'touchstart', tapHandler, false );

  }

}

export { Game };
