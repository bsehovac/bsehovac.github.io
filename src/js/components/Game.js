class Game {

  constructor() {

    this.dom = {
      game: document.querySelector( '.ui__game' ),
      prefs: document.querySelector( '.ui__prefs' ),
      menu: document.querySelector( '.ui__menu' ),
      title: document.querySelector( '.ui__text--title' ),
      note: document.querySelector( '.ui__text--note' ),
      timer: document.querySelector( '.ui__text--timer' ),
      buttons: {
        settings: document.querySelector( '.btn--settings' ),
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

    this.initStart();
    //this.initPause();
    this.initPrefs();

    this.saved = this.cube.loadState();
    this.playing = false;
    this.animating = true;

    this.transition.drop();

    this.controls.onMove = data => { if ( this.audio.musicOn ) this.audio.click.play(); }
    this.controls.onSolved = () => { this.timer.stop(); this.cube.clearState(); }

  }

  initPause() {

    this.dom.buttons.home.onclick = e => {

      e.stopPropagation();
      if ( !this.playing ) return;

      // this.dom.buttons.home.style.visibility = 'hidden';

      this.playing = false;
      this.timer.stop();
      this.controls.disabled = true;

      this.transition.title( true, 600 );
      this.transition.timer( false, 0 );

      this.transition.zoom( false, 0, () => {} );

    }

  }

  initStart() {

    let tappedTwice = false

    const tapHandler = event => {

      event.preventDefault();

      if ( ! tappedTwice ) {

          tappedTwice = true;
          setTimeout( () => { tappedTwice = false; }, 300 );
          return false;

      }

      if ( this.playing || this.animating ) return;
      this.animating = true;

      const start = Date.now();
      let duration = 0;

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
        this.animating = false;
        this.controls.disabled = false;
        this.timer.start( this.saved );
        this.saved = true;

      } );

    };

    this.dom.game.addEventListener( 'click', tapHandler, false );
    this.dom.game.addEventListener( 'touchstart', tapHandler, false );

  }

  initPrefs() {

    const button = this.dom.buttons.settings;

    button.addEventListener( 'click', e => {

      e.stopPropagation();

      if ( this.animating ) return;
      this.animating = true;
      setTimeout( () => { this.animating = false; }, 1500 );

      button.classList.toggle( 'is-active' );

      if ( button.classList.contains( 'is-active' ) ) {

        if ( !this.playing ) {

          this.transition.title( false, 0 );

        } else {

          this.controls.disabled = true;
          this.timer.stop();
          this.transition.timer( false, 0 );

        }

        this.transition.preferences( true, 600 );
        this.dom.game.classList.add( 'is-inactive' );
        this.dom.game.classList.remove( 'is-active' );

      } else {

        if ( !this.playing ) {

          this.transition.title( true, 600 );

        } else {

          this.dom.timer.innerHTML = this.timer.convert( this.timer.deltaTime );
          this.transition.timer( true, 600 );
          setTimeout( () => {

            this.controls.disabled = false;
            this.timer.start( true );

          }, 1500 );

        }

        this.transition.preferences( false, 0 );
        this.dom.game.classList.add( 'is-active' );
        this.dom.game.classList.remove( 'is-inactive' );

      }

    }, false );

  }

}

export { Game };
