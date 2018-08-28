import { roundAngle, roundVectorAngle } from './Helpers.js';
import { TouchEvents } from './TouchEvents.js';

class Controls {

	constructor( cube, options ) {

		const controls = this;

		options = Object.assign( {
			animationSpeed: 0.15,
			animationBounce: 1.75,
			scrambleSpeed: 0.1,
			scrambleBounce: 0,
			minimumRotationAngle: Math.PI / 12, // 15deg
		}, options || {} );

		const raycaster = new THREE.Raycaster();
		const rotation = new THREE.Vector3();

		const group = new THREE.Object3D();
		cube.object.add( group );

		const helper = new THREE.Mesh(
			new THREE.PlaneGeometry( 2, 2 ),
			new THREE.MeshBasicMaterial( { depthWrite: false, side: THREE.DoubleSide, transparent: true, opacity: 0 } )
		);
		helper.position.set( 0, 0, 0 );

		const moves = [];

		const intersect = {
			piece: null,
			start: null,
		};

		const drag = {
			active: false, // drag is active
			layer: null, // drag selected layer
			direction: null, // drag direction - temp between start and drag
			rotation: null, // drag rotation axis
			type: null, // drag type cube or layer
			deltaAngle: new THREE.Vector3(),
		};

		const touchEvents = new TouchEvents( {
			element: null,
			useVector: THREE.Vector2,
			invertY: true,
		} );

		controls.raycaster = raycaster;
		controls.group = group;
		controls.disabled = false;
		controls.world = null;
		controls.cube = cube;
		controls.intersect = intersect;
		controls.drag = drag;
		controls.rotation = rotation;
		controls.options = options;
		controls.touchEvents = touchEvents;
		controls.scramble = null;
		controls.moves = moves;
		controls.helper = helper;

		controls.onSolved = () => {};
		controls.onMove = () => {};

		cube.controls = controls;

		touchEvents.onStart = ( event, position ) => {

			if ( drag.active || drag.rotation != null || controls.disabled || controls.scramble !== null ) return;

			drag.rotation = null;
			drag.active = true;

			const intersects = controls.getIntersect( position.start, cube.edges, true );

			if ( intersects.length > 0 ) {

				intersect.piece = intersects[ 0 ].object.parent;
				intersect.start = intersects[ 0 ].point;
				drag.direction = new THREE.Vector3();
				drag.direction[ Object.keys( intersect.start ).reduce( ( a, b ) =>
					Math.abs( intersect.start[ a ] ) > Math.abs( intersect.start[ b ] ) ? a : b
				) ] = 1;
				helper.position.set( intersect.start.x, intersect.start.y, intersect.start.z );
				helper.rotation.set( drag.direction.y * Math.PI / 2, drag.direction.x * Math.PI / 2, drag.direction.z * Math.PI / 2 );

				drag.type = 'layer';

			} else {

				drag.type = 'cube';

			}

		};

		touchEvents.onDrag = ( event, position ) => {

			if ( ! drag.active ) return;

			if ( drag.rotation == null && position.delta.length() > 10 ) {

				if ( drag.type == 'layer' ) {

					const pieceIndex = cube.pieces.indexOf( intersect.piece );
					const intersects = controls.getIntersect( position.current, helper, false );

					if ( intersects.length == 0 ) return;
					const intersectHelper = intersects[ 0 ].point;

					const normalX = [ 'x', 'z' ][ drag.direction.x ];
					const normalY = [ 'y', 'z' ][ drag.direction.y ];

					const vs = new THREE.Vector2( intersect.start[ normalX ] * 1, intersect.start[ normalY ] * 1 );
					const ve = new THREE.Vector2( intersectHelper[ normalX ] * 1, intersectHelper[ normalY ] * 1 );

					let angle = Math.round( ve.sub( vs ).angle() / ( Math.PI / 2 ) ) * ( Math.PI / 2 ) / ( Math.PI * 2 );

					drag.rotation = ( angle == 0.25 || angle == 0.75 )
						? [ 'y', 'z' ][ drag.direction.x ]
						: [ 'x', 'z' ][ drag.direction.y ];

					const layers = cube.layers[ drag.rotation ];

					Object.keys( layers ).forEach( key => {

				    if ( layers[ key ].includes( pieceIndex ) )
				    	controls.selectLayer( layers[ key ] );

					} );

				} else if ( drag.type == 'cube' ) {

					let angle = roundAngle( position.delta.angle(), false ) / ( Math.PI * 2 );

					controls.selectLayer( cube.layers.a );

					drag.rotation = ( angle == 0.25 || angle == 0.75 )
						? ( ( position.start.x > controls.world.width * 0.5 ) ? 'z' : 'y' )
						: 'x';

				}

			} else if ( drag.rotation != null ) {

				const groupAxis = { x: 'y', y: 'x', z: 'z' }[ drag.rotation ];
				const mouseAxis = { x: 'x', y: 'y', z: 'y' }[ drag.rotation ];

				group.rotation[ groupAxis ] = position.delta[ mouseAxis ] / 100 * ( ( drag.rotation == 'y' ) ? - 1 : 1 );
				drag.deltaAngle = group.rotation.toVector3();

				if ( Math.abs( drag.deltaAngle[ groupAxis ] ) > Math.PI / 4 ) {

					touchEvents.onEnd();

				}

			}

		};

		touchEvents.onEnd = ( event, position ) => {

			if ( ! drag.active ) return;
			drag.active = false;

			const angle = roundVectorAngle( drag.deltaAngle, options.minimumRotationAngle );
			const layer = drag.layer;

			controls.rotateLayer( angle, options.animationSpeed, options.animationBounce, () => {

				controls.addMove( angle, layer );
				controls.checkIsSolved( cube );

			} );

		};

		return controls;

	}

