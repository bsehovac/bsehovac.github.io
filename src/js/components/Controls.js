import { Draggable } from './Draggable.js';

class Controls {

	constructor( cube, options ) {

		this.options = Object.assign( {
			animationSpeed: 0.15,
			animationBounce: 1.75,
			scrambleSpeed: 0.1,
			scrambleBounce: 0,
			minimumRotationAngle: Math.PI / 12, // 15deg
			dragDelta: 20,
		}, options || {} );

		this.raycaster = new THREE.Raycaster();
		this.rotation = new THREE.Vector3();

		this.group = new THREE.Object3D();
		cube.object.add( this.group );

		this.helper = new THREE.Mesh(
			new THREE.PlaneGeometry( 2, 2 ),
			new THREE.MeshBasicMaterial( { depthWrite: false, side: THREE.DoubleSide, transparent: true, opacity: 0 } )
		);
		this.helper.position.set( 0, 0, 0 );

		this.moves = [];

		this.intersect = {
			piece: null,
			start: null,
		};

		this.drag = {
			active: false, // drag is active
			layer: null, // drag selected layer
			direction: null, // drag direction - temp between start and drag
			rotation: null, // drag rotation axis
			type: null, // drag type cube or layer
			deltaAngle: new THREE.Vector3(),
			axis: {
				group: null,
				mouse: null,
			},
		};

		this.draggable = new Draggable( { useVector: THREE.Vector2, invertY: true } );

		this.disabled = false;
		this.world = null;
		this.cube = cube;
		this.scramble = null;

		this.onSolved = () => {};
		this.onMove = () => {};

		cube.controls = this;

		this.draggable.onStart = ( event, position ) => {

			if ( this.drag.active || this.drag.rotation != null || this.disabled || this.scramble !== null ) return;

			this.drag.rotation = null;
			this.drag.active = true;

			const intersects = this.getIntersect( position.start, this.cube.edges, true );

			if ( intersects.length > 0 ) {

				this.intersect.piece = intersects[ 0 ].object.parent;
				this.intersect.start = intersects[ 0 ].point;
				this.drag.direction = new THREE.Vector3();
				this.drag.direction[ Object.keys( this.intersect.start ).reduce( ( a, b ) =>
					Math.abs( this.intersect.start[ a ] ) > Math.abs( this.intersect.start[ b ] ) ? a : b
				) ] = 1;
				this.helper.position.set( this.intersect.start.x, this.intersect.start.y, this.intersect.start.z );
				this.helper.rotation.set( this.drag.direction.y * Math.PI / 2, this.drag.direction.x * Math.PI / 2, this.drag.direction.z * Math.PI / 2 );

				this.drag.type = 'layer';

			} else {

				this.drag.type = 'cube';

			}

		};

		this.draggable.onDrag = ( event, position ) => {

			if ( ! this.drag.active ) return;

			if ( this.drag.rotation == null && position.delta.length() > this.options.dragDelta ) {

				if ( this.drag.type == 'layer' ) {

					this.getLayer( position );

				} else if ( this.drag.type == 'cube' ) {

					let angle = roundAngle( position.delta.angle(), false ) / ( Math.PI * 2 );

					this.drag.rotation = ( angle == 0.25 || angle == 0.75 )
						? ( ( position.start.x > this.world.width * 0.5 ) ? 'z' : 'y' )
						: 'x';

					this.getAxis();

				}

			} else if ( this.drag.rotation != null ) {

				if ( this.drag.type == 'layer' ) {

					this.group.rotation[ this.drag.axis.group ] = position.delta[ this.drag.axis.mouse ] / 100 * ( ( this.drag.rotation == 'y' ) ? - 1 : 1 );
					this.drag.deltaAngle = this.group.rotation.toVector3();

					if ( Math.abs( this.drag.deltaAngle[ this.drag.axis.group ] ) > Math.PI / 4 ) this.draggable.onEnd();

				} else if ( this.drag.type == 'cube' ) {

					this.cube.holder.rotation[ this.drag.axis.group ] = position.delta[ this.drag.axis.mouse ] / 100 * ( ( this.drag.rotation == 'y' ) ? - 1 : 1 );
					this.drag.deltaAngle = this.cube.holder.rotation.toVector3();

					if ( Math.abs( this.drag.deltaAngle[ this.drag.axis.group ] ) > Math.PI / 4 ) this.draggable.onEnd();

				}

			}

		};

		this.draggable.onEnd = ( event, position ) => {

			if ( ! this.drag.active ) return;
			this.drag.active = false;

			if ( this.drag.type == 'layer' ) {

				const angle = roundVectorAngle( this.drag.deltaAngle, this.options.minimumRotationAngle );
				const layer = this.drag.layer;

				this.rotateLayer( angle, this.options.animationSpeed, true, () => {

					this.addMove( angle, layer );
					this.checkIsSolved();

				} );

			} else if ( this.drag.type == 'cube' ) {

				const angle = roundVectorAngle( this.drag.deltaAngle, this.options.minimumRotationAngle );

				this.rotateCube( angle );

			}

		};

		return this;

	}

