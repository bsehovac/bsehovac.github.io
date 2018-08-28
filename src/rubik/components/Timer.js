class Timer {

	constructor( game, element ) {

		this.element = element;
		this.startTime = null;

		this.game = game;

	}

	start() {

		this.startTime = Date.now();

		this.game.onAnimate = function () {

			const delta = Date.now() - timer.startTime;
			timer.element.innerHTML = timer.convert( delta );

		};

	}

	stop() {

		const delta = Date.now() - this.startTime;

		game.onAnimate = function () {};

		return { time: this.convert( delta ), millis: delta };

	}

	convert( time ) {

		const millis = parseInt( ( time % 1000 ) / 100 );
		const seconds = parseInt( ( time / 1000 ) % 60 );
		const minutes = parseInt( ( time / ( 1000 * 60 ) ) % 60 );

		return minutes + ':' + ( seconds < 10 ? '0' : '' ) + seconds + '.' + millis;

	}

}

export { Timer };
