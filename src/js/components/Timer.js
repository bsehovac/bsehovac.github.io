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
		this.converted = this.convert( this.deltaTime );

		this.world.onAnimate = () => {

			const old = this.converted;

			this.currentTime = Date.now();
			this.deltaTime = this.currentTime - this.startTime;
			this.converted = this.convert( this.deltaTime );

			if ( this.converted != old ) {

				localStorage.setItem( 'gameTime', JSON.stringify( this.deltaTime ) );
				this.element.innerHTML = this.converted;

			}

		};

	}

	stop() {

		this.currentTime = Date.now();
		this.deltaTime = this.currentTime - this.startTime;

		this.world.onAnimate = () => {};

		return { time: this.convert( this.deltaTime ), millis: this.deltaTime };

	}

	convert( time ) {

		this.seconds = parseInt( ( time / 1000 ) % 60 );
		this.minutes = parseInt( ( time / ( 1000 * 60 ) ) /*% 60*/ );

		const print = this.minutes + ':' + ( this.seconds < 10 ? '0' : '' ) + this.seconds;

		return print.replace( /0/g, 'o' );

	}

}

export { Timer };