	disable() {

		this.draggable.dispose();

		return this;

	}

	addMove( angle, layer ) {

		let move = null;

		if ( new THREE.Vector3().equals( angle ) ) return;
		if ( layer.toString() == this.cube.layers.a.toString() ) return;

		if (
			this.moves.length > 0 &&
			this.moves[ this.moves.length - 1 ][ 0 ].clone().multiplyScalar( - 1 ).equals( angle )
		) {

			this.moves.pop();

		} else {

			move = [ angle, layer ];
			this.moves.push( move );

		}

		this.onMove( { moves: this.moves, move: move, length: this.moves.length } );

	}

	undo() {

		if ( this.moves.length > 0 ) {

			const move = this.moves[ this.moves.length - 1 ];
			const angle = move[ 0 ].multiplyScalar( - 1 );
			const layer = move[ 1 ];

			this.selectLayer( layer );

			this.rotateLayer( angle, this.options.animationSpeed, true, () => {

				this.moves.pop();
				this.onMove( { moves: this.moves, move: move, length: this.moves.length } );

			} );

		}

	}

	rotateLayer( angle, speed, flip, callback ) {

		const bounce = ( flip )
			? this.options.animationBounce
			: this.options.scrambleBounce;

		if ( this.drag.layer == null ) return;

		TweenMax.to( this.group.rotation, speed, {
			x: angle.x,
			y: angle.y,
			z: angle.z,
			ease: Back.easeOut.config( bounce ),
			onUpdate: this.rotateBounce( angle, bounce ),
			onComplete: () => {

				this.cube.object.rotation.set( 0, 0, 0 );
				this.deselectLayer( this.drag.layer );
				if ( typeof callback === 'function' ) callback();

			},
		} );

	}

	rotateCube( angle ) {

		const bounce = this.options.animationBounce;
		const speed = this.options.animationSpeed;

		TweenMax.to( this.cube.holder.rotation, speed, {
			x: angle.x,
			y: angle.y,
			z: angle.z,
			ease: Back.easeOut.config( bounce ),
			// onUpdate: this.rotateBounce( angle, bounce ),
			onComplete: () => {

				this.drag.layer = null;
				this.drag.rotation = null;

				if ( typeof callback === 'function' ) callback();

			},
		} );

	}

	rotateBounce( angle, bounce ) {

		if ( bounce == 0 ) return () => {};
		if ( angle.equals( new THREE.Vector3() ) ) return () => {};
		if ( this.drag.layer.toString() == this.cube.layers.a.toString() ) return () => {};

		const axis = Object.keys( angle ).reduce( ( a, b ) =>
			Math.abs( angle[ a ] ) > Math.abs( angle[ b ] ) ? a : b
		);

		const cubeRotation = this.cube.object.rotation[ axis ] * 1;
		let bounceStarted = false;

		return () => {

			if ( ! bounceStarted ) {

				if ( this.group.rotation[ axis ] / angle[ axis ] < 1 ) {

					return;

				} else {

					bounceStarted = true;

				}

			} else {

				const bounceValue = ( angle[ axis ] - this.group.rotation[ axis ] ) * - 1;

				this.cube.object.rotation[ axis ] = cubeRotation + bounceValue;

			}

		};

	}

