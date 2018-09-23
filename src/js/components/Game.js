class Game {

  constructor( container ) {

    this.dom = {
      container: document.querySelector( '.game' ),
      main: document.querySelector( '.ui__main' ),
      title: document.querySelector( '.ui__title' ),
      start: document.querySelector( '.ui__start' ),
      timer: document.querySelector( '.ui__timer' ),
      buttons: {
        settings: document.querySelector( '.ui__icon--settings' ),
        // audio: document.querySelector( '.ui__icon--audio' ),
        // home: document.querySelector( '.ui__icon--home' ),
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

    this.saved = this.cube.loadState();
    this.playing = false;

    this.animation.drop();

    this.controls.onMove = data => { if ( this.audio.musicOn ) this.audio.click.play(); }
    this.controls.onSolved = () => { this.timer.stop(); this.cube.clearState(); }

    this.dom.buttons.settings.onclick = e => {

      e.stopPropagation();
      if ( this.playing ) this.pause();

    }

  }

  start() {

    const start = Date.now();
    let duration = 0;

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

}

export { Game };