	disable() {

		const controls = this;
		controls.touchEvents.dispose();
		return controls;

	}

	addMove( angle, layer ) {

		const controls = this;
		const moves = controls.moves;
		let move = null;

		if ( new THREE.Vector3().equals( angle ) ) return;

		if (
			moves.length > 0 &&
						moves[ moves.length - 1 ][ 0 ].clone().multiplyScalar( - 1 ).equals( angle )
		) {

			moves.pop();

		} else {

			move = [ angle, layer ];
			moves.push( move );

		}

		controls.onMove( { moves, move, length: moves.length } );

	}

	undo() {

		const controls = this;
		const moves = controls.moves;
		const options = controls.options;

		if ( moves.length > 0 ) {

			const move = moves[ moves.length - 1 ];
			const angle = move[ 0 ].multiplyScalar( - 1 );
			const layer = move[ 1 ];

			controls.selectLayer( layer );

			controls.rotateLayer( angle, options.animationSpeed, options.animationBounce, () => {

				moves.pop();
				controls.onMove( { moves, move, length: moves.length } );

			} );

		}

	}

	rotateLayer( angle, speed, bounce, callback ) {

		const controls = this;
		const cube = controls.cube;
		const layer = controls.drag.layer;
		const group = controls.group;

		if ( layer == null ) return;

		TweenMax.to( group.rotation, speed, {
			x: angle.x,
			y: angle.y,
			z: angle.z,
			ease: Back.easeOut.config( bounce ),
			onUpdate: controls.rotateBounce( angle, bounce ),
			onComplete() {

				cube.object.rotation.set( 0, 0, 0 );
				controls.deselectLayer( layer );
				if ( typeof callback === 'function' ) callback();

			},
		} );

	}

