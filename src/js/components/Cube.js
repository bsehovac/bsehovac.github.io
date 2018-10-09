import { CubePieces } from './CubePieces.js';

class Cube {

	constructor( game ) {

		this.game = game;

		this.size = 3;

		this.colors = {
			right: 0x41aac8,
			left: 0x82ca38,
			top: 0xfff7ff,
			bottom: 0xffef48,
			front: 0xef3923,
			back: 0xff8c0a,
			piece: 0x08101a,
		};

		this.holder = new THREE.Object3D();
		this.object = new THREE.Object3D();
		this.animator = new THREE.Object3D();

		this.holder.add( this.animator );
		this.animator.add( this.object );

		this.cubes = [];

		this.positions = this.generatePositions( this.size );
		this.pieces = CubePieces( this.size, this.positions, this.colors );

		this.pieces.forEach( piece => {

			this.cubes.push( piece.userData.cube );
			this.object.add( piece );

		} );

		this.game.world.scene.add( this.holder );

	}

	generatePositions( size ) {

		let x, y, z;
		const start = -( size - 1 ) / 2;
		const positions = [];

		for ( x = 0; x < size; x ++ ) {

			for ( y = 0; y < size; y ++ ) {

		  	for ( z = 0; z < size; z ++ ) {

		  		let position = new THREE.Vector3( start + x, start + y, start + z );
		  		let edges = [];

		  		if ( x == 0 ) edges.push(0);
		  		if ( x == size - 1 ) edges.push(1);

		  		if ( y == 0 ) edges.push(2);
		  		if ( y == size - 1 ) edges.push(3);

		  		if ( z == 0 ) edges.push(4);
		  		if ( z == size - 1 ) edges.push(5);

		  		position.edges = edges;

		  		positions.push( position );

		  	}

		  }

		}

		return positions;

	}

	loadState() {

		try {

			const gameInProgress = localStorage.getItem( 'gameInProgress' ) == 'yes';

			if ( !gameInProgress ) throw new Error();

			const cubeData = JSON.parse( localStorage.getItem( 'cubeData' ) );
			// const gameMoves = JSON.parse( localStorage.getItem( 'gameMoves' ) );
			const gameTime = localStorage.getItem( 'gameTime' );

			if ( !cubeData || /*!gameMoves ||*/ !gameTime ) throw new Error();

			this.pieces.forEach( piece => {

				const index = cubeData.names.indexOf( piece.name );

				const position = cubeData.positions[index];
				const rotation = cubeData.rotations[index];

				piece.position.set( position.x, position.y, position.z );
				piece.rotation.set( rotation.x, rotation.y, rotation.z );

			} );

			// this.game.controls.moves = gameMoves;

			// this.game.controls.moves.forEach( move => {

			// 	const angle = move[0];
			// 	move[0] = new THREE.Vector3( angle.x, angle.y, angle.z );

			// } );

			this.game.timer.deltaTime = gameTime;

			return gameInProgress;

		} catch( e ) {

			return false;

		}

	}

	saveState() {

		const cubeData = {
			names: [],
			positions: [],
			rotations: [],
		};

		this.pieces.forEach( piece => {

			cubeData.names.push( piece.name );
		  cubeData.positions.push( piece.position );
		  cubeData.rotations.push( piece.rotation.toVector3() );

		} );

		localStorage.setItem( 'gameInProgress', 'yes' );
		localStorage.setItem( 'cubeData', JSON.stringify( cubeData ) );
		// localStorage.setItem( 'gameMoves', JSON.stringify( this.game.controls.moves ) );
		localStorage.setItem( 'gameTime', this.game.timer.deltaTime );

	}

	clearState() {

		localStorage.removeItem( 'gameInProgress' );
		localStorage.removeItem( 'cubeData' );
		// localStorage.removeItem( 'gameMoves' );
		localStorage.removeItem( 'gameTime' );

	}

}

export { Cube };
