class Scores {

  constructor( game ) {

    this.game = game;

    this.scores = [];

  }

  addScore( time ) {

    this.scores.push( time );

    if ( this.scores.lenght > 100 ) this.scores.shift();

    this.game.storage.saveScores();

  }

}

export { Scores };
