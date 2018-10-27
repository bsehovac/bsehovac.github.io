import { CubeModel } from './CubeModel.js';

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

		const cubeModel = CubeModel( this.size, this.positions, this.colors );

		this.pieces = cubeModel.pieces;
		this.edges = cubeModel.edges;

		this.pieces.forEach( piece => {

			this.cubes.push( piece.userData.cube );
			this.object.add( piece );

		} );

		this.holder.traverse( node => {

			if ( node.frustumCulled ) node.frustumCulled = false;

		} );

		this.game.world.scene.add( this.holder );

	}

	reset() {

		this.game.controls.edges.rotation.set( 0, 0, 0 );

		this.holder.rotation.set( 0, 0, 0 );
		this.object.rotation.set( 0, 0, 0 );
		this.animator.rotation.set( 0, 0, 0 );

		this.pieces.forEach( piece => {

			piece.position.copy( piece.userData.start.position );
			piece.rotation.copy( piece.userData.start.rotation );

		} );

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

}

export { Cube };
