class Timer {

	constructor( game ) {

		this.game = game;

		this.startTime = 0;
		this.currentTime = 0;
		this.converted = '0:00';
		this.animate = null;

		this.update = this.update.bind( this );

	}

	start( continueGame ) {

		this.startTime = continueGame ? ( Date.now() - this.deltaTime ) : Date.now();
		this.deltaTime = 0;
		this.converted = this.convert();

		this.animate = requestAnimationFrame( this.update );

	}

	stop() {

		this.currentTime = Date.now();
		this.deltaTime = this.currentTime - this.startTime;
		this.convert();

		cancelAnimationFrame( this.animate );

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

		this.animate = requestAnimationFrame( this.update );

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
