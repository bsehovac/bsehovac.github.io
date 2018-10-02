class Game {

  constructor( container ) {

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

    this.world = new RUBIK.World( this );
    this.cube = new RUBIK.Cube( this );
    this.controls = new RUBIK.Controls( this );
    this.scrambler = new RUBIK.Scrambler( this );
    this.animation = new RUBIK.Animations( this );
    this.audio = new RUBIK.Audio( this );
    this.timer = new RUBIK.Timer( this );
    this.preferences = new RUBIK.Preferences( this );
    this.icons = new RUBIK.SvgIcons();

    this.initDoupleTap();

    this.saved = this.cube.loadState();
    this.playing = false;

    console.log( this.saved );

    this.animation.drop();

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

    this.animation.title( false, 0 );
    this.animation.timer( true, 600 );

    this.animation.zoom( true, duration, () => {

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

    this.animation.title( true, 600 );
    this.animation.timer( false, 0 );

    this.animation.zoom( false, 0, () => {} );

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
