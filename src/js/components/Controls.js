import { Draggable } from './Draggable.js';

class Controls {

  constructor( game ) {

    this.game = game;

    this.options = {
      flipSpeed: 300,
      flipBounce: 1.70158,
      scrambleSpeed: 150,
      scrambleBounce: 0,
    };

    this.raycaster = new THREE.Raycaster();

    this.group = new THREE.Object3D();
    this.game.cube.object.add( this.group );

    this.helper = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 20, 20 ),
      new THREE.MeshBasicMaterial( { depthWrite: false, transparent: true, opacity: 0, color: 0x0033ff } )
    );

    this.helper.rotation.set( 0, Math.PI / 4, 0 );
    this.game.world.scene.add( this.helper );

    this.edges = new THREE.Mesh(
      new THREE.BoxBufferGeometry( 0.95, 0.95, 0.95 ),
      new THREE.MeshBasicMaterial( { depthWrite: false, transparent: true, opacity: 0, color: 0xff0033 } )
    );

    this.game.world.scene.add( this.edges );

    this.onSolved = () => {};
    this.onMove = () => {};

    this.drag = {};
    this.momentum = [];
    this.moves = [];

    this.disabled = false;
    this.scramble = null;
    this.state = 'still';

    this.initDraggable();

  }

  initDraggable() {

    this.draggable = new Draggable( this.game.dom.container );

    this.draggable.onDragStart = position => {

      if ( this.state !== 'still' || this.disabled || this.scramble !== null ) return;

      const edgeIntersect = this.getIntersect( position.current, this.edges, false );

      if ( edgeIntersect !== false ) {

        this.drag.normal = edgeIntersect.face.normal.round();
        this.drag.type = 'layer';

        this.attach( this.helper, this.game.cube.object )

        this.helper.rotation.set( 0, 0, 0 );
        this.helper.position.set( 0, 0, 0 );
        this.helper.lookAt( this.drag.normal );
        this.helper.translateZ( 0.5 );
        this.helper.updateMatrixWorld();

        this.detach( this.helper, this.game.cube.object );

        this.drag.intersect = this.getIntersect( position.current, this.game.cube.cubes, true );

      } else {

        this.drag.normal = new THREE.Vector3( 0, 0, 1 );
        this.drag.type = 'cube';

        this.helper.position.set( 0, 0, 0 );
        this.helper.rotation.set( 0, Math.PI / 4, 0 );
        this.helper.updateMatrixWorld();

      }

      const planeIntersect = this.getIntersect( position.current, this.helper, false ).point;
      if ( planeIntersect === false ) return;

      this.drag.current = this.helper.worldToLocal( planeIntersect );
      this.drag.total = new THREE.Vector3();
      this.drag.axis = null;
      this.drag.delta = null;
      this.drag.angle = 0;
      this.state = 'preparing';

    };

    this.draggable.onDragMove = position => {

      if ( ( this.state !== 'preparing' && this.state !== 'rotating' ) || this.disabled || this.scramble !== null ) return;

      const planeIntersect = this.getIntersect( position.current, this.helper, false );
      if ( planeIntersect === false ) return;

      const point = this.helper.worldToLocal( planeIntersect.point.clone() );

      this.drag.delta = point.clone().sub( this.drag.current ).setZ( 0 );
      this.drag.total.add( this.drag.delta );
      this.drag.current = point;
      this.addMomentumPoint( this.drag.delta );

      if ( this.drag.axis === null && this.drag.total.length() > 0.05 ) {

        this.drag.direction = this.getMainAxis( this.drag.total );

        if ( this.drag.type === 'layer' ) {

          const direction = new THREE.Vector3();
          direction[ this.drag.direction ] = 1;

          const worldDirection = this.helper.localToWorld( direction ).sub( this.helper.position );
          const objectDirection = this.edges.worldToLocal( worldDirection ).round();

          this.drag.axis = objectDirection.cross( this.drag.normal ).negate();

          this.selectLayer( this.getLayer() );

        } else {

          const axis = ( this.drag.direction != 'x' )
            ? ( ( this.drag.direction == 'y' && position.current.x > this.game.world.width / 2 ) ? 'z' : 'x' )
            : 'y';

          this.drag.axis = new THREE.Vector3();
          this.drag.axis[ axis ] = 1 * ( ( axis == 'x' ) ? - 1 : 1 );

        }

        this.state = 'rotating';

      } else if ( this.drag.axis !== null ) {

        const rotation = this.drag.delta[ this.drag.direction ];// * 2.25;

        if ( this.drag.type === 'layer' ) { 

          this.group.rotateOnAxis( this.drag.axis, rotation );
          this.drag.angle += rotation;

        } else {

          this.edges.rotateOnWorldAxis( this.drag.axis, rotation );
          this.game.cube.object.rotation.copy( this.edges.rotation );
          this.drag.angle += rotation;

        }

      }

    };

    this.draggable.onDragEnd = position => {

      if ( this.state !== 'rotating' || this.disabled || this.scramble !== null ) return;

      this.state = 'finishing';

      const momentum = this.getMomentum()[ this.drag.direction ];
      const flip = ( Math.abs( momentum ) > 0.05 && Math.abs( this.drag.angle ) < Math.PI / 2 );

      const angle = flip
        ? this.roundAngle( this.drag.angle + Math.sign( this.drag.angle ) * ( Math.PI / 4 ) )
        : this.roundAngle( this.drag.angle );

      const delta = angle - this.drag.angle;

      if ( this.drag.type === 'layer' ) {

        this.rotateLayer( delta, false, layer => {

          this.addMove( angle, layer );
          this.checkIsSolved();
          this.state = 'still';

        } );

      } else {

        this.rotateCube( delta, () => {

          this.drag.active = false;
          this.state = 'still';

        } );

      }

    };

  }

  rotateLayer( rotation, scramble, callback ) {

    const bounce = scramble ? this.options.flipBounce : this.options.scrambleBounce;
    const easing = p => { return ( p -= 1 ) * p * ( ( bounce + 1 ) * p + bounce ) + 1; }
    const bounceCube = ( bounce > 0 ) ? this.bounceCube() : ( () => {} );

    this.rotationTween = new RUBIK.Tween( {
      duration: this.options[ scramble ? 'scrambleSpeed' : 'flipSpeed' ],
      easing: easing,
      onUpdate: tween => {

        let deltaAngle = tween.delta * rotation;
        this.group.rotateOnAxis( this.drag.axis, deltaAngle );
        bounceCube( tween.progress, deltaAngle, rotation );

      },
      onComplete: () => {

        const layer = this.drag.layer.slice( 0 );

        this.game.cube.object.rotation.setFromVector3( this.snapRotation( this.game.cube.object.rotation.toVector3() ) );
        this.group.rotation.setFromVector3( this.snapRotation( this.group.rotation.toVector3() ) );
        this.deselectLayer( this.drag.layer );
        this.game.cube.saveState();

        callback( layer );

      },
    } );

  }

  bounceCube() {

    let fixDelta = true;

    return ( progress, delta, rotation ) => {

        if ( progress >= 1 ) {

          if ( fixDelta ) {

            delta = ( progress - 1 ) * rotation;
            fixDelta = false;

          }

          this.game.cube.object.rotateOnAxis( this.drag.axis, delta );

        }

    }

  }

  rotateCube( rotation, callback ) {

    const easing = p => {
      var s = this.options.flipBounce;
      return (p-=1)*p*((s+1)*p + s) + 1;
    };

    this.rotationTween = new RUBIK.Tween( {
      duration: this.options.flipSpeed,
      easing: easing,
      onUpdate: tween => {

        this.edges.rotateOnWorldAxis( this.drag.axis, tween.delta * rotation );
        this.game.cube.object.rotation.copy( this.edges.rotation );

      },
      onComplete: () => {

        this.edges.rotation.setFromVector3( this.snapRotation( this.edges.rotation.toVector3() ) );
        this.game.cube.object.rotation.copy( this.edges.rotation );
        callback();

      },
    } );

  }

  addMove( angle, layer ) {

    let move = null;

    if ( angle == 0 ) return;

    if (
      this.moves.length > 0 &&
      this.moves[ this.moves.length - 1 ][ 0 ] * -1 == angle
    ) {

      this.moves.pop();

    } else {

      move = [ angle, layer ];
      this.moves.push( move );

    }

    this.onMove( { moves: this.moves, move: move, length: this.moves.length } );

  }

  undoMove() {

    if ( this.moves.length > 0 ) {

      const move = this.moves[ this.moves.length - 1 ];
      const angle = move[ 0 ] * -1;
      const layer = move[ 1 ];

      this.selectLayer( layer );

      this.rotateLayer( angle, false, () => {

        this.moves.pop();
        this.onMove( { moves: this.moves, move: move, length: this.moves.length } );

      } );

    }

  }

  checkIsSolved() {

    let solved = true;
    const layers = { R: [], L: [], U: [], D: [], F: [], B: [] };

    game.cube.pieces.forEach( ( piece, index ) => {

      const position = this.getPiecePosition( piece );

      if ( position.x == -1 ) layers.L.push( piece );
      else if ( position.x == 1 ) layers.R.push( piece );

      if ( position.y == -1 ) layers.D.push( piece );
      else if ( position.y == 1 ) layers.U.push( piece );

      if ( position.z == -1 ) layers.B.push( piece );
      else if ( position.z == 1 ) layers.F.push( piece );

    } );

    Object.keys( layers ).forEach( key => {

      const edges = layers[ key ].map( piece => piece.userData.edges );

      if ( edges.shift().filter( v => {

        return edges.every( a => { return a.indexOf( v ) !== -1 } )

      } ).length < 1 ) solved = false;

    } );

    if ( solved ) {

        this.onSolved();
        //this.game.cube.clearState();

    }

  }

  selectLayer( layer ) {

    this.group.rotation.set( 0, 0, 0 );
    this.movePieces( layer, this.game.cube.object, this.group );
    this.drag.layer = layer;

  }

  deselectLayer( layer ) {

    this.movePieces( layer, this.group, this.game.cube.object );
    this.drag.layer = null;

  }

  movePieces( layer, from, to ) {

    from.updateMatrixWorld();
    to.updateMatrixWorld();

    layer.forEach( index => {

      const piece = this.game.cube.pieces[ index ];

      piece.applyMatrix( from.matrixWorld );
      from.remove( piece );
      piece.applyMatrix( new THREE.Matrix4().getInverse( to.matrixWorld ) );
      to.add( piece );

    } );

  }

  getLayer( position ) {

    const layer = [];
    let axis;

    if ( typeof position === 'undefined' ) {

      axis = this.getMainAxis( this.drag.axis );
      position = this.getPiecePosition( this.drag.intersect.object );

    } else {

      axis = this.getMainAxis( position );

    }

    this.game.cube.pieces.forEach( piece => {

      const piecePosition = this.getPiecePosition( piece );

      if ( piecePosition[ axis ] == position[ axis ] ) layer.push( piece.name );

    } );

    return layer;

  }

  getPiecePosition( piece ) {

    let position = new THREE.Vector3()
      .setFromMatrixPosition( piece.matrixWorld )
      .multiplyScalar( this.game.cube.size );

    return this.game.cube.object.worldToLocal( position ).round();

  }

  scrambleCube( scramble, callback ) {

    if ( this.scramble == null ) {

      this.scramble = scramble;
      this.scramble.callback = ( typeof callback !== 'function' ) ? () => {} : callback;

    }

    const converted = this.scramble.converted;
    const move = converted[ 0 ];
    const layer = this.getLayer( move.position );

    this.drag.axis = new THREE.Vector3();
    this.drag.axis[ move.axis ] = 1;

    this.selectLayer( layer );
    this.rotateLayer( move.angle, true, () => {

      converted.shift();

      if ( converted.length > 0 ) {

        this.scrambleCube();

      } else {

        this.scramble.callback();
        this.scramble = null;

      }

    } );

  }

  getIntersect( position, object, multiple ) {

    this.raycaster.setFromCamera(
      this.draggable.convertPosition( position.clone() ),
      this.game.world.camera
    );

    const intersect = ( multiple )
      ? this.raycaster.intersectObjects( object )
      : this.raycaster.intersectObject( object );

    return ( intersect.length > 0 ) ? intersect[ 0 ] : false;

  }

  getMainAxis( vector ) {

    return Object.keys( vector ).reduce(
      ( a, b ) => Math.abs( vector[ a ] ) > Math.abs( vector[ b ] ) ? a : b
    );

  }

  detach( child, parent ) {

    child.applyMatrix( parent.matrixWorld );
    parent.remove( child );
    this.game.world.scene.add( child );

  }

  attach( child, parent ) {

    child.applyMatrix( new THREE.Matrix4().getInverse( parent.matrixWorld ) );
    this.game.world.scene.remove( child );
    parent.add( child );

  }

  addMomentumPoint( delta ) {

    const time = Date.now();

    this.momentum = this.momentum.filter( moment => time - moment.time < 500 );

    if ( delta !== false ) this.momentum.push( { delta, time } );

  }

  getMomentum() {

    const points = this.momentum.length;
    const momentum = new THREE.Vector2();

    this.addMomentumPoint( false );

    this.momentum.forEach( ( point, index ) => {

      momentum.add( point.delta.multiplyScalar( index / points ) )

    } );

    return momentum;

  }

  roundAngle( angle ) {

    const round = Math.PI / 2;
    return Math.sign( angle ) * Math.round( Math.abs( angle) / round ) * round;

  }

  snapRotation( angle ) {

    return angle.set(
      this.roundAngle( angle.x ),
      this.roundAngle( angle.y ),
      this.roundAngle( angle.z )
    );

  }

}

export { Controls };
