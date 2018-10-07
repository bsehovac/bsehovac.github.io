class Game {

  constructor() {

    this.dom = {
      game: document.querySelector( '.ui__game' ),
      texts: document.querySelector( '.ui__texts' ),
      prefs: document.querySelector( '.ui__prefs' ),

      title: document.querySelector( '.text--title' ),
      note: document.querySelector( '.text--note' ),
      timer: document.querySelector( '.text--timer' ),

      buttons: {
        settings: document.querySelector( '.btn--settings' ),
      }
    };

    this.springSystem = new REBOUND.SpringSystem();

    this.world = new CUBE.World( this );
    this.cube = new CUBE.Cube( this );
    this.controls = new CUBE.Controls( this );
    this.scrambler = new CUBE.Scrambler( this );
    this.transition = new CUBE.Transition( this );
    this.audio = new CUBE.Audio( this );
    this.timer = new CUBE.Timer( this );
    this.preferences = new CUBE.Preferences( this );
    this.icons = new CUBE.Icons();

    // this.initStart();
    // this.initPause();
    this.initPrefs();

    // this.saved = this.cube.loadState();
    this.playing = false;
    this.animating = true;

    this.transition.float();
    this.transition.drop();

    this.controls.onFirstMove = data => {

      this.timer.start( this.saved );
      this.timer.render = false;

      this.transition.title( false, () => {

        this.dom.timer.innerHTML = this.timer.convert( Math.round( this.timer.deltaTime / 1000 ) * 1000 );

        this.transition.timer( true, () => { this.timer.render = true } );

      } );
      if ( this.audio.musicOn ) this.audio.click.play();

    }
    // this.controls.onSolved = () => { this.timer.stop(); this.cube.clearState(); }

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

        // this.scrambler.scramble();
        // this.controls.scrambleCube( () => {} );

        // duration = this.scrambler.converted.length * this.controls.options.scrambleSpeed;

      } else {

        this.dom.timer.classList.remove( 'hide' );
        this.dom.timer.innerHTML = this.timer.convert( this.timer.deltaTime );

      }

      this.transition.title( false, () => this.transition.timer( true ) );

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

  initPause() {

    this.dom.buttons.home.onclick = e => {

      e.stopPropagation();
      if ( !this.playing ) return;

      // this.dom.buttons.home.style.visibility = 'hidden';

      this.playing = false;
      this.timer.stop();
      this.controls.disabled = true;

      this.transition.title( true, () => this.transition.timer( false ) );

      this.transition.zoom( false, 0, () => {} );

    }

  }

  initPrefs() {

    const button = this.dom.buttons.settings;

    button.addEventListener( 'click', () => {

      if ( this.animating ) return;

      this.animating = true;

      button.classList.toggle( 'is-active' );

      if ( button.classList.contains( 'is-active' ) ) {

        if ( this.playing ) {

          this.controls.disabled = true;
          this.timer.stop();

        }

        this.transition.springs.drop.setEndValue( 1 );

        this.transition[ this.playing ? 'timer' : 'title' ]( false, () => {

          this.transition.preferences( true, () => {

            this.animating = false;

          } )

        } );

      } else {

        if ( this.playing ) {

          this.dom.timer.classList.remove( 'hide' );
          this.dom.timer.innerHTML = this.timer.convert( this.timer.deltaTime );

        }

        this.transition.springs.drop.setEndValue( 0 );

        this.transition.preferences( false, () => {

          this.transition[ this.playing ? 'timer' : 'title' ]( true, () => {

            this.animating = false;

            if ( this.playing ) {

              this.controls.disabled = false;
              this.timer.start( true );

            }

          } );

        } );

      }

    }, false );

  }

}

export { Game };
