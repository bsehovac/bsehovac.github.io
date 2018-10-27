class Storage {

  constructor( game ) {

    this.game = game;

    const gameVersion = 3;
    const userVersion = parseInt( localStorage.getItem( 'version' ) );

    if ( ! userVersion || userVersion !== gameVersion ) {

      this.clearGame();
      // this.clearScores();
      this.clearPreferences();
      localStorage.setItem( 'version', gameVersion );

    }

  }

  init() {

    this.loadGame();
    this.loadScores();
    this.loadPreferences();

  }

  // GAME

  loadGame() {

    try {

      const gameInProgress = localStorage.getItem( 'gameInProgress' ) === 'true';

      if ( ! gameInProgress ) throw new Error();

      const gameCubeData = JSON.parse( localStorage.getItem( 'gameCubeData' ) );
      const gameTime = parseInt( localStorage.getItem( 'gameTime' ) );

      if ( ! gameCubeData || ! gameTime ) throw new Error();

      this.game.cube.pieces.forEach( piece => {

        const index = gameCubeData.names.indexOf( piece.name );

        const position = gameCubeData.positions[index];
        const rotation = gameCubeData.rotations[index];

        piece.position.set( position.x, position.y, position.z );
        piece.rotation.set( rotation.x, rotation.y, rotation.z );

      } );

      this.game.timer.deltaTime = gameTime;

      this.game.saved = true;

    } catch( e ) {

      this.game.saved = false;

    }

  }

  saveGame() {

    const gameInProgress = true;
    const gameCubeData = { names: [], positions: [], rotations: [] };
    const gameTime = this.game.timer.deltaTime;

    this.game.cube.pieces.forEach( piece => {

      gameCubeData.names.push( piece.name );
      gameCubeData.positions.push( piece.position );
      gameCubeData.rotations.push( piece.rotation.toVector3() );

    } );

    localStorage.setItem( 'gameInProgress', gameInProgress );
    localStorage.setItem( 'gameCubeData', JSON.stringify( gameCubeData ) );
    localStorage.setItem( 'gameTime', gameTime );

  }

  clearGame() {

    localStorage.removeItem( 'gameInProgress' );
    localStorage.removeItem( 'gameCubeData' );
    localStorage.removeItem( 'gameTime' );

  }

  // SCORE

  loadScores() {

    try {

      const scoresData = JSON.parse( localStorage.getItem( 'scoresData' ) );
      const scoresBest = parseInt( localStorage.getItem( 'scoresBest' ) );
      const scoresWorst = parseInt( localStorage.getItem( 'scoresWorst' ) );
      const scoresSolves = parseInt( localStorage.getItem( 'scoresSolves' ) );

      if ( ! scoresData || ! scoresBest || ! scoresSolves || ! scoresWorst ) throw new Error();

      this.game.scores.scores = scoresData;
      this.game.scores.best = scoresBest;
      this.game.scores.solves = scoresSolves;
      this.game.scores.worst = scoresWorst;

      return true;

    } catch( e ) {

      this.clearScores();

      return false;

    }

  }

  saveScores() {

    const scoresData = this.game.scores.scores;
    const scoresBest = this.game.scores.best;
    const scoresWorst = this.game.scores.worst;
    const scoresSolves = this.game.scores.solves;

    localStorage.setItem( 'scoresData', JSON.stringify( scoresData ) );
    localStorage.setItem( 'scoresBest', JSON.stringify( scoresBest ) );
    localStorage.setItem( 'scoresWorst', JSON.stringify( scoresWorst ) );
    localStorage.setItem( 'scoresSolves', JSON.stringify( scoresSolves ) );

  }

  clearScores() {

    localStorage.removeItem( 'scoresData' );
    localStorage.removeItem( 'scoresBest' );
    localStorage.removeItem( 'scoresWorst' );
    localStorage.removeItem( 'scoresSolves' );

  }

  // PREFERENCES

  loadPreferences() {

    try {

      const preferences = JSON.parse( localStorage.getItem( 'preferences' ) );

      if ( ! preferences ) throw new Error();

      this.game.controls.flipSpeed = preferences.flipSpeed;
      this.game.controls.flipBounce = preferences.flipBounce;
      this.game.scrambler.scrambleLength = preferences.scrambleLength;

      this.game.audio.setVolume( preferences.audioVolume );

      this.game.world.fov = parseFloat( preferences.fov );
      this.game.world.resize();

      this.game.cube.setTheme( preferences.theme );

      return true;

    } catch (e) {

      this.game.controls.flipSpeed = 300;
      this.game.controls.flipBounce = 1.70158;
      this.game.scrambler.scrambleLength = 20;

      this.game.audio.setVolume( 0.2 );

      this.game.world.fov = 15;
      this.game.world.resize();

      this.game.cube.setTheme( 'default' );

      this.savePreferences();

      return false;

    }

  }

  savePreferences() {

    const preferences = {
      flipSpeed: this.game.controls.flipSpeed,
      flipBounce: this.game.controls.flipBounce,
      scrambleLength: this.game.scrambler.scrambleLength,
      audioVolume: this.game.audio.volume,
      fov: this.game.world.fov,
      theme: this.game.cube.theme,
    };

    localStorage.setItem( 'preferences', JSON.stringify( preferences ) );

  }

  clearPreferences() {

    localStorage.removeItem( 'preferences' );

  }

}

export { Storage };