	rotateBounce( angle, bounce ) {

		const controls = this;
		const cube = controls.cube;
		const layer = controls.drag.layer;
		const group = controls.group;

		if (
			bounce == 0 ||
						angle.equals( new THREE.Vector3() ) ||
						layer.toString() == cube.layers.a.toString()
		) {

			return () => {};

		}

		const axis = Object.keys( angle ).reduce( ( a, b ) =>
			Math.abs( angle[ a ] ) > Math.abs( angle[ b ] ) ? a : b 
		);



		const cubeRotation = cube.object.rotation[ axis ] * 1;
		let bounceStarted = false;

		return () => {

			if ( ! bounceStarted ) {

				if ( group.rotation[ axis ] / angle[ axis ] < 1 ) {

					return;

				} else {

					bounceStarted = true;

				}

			}

			const bounceValue = ( angle[ axis ] - group.rotation[ axis ] ) * - 1;

			cube.object.rotation[ axis ] = cubeRotation + bounceValue;

		};

	}

	selectLayer( layer ) {

		const controls = this;
		const cube = controls.cube;
		const group = controls.group;
		const pieces = cube.pieces;

		group.rotation.set( 0, 0, 0 );
		group.updateMatrixWorld();

		layer.forEach( index => {

			pieces[ index ].applyMatrix( new THREE.Matrix4().getInverse( group.matrixWorld ) );
			cube.object.remove( pieces[ index ] );
			group.add( pieces[ index ] );

		} );

		controls.drag.layer = layer;

	}

	deselectLayer( layer ) {

		const controls = this;
		const cube = controls.cube;
		const group = controls.group;
		const pieces = cube.pieces;
		const newPositions = [];
		const newPieces = [];

		group.updateMatrixWorld();

		layer.forEach( index => {

			pieces[ index ].applyMatrix( group.matrixWorld );
			group.remove( pieces[ index ] );
			cube.object.add( pieces[ index ] );

		} );

		pieces.forEach( piece => {

			piece.position.multiplyScalar( cube.size ).round().divideScalar( cube.size );
			roundVectorAngle( piece.rotation, false );
			newPositions.push( piece.position.clone().multiplyScalar( cube.size ).round().toArray().toString() );

		} );

		pieces.forEach( ( piece, i ) => {

			const index = newPositions.indexOf( cube.positions[ i ].toArray().toString() );
			newPieces[ i ] = pieces[ index ];

		} );

		cube.pieces = newPieces;

		controls.drag.layer = null;
		controls.drag.rotation = null;

	}

	checkIsSolved() {

		const controls = this;
		const cube = controls.cube;
		let solved = true;

		cube.pieces.forEach( ( piece, i ) => {

			if ( piece != cube.origin[ i ] ) solved = false;

		} );

		if ( solved ) controls.onSolved();

	}

	getIntersect( position, object, multiple ) {

		const controls = this;
		const world = controls.world;
		const raycaster = controls.raycaster;

		const convertedPosition = controls.touchEvents.convertPosition( position.clone() );
		convertedPosition.y *= - 1;

		raycaster.setFromCamera( convertedPosition, world.camera );

		return ( multiple )
			? raycaster.intersectObjects( object )
			: raycaster.intersectObject( object );

	}

	scrambleCube( scramble, callback ) {

		const controls = this;
		const options = controls.options;
		const cube = controls.cube;

		if ( controls.scramble == null ) {

			scramble.convert();
			scramble.callback = ( typeof callback !== 'function' ) ? () => {} : callback;
			controls.scramble = scramble;

		} else {

			scramble = controls.scramble;

		}

		const converted = scramble.converted;
		const move = converted[ 0 ];
		const layer = cube.layers[ move.layer ][ move.row ];
		const rotation = new THREE.Vector3();

		rotation[ move.axis ] = move.angle;

		controls.selectLayer( layer );
		controls.rotateLayer( rotation, options.scrambleSpeed, options.scrambleBounce, () => {

			converted.shift();

			if ( converted.length > 0 ) {

				controls.scrambleCube();

			} else {

				scramble.callback();
				controls.scramble = null;

			}

		} );

	}

}

export { Controls };
