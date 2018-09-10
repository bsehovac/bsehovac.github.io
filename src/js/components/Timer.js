class Timer {

	constructor( world, element ) {

		this.element = element;
		this.startTime = null;

		this.world = world;
		world.timer = this;

	}

	start( continueGame ) {

		this.startTime = ( continueGame ) ? ( Date.now() - this.deltaTime ) : Date.now();
		this.deltaTime = 0;

		this.seconds = 0;
		this.minutes = 0;

		this.world.onAnimate = () => {

			this.currentTime = Date.now();
			this.deltaTime = this.currentTime - this.startTime;
			this.element.innerHTML = this.convert( this.deltaTime );

		};

	}

	stop() {

		this.currentTime = Date.now();
		this.deltaTime = this.currentTime - this.startTime;

		world.onAnimate = () => {};

		return { time: this.convert( this.deltaTime ), millis: this.deltaTime };

	}

	convert( time ) {

		// const millis = parseInt( ( time % 1000 ) / 100 );
		const oldSeconds = this.seconds;

		this.seconds = parseInt( ( time / 1000 ) % 60 );
		this.minutes = parseInt( ( time / ( 1000 * 60 ) ) /*% 60*/ );

		if ( oldSeconds !== this.seconds ) localStorage.setItem( 'gameTime', JSON.stringify( time ) );

		return this.minutes + ':' + ( this.seconds < 10 ? '0' : '' ) + this.seconds; // + '.' + millis;

	}

}

export { Timer };
