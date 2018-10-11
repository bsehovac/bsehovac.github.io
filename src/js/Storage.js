class Storage {

  constructor( game ) {

    this._game = game;

  }

  // GAME

  loadGame() {

    try {

      const gameInProgress = localStorage.getItem( 'gameInProgress' ) === 'true';

      if ( ! gameInProgress ) throw new Error();

      const gameCubeData = JSON.parse( localStorage.getItem( 'gameCubeData' ) );
      const gameTime = parseInt( localStorage.getItem( 'gameTime' ) );

      if ( ! gameCubeData || ! gameTime ) throw new Error();

      this._game.cube.pieces.forEach( piece => {

        const index = gameCubeData.names.indexOf( piece.name );

        const position = gameCubeData.positions[index];
        const rotation = gameCubeData.rotations[index];

        piece.position.set( position.x, position.y, position.z );
        piece.rotation.set( rotation.x, rotation.y, rotation.z );

      } );

      this._game.timer.setDeltaTime( gameTime );

      this._game.saved = true;

    } catch( e ) {

      this._game.saved = false;

    }

  }

  saveGame() {

    const gameInProgress = true;
    const gameCubeData = { names: [], positions: [], rotations: [] };
    const gameTime = this._game.timer.getDeltaTime();

    this._game.cube.pieces.forEach( piece => {

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

      if ( ! scoresData ) throw new Error();

      this._game.scores._scores = scoresData;

      return true;

    } catch( e ) {

      return false;

    }

  }

  saveScores() {

    const scoresData = this._game.scores._scores;

    localStorage.setItem( 'scoresData', JSON.stringify( scoresData ) );

  }

  clearScores() {

    localStorage.removeItem( 'scoresData' );

  }

  // PREFERENCES

  loadPreferences() {

    try {

      const preferences = JSON.parse( localStorage.getItem( 'preferences' ) );

      if ( ! preferences ) throw new Error();

      this._game.controls._flipSpeed = preferences.flipSpeed;
      this._game.controls._flipBounce = preferences.flipBounce;
      this._game.scrambler.scrambleLength = preferences.scrambleLength;

      this._game.world.fov = parseFloat( preferences.fov );
      this._game.world.resize();

      return true;

    } catch (e) {

      return false;

    }

  }

  savePreferences() {

    const preferences = {
      flipSpeed: this._game.controls._flipSpeed,
      flipBounce: this._game.controls._flipBounce,
      scrambleLength: this._game.scrambler.scrambleLength,
      fov: this._game.world.fov,
      theme: null,
    };

    localStorage.setItem( 'preferences', JSON.stringify( preferences ) );

  }

  clearPreferences() {

    localStorage.removeItem( 'preferences' );

  }

}

export { Storage };
