class Scramble {

	constructor( cube, times ) {

		const scramble = this;
		const size = cube.size;

		let count = 0;
		const moves = ( typeof times === 'string' ) ? times.split( ' ' ) : [];

		if ( moves.length < 1 ) {

			const faces = 'UDLRFB';
			const modifiers = [ "", "'", "2" ];
			const total = ( typeof times === 'undefined' ) ? 25 : times;

			// TODO: Other Cube Sizes Scramble

			while ( count < total ) {

				const move = faces[ Math.floor( Math.random() * 6 ) ] + modifiers[ Math.floor( Math.random() * 3 ) ];
				if ( count > 0 && move.charAt( 0 ) == moves[ count - 1 ].charAt( 0 ) ) continue;
				if ( count > 1 && move.charAt( 0 ) == moves[ count - 2 ].charAt( 0 ) ) continue;
				moves.push( move );
				count ++;

			}

		}

		scramble.callback = () => {};
		scramble.moves = moves;
		scramble.print = moves.join( ' ' );
		scramble.convert();

		return scramble;

	}

	convert() {

		const scramble = this;
		const moves = scramble.moves;
		const converted = [];

		moves.forEach( move => {

			const face = move.charAt( 0 );
			const modifier = move.charAt( 1 );

			const axis = { D: 'y', U: 'y', L: 'x', R: 'x', F: 'z', B: 'z' }[ face ];
			const row = { D: 0, U: 2, L: 0, R: 2, B: 0, F: 2 }[ face ];
			const layer = { x: 'y', y: 'x', z: 'z' }[ axis ];

			const angle = ( Math.PI / 2 )
				* ( ( row == 2 ) ? - 1 : 1 )
				* ( ( modifier == "'" ) ? - 1 : 1 );

			const convertedMove = { layer, row, axis, angle, name: move };

			converted.push( convertedMove );
			if ( modifier == "2" ) converted.push( convertedMove );

		} );

		scramble.converted = converted;
		return converted;

	}

}

export { Scramble };
