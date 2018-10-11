import { World } from './World.js';
import { Cube } from './Cube.js';
import { Controls } from './Controls.js';
import { Scrambler } from './Scrambler.js';
import { Transition } from './Transition.js';
import { Timer } from './Timer.js';
import { Audio } from './Audio.js';
import { Preferences } from './Preferences.js';
import { Confetti } from './Confetti.js';

import { Icons } from './Icons.js';

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
        home: document.querySelector( '.btn--home' ),
      }
    };

    this.world = new World( this );
    this.cube = new Cube( this );
    this.controls = new Controls( this );
    this.scrambler = new Scrambler( this );
    this.transition = new Transition( this );
    this.audio = new Audio( this );
    this.timer = new Timer( this );
    this.preferences = new Preferences( this );
    this.confetti = new Confetti( this );

    this.initTapEvents();

    this.saved = this.cube.loadState();
    this.playing = false;

    this.transition.initialize();
    this.transition.cube( true );
    this.transition.float();

    this.controls.onMove = data => { if ( this.audio.musicOn ) this.audio.click.play(); }
    this.controls.onSolved = () => { this.timer.stop(); this.cube.clearState(); }

  }

  initTapEvents() {

    let tappedTwice = false;

    this.dom.game.onclick = event => {

      event.preventDefault();

      if ( ! tappedTwice ) {

        tappedTwice = true;
        setTimeout( () => tappedTwice = false, 300 );
        return false;

      }

      if ( this.playing || this.transition.getActive() > 0 ) return;

      const start = Date.now();
      let duration = 0;

      if ( ! this.saved ) {

        this.scrambler.scramble();
        this.controls.scrambleCube();

        duration = this.scrambler.converted.length * this.controls._scrambleSpeed;

      }

      this.transition.zoom( true, duration );

    };

    this.dom.buttons.home.onclick = event => {

      if ( !this.playing || this.transition.getActive() > 0 ) return;

      this.transition.zoom( false, 0 );

      this.playing = false;
      this.controls.disable();

    };

    this.dom.buttons.settings.onclick = event => {

      if ( this.transition.getActive() > 0 ) return;

      event.target.classList.toggle( 'active' );

      if ( event.target.classList.contains( 'active' ) ) {

        this.transition.cube( false );
        setTimeout( () => this.transition.preferences( true ), 1000 );

      } else {

        this.transition.preferences( false )
        setTimeout( () => this.transition.cube( true ), 500 );

      }

    };

  }

}

const game = new Game();