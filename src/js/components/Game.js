class Game {

  constructor() {

    /*
    ███████ ███████ ████████     ██       █████  ███    ███ ██████  ███████ ██████  ████████ 
    ██      ██         ██        ██      ██   ██ ████  ████ ██   ██ ██      ██   ██    ██    
    ███████ █████      ██        ██      ███████ ██ ████ ██ ██████  █████   ██████     ██    
         ██ ██         ██        ██      ██   ██ ██  ██  ██ ██   ██ ██      ██   ██    ██    
    ███████ ███████    ██        ███████ ██   ██ ██      ██ ██████  ███████ ██   ██    ██        
    */

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

    // this.world = new CUBE.World( this );
    // this.confetti = new CUBE.Confetti( this );

    // // this.world.camera.position.set( 0, 0, -15 )
    // // this.world.camera.lookAt( 0, 0, 0 )

    // let active = false;

    // this.dom.game.onclick = e => {

    //   active = ! active;

    //   if ( active ) game.confetti.start();
    //   else game.confetti.stop();

    // }

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
    // this.initPause();
    this.initPrefs();

    this.saved = this.cube.loadState();
    this.playing = false;

    this.transition.float();
    this.transition.cube( true );

    this.controls.onMove = data => { if ( this.audio.musicOn ) this.audio.click.play(); }
    this.controls.onSolved = () => { this.timer.stop(); this.cube.clearState(); }

  }

  // initPause() {

  //   this.dom.buttons.home.onclick = e => {

  //     e.stopPropagation();
  //     if ( !this.playing ) return;

  //     this.playing = false;
  //     this.controls.disable();

  //     this.transition.title( true );
  //     setTimeout( () => this.transition.timer( false ), 500 );

  //     this.transition.zoom( false, 0, () => {} );

  //   }

  // }

  initStart() {

    let tappedTwice = false

    const tapHandler = event => {

      event.preventDefault();

      if ( ! tappedTwice ) {

          tappedTwice = true;
          setTimeout( () => { tappedTwice = false; }, 300 );
          return false;

      }

      if ( this.playing ) return;

      const start = Date.now();
      let duration = 0;

      if ( ! this.saved ) {

        this.scrambler.scramble();
        this.controls.scrambleCube( () => {} );

        duration = this.scrambler.converted.length * this.controls._scrambleSpeed;

      }

      this.transition.title( false, 0 );
      this.transition.timer( true, 500 );

      this.transition.zoom( true, duration, () => {

        this.playing = true;
        this.controls.enable();
        this.timer.start( this.saved );
        this.saved = true;

      } );

    };

    this.dom.game.addEventListener( 'click', tapHandler, false );
    this.dom.game.addEventListener( 'touchstart', tapHandler, false );

  }

  initPrefs() {

    const button = this.dom.buttons.settings;

    button.addEventListener( 'click', () => {

      button.classList.toggle( 'active' );

      if ( button.classList.contains( 'active' ) ) {

        this.transition.cube( false );
        setTimeout( () => this.transition.preferences( true ), 300 );

      } else {

        this.transition.preferences( false )
        this.transition.cube( true );

      }

    }, false );

  }

}

export { Game };
