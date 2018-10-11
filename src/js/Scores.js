class Scores {

  constructor() {

    this._scores = [];

  }

  addScore( time ) {

    this._scores.push( 'time' );

    if ( this._scores.lenght > 100 ) this._scores.shift();

  } 

  loadScores() {

    try {

      const scoresData = JSON.parse( localStorage.getItem( 'scoresData' ) );

      if ( !scoresData ) throw new Error();

      this._scores = scoresData;

      return true;

    } catch( e ) {

      return false;

    }

  }

  clearScores() {

    localStorage.removeItem( 'scoresData' );

  }

}

export { Scores };