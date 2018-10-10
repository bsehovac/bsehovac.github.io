import { Animation } from './plugins/Animation.js';

class Timer extends Animation {

	constructor( game ) {

		super( false );

		this.name = 'Timer';

		this.game = game;

		this.startTime = 0;
		this.currentTime = 0;
		this.converted = '0:00';
		this.animate = null;

	}

	start( continueGame ) {

		this.startTime = continueGame ? ( Date.now() - this.deltaTime ) : Date.now();
		this.deltaTime = 0;
		this.converted = this.convert();

		super.start();

	}

	stop() {

		this.currentTime = Date.now();
		this.deltaTime = this.currentTime - this.startTime;
		this.convert();

		super.stop();

		return { time: this.converted, millis: this.deltaTime };

	}

	update() {

		const old = this.converted;

		this.currentTime = Date.now();
		this.deltaTime = this.currentTime - this.startTime;
		this.convert();

		if ( this.converted != old ) {

			localStorage.setItem( 'gameTime', JSON.stringify( this.deltaTime ) );
			this.setText();

		}

	}

	convert() {

		this.seconds = parseInt( ( this.deltaTime / 1000 ) % 60 );
		this.minutes = parseInt( ( this.deltaTime / ( 1000 * 60 ) ) );

		this.converted = this.minutes + ':' + ( this.seconds < 10 ? '0' : '' ) + this.seconds;

	}

	setText() {

		this.game.dom.timer.innerHTML = this.converted;

	}

}

export { Timer };
