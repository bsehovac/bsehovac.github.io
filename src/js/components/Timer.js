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
		const seconds = parseInt( ( time / 1000 ) % 60 );
		const minutes = parseInt( ( time / ( 1000 * 60 ) ) /*% 60*/ );

		return minutes + ':' + ( seconds < 10 ? '0' : '' ) + seconds; // + '.' + millis;

	}

}

export { Timer };
