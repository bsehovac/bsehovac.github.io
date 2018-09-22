import { Draggable } from './Draggable.js';

class Controls {

	constructor( cube, options ) {

		this.options = Object.assign( {
			animationSpeed: 0.2,
			animationBounce: 1.75, // 1.75,
			scrambleSpeed: 0.1,
			scrambleBounce: 0,
			dragDelta: 20,
		}, options || {} );

		this.helper = new THREE.Mesh(
			new THREE.PlaneGeometry( 5, 5 ),
			new THREE.MeshBasicMaterial( {
				depthWrite: false,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.5,
				color: 0xff0000
			} )
		);
		this.helper.position.set( 0, 0, 0 );

		this.raycaster = new THREE.Raycaster();
		this.group = new THREE.Object3D();

		this.moves = [];

		this.intersect = {
			piece: null,
			start: null,
			face: null,
		};

		this.drag = {
			start: null,
			momentum: [],
			active: false, // drag is active
			layer: null, // drag selected layer
			direction: null, // drag direction - temp between start and drag
			rotation: null, // drag rotation axis
			cubeRotation: new THREE.Vector3(),
			type: null, // drag type cube or layer
			angle: null,
			axis: {
				group: null,
				mouse: null,
			},
		};

		this.disabled = false;
		this.world = null;
		this.cube = cube;
		this.scramble = null;

		this.onSolved = () => {};
		this.onMove = () => {};

		cube.controls = this;

		this.draggable = new Draggable();

		this.draggable.onDragStart = position => {

			if ( this.drag.active || this.drag.rotation != null || this.disabled || this.scramble !== null ) return;

			this.drag.rotation = false;
			this.drag.active = true;

			const intersects = this.getIntersect( position.start, this.cube.edges, true );

			if ( intersects.length > 0 ) {

				this.intersect.start = intersects[ 0 ].point;
				this.intersect.piece = intersects[ 0 ].object.parent;
				this.intersect.face = this.keyMax( this.intersect.start );

				this.drag.type = 'layer';
				this.drag.direction = new THREE.Vector3();
				this.drag.direction[ this.intersect.face ] = 1;
				this.drag.normal = new THREE.Vector2( [ 'x', 'z' ][ this.drag.direction.x ], [ 'y', 'z' ][ this.drag.direction.y ] );
				this.drag.start = this.convertIntersect( this.intersect.start );

				convertIntersect( point ) {

					return new THREE.Vector2(
						point[ this.drag.normal.x ] * 1,
						point[ this.drag.normal.y ] * 1
					);

				}

				this.helper.position.copy( this.intersect.start );
				this.helper.rotation.set( this.drag.direction.y * Math.PI / 2, this.drag.direction.x * Math.PI / 2, this.drag.direction.z * Math.PI / 2 );

			} else {

				this.drag.normal = new THREE.Vector2( 'x', 'y' );

				this.helper.position.copy( this.cube.object.position );
				this.helper.rotation.set( 0, Math.PI / 4, 0 )
				this.helper.updateMatrixWorld();

				this.intersect.start = this.getCurrentIntersectposition();
				this.drag.start = this.convertIntersect( this.intersect.start );

				this.drag.type = 'cube';

			}

		};

		this.draggable.onDragMove = position => {

			if ( ! this.drag.active ) return;

			if ( !this.drag.rotation && position.drag.length() > this.options.dragDelta ) {

				const pieceIndex = this.cube.pieces.indexOf( this.intersect.piece );

				let angle = this.convertIntersect( this.getCurrentIntersectposition() ).sub( this.drag.start ).angle();
				angle = Math.round( angle / ( Math.PI / 2 ) ); if ( angle > 3 ) angle = 0;

				this.drag.axis.mouse = [ 'x', 'y', 'x', 'y' ][ angle ];

		    this.drag.axis.group = ( this.drag.type == 'layer' )
		    	?	( this.drag.axis.mouse == 'y' )
			    	? ( ( this.drag.direction.x != 1 ) ? 'x' : 'z' )
			    	: ( ( this.drag.direction.y != 1 ) ? 'y' : 'z' )
			    : ( this.drag.axis.mouse == 'y' )
						? ( ( position.start.x < this.world.width / 2 ) ? 'x' : 'z' )
						: 'y';

				this.selectLayer( ( this.drag.type == 'layer' )
					? this.getLayer()
					: Array.apply( null, { length: 3 * 3 * 3 } ).map( Number.call, Number )
				);

				// this.drag.deltas = [];
				this.drag.deltaAngle = 0;
			  this.drag.rotation = true;

			} else if ( this.drag.rotation ) {

				const currentIntersect = this.convertIntersect( this.getCurrentIntersectposition() );
				const dragDelta = currentIntersect.clone().sub( this.drag.start );
				this.drag.start = currentIntersect;

				dragDelta.multiplyScalar( this.deltaFix() );
				this.addMomentumPoint( dragDelta );

				const axis = new THREE.Vector3(); axis[ this.drag.axis.group ] = 1;

				this.group.rotateOnWorldAxis( axis, dragDelta[ this.drag.axis.mouse ] );
				this.drag.deltaAngle += dragDelta[ this.drag.axis.mouse ];

		    // if ( Math.abs( this.drag.deltaAngle ) > Math.PI * 0.25 ) this.draggable.onDragEnd();

			}

		}; 

		this.draggable.onDragEnd = position => {

			if ( ! this.drag.active || this.drag.layer === null ) return;
			this.drag.active = false;

			const momentum = Math.abs( this.getMomentum()[ this.drag.axis.mouse ] );
			const flip = Math.sign( deltas )

			// const deltas = ( typeof this.drag.deltas === 'object' ) ?
			//  this.drag.deltas.reduce( ( a, b ) => a + b ) : 0;
			// const flip = Math.sign( deltas ) == Math.sign( this.drag.deltaAngle );

			const newAngle = this.group.rotation.toVector3();
			if ( momentum > 0.2 ) newAngle[ this.drag.axis.group ] +=
				Math.sign( this.drag.deltaAngle ) * Math.PI * 0.25;

			const angle = this.snapRotation( newAngle );
			const layer = this.drag.layer;

			this.rotateLayer( angle, this.options.animationSpeed, true, () => {

				if ( this.drag.type == 'layer' ) {
					this.addMove( angle, layer );
					this.checkIsSolved();
				}

			} );

		};

		return this;

	}

