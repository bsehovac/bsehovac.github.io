import { Animation } from './Animation.js';

class Timer extends Animation {

	constructor( game ) {

		super( false );

		this._game = game;
		this.reset();
		
	}

	start( continueGame ) {

		this._startTime = continueGame ? ( Date.now() - this._deltaTime ) : Date.now();
		this._deltaTime = 0;
		this._converted = this.convert();

		super.start();

	}

	reset() {

		this._startTime = 0;
		this._currentTime = 0;
		this._deltaTime = 0;
		this._converted = '0:00';

	}

	stop() {

		this._currentTime = Date.now();
		this._deltaTime = this._currentTime - this._startTime;
		this.convert();

		super.stop();

		return { time: this._converted, millis: this._deltaTime };

	}

	update() {

		const old = this._converted;

		this._currentTime = Date.now();
		this._deltaTime = this._currentTime - this._startTime;
		this.convert();

		if ( this._converted != old ) {

			localStorage.setItem( 'gameTime', this._deltaTime );
			this.setText();

		}

	}

	convert() {

		const seconds = parseInt( ( this._deltaTime / 1000 ) % 60 );
		const minutes = parseInt( ( this._deltaTime / ( 1000 * 60 ) ) );

		this._converted = minutes + ':' + ( seconds < 10 ? '0' : '' ) + seconds;

	}

	setText() {

		this._game.dom.timer.innerHTML = this._converted;

	}

	getDeltaTime() {

		return this._deltaTime;

	}

	setDeltaTime( time ) {

		this._deltaTime = time;

	}

}

export { Timer };
