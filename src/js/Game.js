import { World } from './World.js';
import { Cube } from './Cube.js';
import { Controls } from './Controls.js';
import { Scrambler } from './Scrambler.js';
import { Transition } from './Transition.js';
import { Timer } from './Timer.js';
// import { Audio } from './Audio.js';
import { Preferences } from './Preferences.js';
import { Confetti } from './Confetti.js';
import { Scores } from './Scores.js';
import { Storage } from './Storage.js';

import { Icons } from './Icons.js';

const MENU = 0;
const PLAYING = 1;
const STATS = 2;
const PREFS = 3;

const SHOW = true;
const HIDE = false;

class Game {

  constructor() {

    this.dom = {
      game: document.querySelector( '.ui__game' ),
      texts: document.querySelector( '.ui__texts' ),
      prefs: document.querySelector( '.ui__prefs' ),
      stats: document.querySelector( '.ui__stats' ),
      texts: {
        title: document.querySelector( '.text--title' ),
        note: document.querySelector( '.text--note' ),
        timer: document.querySelector( '.text--timer' ),
        stats: document.querySelector( '.text--timer' ),
      },
      buttons: {
        prefs: document.querySelector( '.btn--prefs' ),
        back: document.querySelector( '.btn--back' ),
        stats: document.querySelector( '.btn--stats' ),
      }
    };

    this.storage = new Storage( this );
    this.world = new World( this );
    this.cube = new Cube( this );
    this.controls = new Controls( this );
    this.scrambler = new Scrambler( this );
    this.transition = new Transition( this );
    // this.audio = new Audio( this );
    this.timer = new Timer( this );
    this.preferences = new Preferences( this );
    this.confetti = new Confetti( this );
    this.scores = new Scores( this );

    this.initTapEvents();

    this.state = MENU;
    this.saved = false;

    this.storage.loadGame();
    this.storage.loadPreferences();
    this.storage.loadScores();

    // this.scrambler.scrambleLength = 1;

    this.preferences.init();
    this.world.enableShadows();

    this.transition.init();

    setTimeout( () => {

      this.transition.float();
      this.transition.cube( SHOW );

      setTimeout( () => this.transition.title( SHOW ), 700 );
      setTimeout( () => this.transition.buttons( [ 'prefs', 'stats' ], [] ), 1000 );

    }, 500 );

    // this.controls.onMove = data => { if ( this.audio.musicOn ) this.audio.click.play(); }
    this.controls.onSolved = () => {

      this.state = STATS;
      this.saved = false;
      this.storage.clearGame();

      this.timer.stop();
      this.scores.addScore( this.timer.deltaTime );
      this.timer.reset();

    }

  }

  initTapEvents() {

    let tappedTwice = false;

    this.dom.game.onclick = event => {

      if ( this.transition.activeTransitions > 0 ) return;
      if ( this.state == PLAYING ) return;

      if ( ! tappedTwice ) {

        tappedTwice = true;
        setTimeout( () => tappedTwice = false, 300 );
        return false;

      }

      if ( ! this.saved ) {

        this.scrambler.scramble();
        this.controls.scrambleCube();

      }

      const duration = this.saved ? 0 : this.scrambler.converted.length * this.controls.scrambleSpeed;

      this.state = PLAYING;
      this.saved = true;

      this.transition.buttons( [ 'back' ], [ 'stats', 'prefs' ] );

      this.transition.zoom( SHOW, duration );
      this.transition.title( HIDE );

      setTimeout( () => this.transition.timer( SHOW ), this.transition.durations.zoom - 1000 );
      setTimeout( () => this.controls.enable(), this.transition.durations.zoom );

    };

    this.dom.buttons.back.onclick = event => {

      if ( this.transition.activeTransitions > 0 ) return;

      if ( this.state === PLAYING ) {

        this.state = MENU;

        this.transition.buttons( [ 'stats', 'prefs' ], [ 'back' ] );

        this.transition.zoom( HIDE, 0 );

        this.transition.timer( HIDE );
        setTimeout( () => this.transition.title( SHOW ), this.transition.durations.zoom - 1000 );

        this.playing = false;
        this.controls.disable();

      } else if ( this.state === PREFS ) {

        this.state = MENU;

        this.transition.buttons( [ 'stats', 'prefs' ], [ 'back' ] );

        this.transition.preferences( HIDE );

        setTimeout( () => this.transition.cube( SHOW ), 500 );
        setTimeout( () => this.transition.title( SHOW ), 1200 );

      } else if ( this.state === STATS ) {

        this.state = MENU;

        this.transition.buttons( [ 'stats', 'prefs' ], [ 'back' ] );

        this.transition.stats( HIDE );

        setTimeout( () => this.transition.cube( SHOW ), 500 );
        setTimeout( () => this.transition.title( SHOW ), 1200 );

      }

    };

    this.dom.buttons.prefs.onclick = event => {

      if ( this.transition.activeTransitions > 0 ) return;

      this.state = PREFS;

      this.transition.buttons( [ 'back' ], [ 'stats', 'prefs' ] );

      this.transition.title( HIDE );
      this.transition.cube( HIDE );

      setTimeout( () => this.transition.preferences( SHOW ), 1000 );

    };

    this.dom.buttons.stats.onclick = event => {

      if ( this.transition.activeTransitions > 0 ) return;

      this.state = STATS;

      this.transition.buttons( [ 'back' ], [ 'stats', 'prefs' ] );

      this.transition.title( HIDE );
      this.transition.cube( HIDE );

      setTimeout( () => this.transition.stats( SHOW ), 1000 );

    }

  }

}

const game = new Game();

window.game = game;
