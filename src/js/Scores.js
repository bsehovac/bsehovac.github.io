class Scores {

  constructor( game ) {

    this._game = game;

    this._scores = [];

  }

  addScore( time ) {

    this._scores.push( time );

    if ( this._scores.lenght > 100 ) this._scores.shift();

    this._game.storage.saveScores();

  }

}

export { Scores };