	getLayer( position ) {

		const pieceIndex = this.cube.pieces.indexOf( this.intersect.piece );
		const intersects = this.getIntersect( position.current, this.helper, false );

		if ( intersects.length == 0 ) return;
		const intersectHelper = intersects[ 0 ].point;

		const normalX = [ 'x', 'z' ][ this.drag.direction.x ];
		const normalY = [ 'y', 'z' ][ this.drag.direction.y ];

		const vs = new THREE.Vector2(
			this.intersect.start[ normalX ] * 1,
			this.intersect.start[ normalY ] * 1
		);

		const ve = new THREE.Vector2(
			intersectHelper[ normalX ] * 1,
			intersectHelper[ normalY ] * 1
		);

		const angle = Math.round( ve.sub( vs ).angle() / ( Math.PI / 2 ) ) * ( Math.PI / 2) / ( Math.PI * 2 );

		this.drag.rotation = ( angle == 0.25 || angle == 0.75 )
			? [ 'y', 'z' ][ this.drag.direction.x ]
			: [ 'x', 'z' ][ this.drag.direction.y ];

		const layers = this.cube.layers[ this.drag.rotation ];

		Object.keys( layers ).forEach( key => {

			if ( layers[ key ].includes( pieceIndex ) )
				this.selectLayer( layers[ key ] );

		} );

		this.getAxis();

	}

	getAxis() {

		this.drag.axis.group = { x: 'y', y: 'x', z: 'z' }[ this.drag.rotation ];
		this.drag.axis.mouse = { x: 'x', y: 'y', z: 'y' }[ this.drag.rotation ];

	}

	selectLayer( layer ) {

		this.group.rotation.set( 0, 0, 0 );
		this.group.updateMatrixWorld();

		layer.forEach( index => {

			this.cube.pieces[ index ].applyMatrix(new THREE.Matrix4().getInverse( this.group.matrixWorld ) );
			this.cube.object.remove( this.cube.pieces[ index ] );
			this.group.add( this.cube.pieces[ index ] );

		} );

		this.drag.layer = layer;

	}

	deselectLayer( layer ) {

		this.group.updateMatrixWorld();

		layer.forEach( index => {

			this.cube.pieces[ index ].applyMatrix( this.group.matrixWorld );
			this.group.remove( this.cube.pieces[ index ] );
			this.cube.object.add( this.cube.pieces[ index ] );

		} );

		this.rearrangePieces();
		if ( this.scramble === null ) this.cube.saveState();

	}

	rearrangePieces() {

		const newPositions = [];
		const newPieces = [];

		this.cube.pieces.forEach( piece => {

			piece.position.multiplyScalar( this.cube.size ).round().divideScalar( this.cube.size );
			roundVectorAngle( piece.rotation, false );
			newPositions.push( piece.position.clone().multiplyScalar( this.cube.size ).round().toArray().toString() );

		} );

		this.cube.pieces.forEach( ( piece, i ) => {

			const index = newPositions.indexOf( this.cube.positions[ i ].toArray().toString() );
			newPieces[ i ] = this.cube.pieces[ index ];

		} );

		this.cube.pieces = newPieces;

		this.drag.layer = null;
		this.drag.rotation = null;

	}

	checkIsSolved() {

		if ( this.cube.solvedStates.indexOf( this.cube.pieces.map( piece => piece.name ).toString() ) > - 1 ) {

			this.onSolved();
			this.cube.clearState();

		}

	}

	getIntersect( position, object, multiple ) {

		const convertedPosition = this.draggable.convertPosition( position.clone() );
		convertedPosition.y *= - 1;

		this.raycaster.setFromCamera( convertedPosition, this.world.camera );

		return ( multiple )
			? this.raycaster.intersectObjects( object )
			: this.raycaster.intersectObject( object );

	}

	scrambleCube( scramble, callback ) {

		if ( this.scramble == null ) {

			scramble.callback = ( typeof callback !== 'function' ) ? () => {} : callback;
			this.scramble = scramble;

		}

		const converted = this.scramble.converted;
		const move = converted[ 0 ];
		const layer = this.cube.layers[ move.layer ][ move.row ];
		const rotation = new THREE.Vector3();

		rotation[ move.axis ] = move.angle;

		this.selectLayer( layer );
		this.rotateLayer( rotation, this.options.scrambleSpeed, false, () => {

			converted.shift();

			if ( converted.length > 0 ) {

				this.scrambleCube();

			} else {

				this.scramble.callback();
				this.scramble = null;

			}

		} );

	}

}

function roundAngle( angle, minimum ) {

	const round = Math.PI / 2;

	if ( angle == 0 ) return 0;

	if ( minimum !== false ) {

		if ( Math.abs( angle ) < round * minimum ) return 0;

		if ( Math.abs( angle ) < round ) return Math.sign( angle ) * round;

	}

	return Math.round( angle / round ) * round;

}

function roundVectorAngle( angle, minimum ) {

	angle.set(
		roundAngle( angle.x, minimum ),
		roundAngle( angle.y, minimum ),
		roundAngle( angle.z, minimum )
	);

	return angle;

}

export { Controls };