	disable() {

		this.draggable.dispose();

		return this;

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
			onComplete: () => {

				this.deselectLayer( this.drag.layer );
				if ( typeof callback === 'function' ) callback();

			},
		} );

	}

	addMove( angle, layer ) {

		let move = null;

		if ( new THREE.Vector3().equals( angle ) ) return;

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

	selectLayer( layer ) {

		this.group.rotation.set( 0, 0, 0 );
		this.movePieces( layer, this.cube.object, this.group );

		this.drag.layer = layer;

	}

	deselectLayer( layer ) {

		if ( this.drag.type == 'cube' ) {
			const axis = this.keyMax( this.group.rotation.toVector3() );
			const rotation = this.group.rotation[ axis ];
			const axisVector = new THREE.Vector3();
			axisVector[ axis ] = 1;

			this.cube.object.rotateOnWorldAxis( axisVector, rotation );
		}

		this.movePieces( layer, this.group, this.cube.object );

		this.drag.layer = null;
		this.drag.rotation = null;

		if ( this.scramble === null ) this.cube.saveState();

	}

	movePieces( layer, from, to ) {

		from.updateMatrixWorld();
		to.updateMatrixWorld();

		layer.forEach( index => {

			const piece = this.cube.pieces[ index ];

			piece.applyMatrix( from.matrixWorld );
			from.remove( piece );
			piece.applyMatrix( new THREE.Matrix4().getInverse( to.matrixWorld ) );
			to.add( piece );

		} );

	}

	deltaFix() {

		let deltaFix = 1;

		if ( this.drag.type == 'layer' ) {

			if ( this.intersect.face == 'z' && this.drag.axis.group == 'x' ) deltaFix *= -1;
			if ( this.intersect.face == 'y' && this.drag.axis.group == 'z' ) deltaFix *= -1;
			if ( this.intersect.face == 'x' && this.drag.axis.group == 'y' ) deltaFix *= -1;

		} else {

			if ( this.drag.axis.group == 'x' ) deltaFix *= -1;
			if ( this.drag.axis.group == 'y' ) deltaFix *= 2;

		}

		return deltaFix;

	}

	checkIsSolved() {

		let solved = true;

		this.cube.pieces.forEach( ( piece, index ) => {

			const position = piece.position.clone().multiplyScalar( this.cube.size ).round();
			if ( ! position.equals( this.cube.origin[ index ] ) ) solved = false;

		} );

		if ( solved ) {

				// this.onSolved();
				//this.cube.clearState();

		}

		return solved;

	}

	getIntersect( position, object, multiple ) {

		const convertedPosition = this.draggable.convertPosition( position.clone() );
		convertedPosition.y *= - 1;

		this.raycaster.setFromCamera( convertedPosition, this.world.camera );

		return ( multiple )
			? this.raycaster.intersectObjects( object )
			: this.raycaster.intersectObject( object );

	}

	getCurrentIntersectposition() {

		return this.getIntersect( position.current, this.helper, false )[ 0 ].point;

	}

	convertIntersect( point ) {

		return new THREE.Vector2(
			point[ this.drag.normal.x ] * 1,
			point[ this.drag.normal.y ] * 1
		);

	}

	getLayer() {

		const layer = [];
		let axis;

		if ( typeof position === 'undefined' ) {

			position = new THREE.Vector3()
				.setFromMatrixPosition( this.intersect.piece.matrixWorld )
				.multiplyScalar( this.cube.size ).round();

			axis = ( this.drag.axis.mouse == 'y' )
				? ( ( this.intersect.face == 'x' ) ? 'z' : 'x' )
				: ( ( this.intersect.face == 'y' ) ? 'z' : 'y' );

		} else {

			axis = this.keyMaxposition;

		}

		this.cube.pieces.forEach( piece => {

			const piecePosition = new THREE.Vector3()
				.setFromMatrixPosition( piece.matrixWorld )
				.multiplyScalar( this.cube.size ).round();

			if ( piecePosition[ axis ] == position[ axis ] ) layer.push( piece.name );

		} );

		return layer;

	}

	scrambleCube( scramble, callback ) {

		if ( this.scramble == null ) {

			scramble.callback = ( typeof callback !== 'function' ) ? () => {} : callback;
			this.scramble = scramble;

		}

		const converted = this.scramble.converted;
		const move = converted[ 0 ];
		const layer = this.getLayer( move.position );
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

	roundAngle( angle ) {

		const round = Math.PI / 2;

		return Math.sign( angle ) * Math.round( Math.abs( angle) / round ) * round;

	}

	snapRotation( angle ) {

		angle.set(
			this.roundAngle( angle.x ),
			this.roundAngle( angle.y ),
			this.roundAngle( angle.z )
		);

		return angle;

	}

	keyMax( object ) {
		return Object.keys( object )
		.reduce( ( a, b ) => Math.abs( object[ a ] ) > Math.abs( object[ b ] ) ? a : b );
	}

	addMomentumPoint( delta ) {

    const time = Date.now();

    while ( this.drag.momentum.length > 0 ) {

      if ( time - this.drag.momentum[0].time <= 200 ) break;
      this.drag.momentum.shift();

    }

    if ( delta !== false ) this.drag.momentum.push( { delta, time } );

  }

  getMomentum() {

    const points = this.drag.momentum.length;
    const momentum = new THREE.Vector2();

    this.addMomentumPoint( false );

    this.drag.momentum.forEach( ( point, index ) => {

      momentum.add( point.delta.multiplyScalar( index / points ) )

    } );

    return momentum;

  }

}

export { Controls };
