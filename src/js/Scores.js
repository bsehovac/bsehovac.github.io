class Scores {

  constructor( game ) {

    this.game = game;

    this.scores = [];
    this.best = 0;

  }

  addScore( time ) {

    this.scores.push( time );

    if ( this.scores.lenght > 100 ) this.scores.shift();

    let bestTime = false    

    if ( time < this.best || this.best === 0 ) {

      this.best = time;
      bestTime = true;

    }

    this.game.storage.saveScores();

    return bestTime;

  }

}

export { Scores };
