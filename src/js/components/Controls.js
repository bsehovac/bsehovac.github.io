const STILL = 0;
const PREPARING = 1;
const ROTATING = 2
const ANIMATING = 3;

import { Draggable } from './Draggable.js';

class Controls {

  constructor( game ) {

    this.game = game;

    this._flipSpeed = 300;
    this._flipBounce = 1.70158;
    this._scrambleSpeed = 150;
    this._scrambleBounce = 0;

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

    this._momentum = [];
    this._moves = [];

    this.disabled = false;
    this._scramble = null;
    this._state = STILL;

    this.initDraggable();

  }

  initDraggable() {

    this.draggable = new Draggable( this.game.dom.game );

    this.draggable.onDragStart = position => {

      if ( this.disabled || this._scramble !== null ) return;
      if ( this._state === PREPARING || this._state === ROTATING ) return;
      if ( this._state === ANIMATING && ( this._flipProgress < 0.9 || this._flipProgress > 1.1 ) ) return;

      const edgeIntersect = this.getIntersect( position.current, this.edges, false );

      if ( edgeIntersect !== false ) {

        this._dragNormal = edgeIntersect.face.normal.round();
        this._flipType = 'layer';

        this.attach( this.helper, this.game.cube.object )

        this.helper.rotation.set( 0, 0, 0 );
        this.helper.position.set( 0, 0, 0 );
        this.helper.lookAt( this._dragNormal );
        this.helper.translateZ( 0.5 );
        this.helper.updateMatrixWorld();

        this.detach( this.helper, this.game.cube.object );

        this.helper.rotation.setFromVector3( this.snapRotation( this.helper.rotation.toVector3() ) );

        this._dragIntersect = this.getIntersect( position.current, this.game.cube.cubes, true );

      } else {

        this._dragNormal = new THREE.Vector3( 0, 0, 1 );
        this._flipType = 'cube';

        this.helper.position.set( 0, 0, 0 );
        this.helper.rotation.set( 0, Math.PI / 4, 0 );
        this.helper.updateMatrixWorld();

      }

      const planeIntersect = this.getIntersect( position.current, this.helper, false ).point;
      if ( planeIntersect === false ) return;

      this._dragCurrent = this.helper.worldToLocal( planeIntersect );
      this._dragTotal = new THREE.Vector3();
      this._state = ( this._state === ANIMATING ) ? ANIMATING : PREPARING;
      this._nextState = ( this._state === ANIMATING ) ? PREPARING : STILL;

    };

    this.draggable.onDragMove = position => {

      if ( this.disabled || this._scramble !== null ) return;
      if ( this._state === STILL ) return;

      const planeIntersect = this.getIntersect( position.current, this.helper, false );
      if ( planeIntersect === false ) return;

      const point = this.helper.worldToLocal( planeIntersect.point.clone() );

      this._dragDelta = point.clone().sub( this._dragCurrent ).setZ( 0 );
      this._dragTotal.add( this._dragDelta );
      this._dragCurrent = point;
      this.addMomentumPoint( this._dragDelta );

      if ( this._state === PREPARING && this._dragTotal.length() > 0.05 ) {

        this._dragDirection = this.getMainAxis( this._dragTotal );

        if ( this._flipType === 'layer' ) {

          const direction = new THREE.Vector3();
          direction[ this._dragDirection ] = 1;

          const worldDirection = this.helper.localToWorld( direction ).sub( this.helper.position );
          const objectDirection = this.edges.worldToLocal( worldDirection ).round();

          this._flipAxis = objectDirection.cross( this._dragNormal ).negate();

          this.selectLayer( this.getLayer() );

        } else {

          const axis = ( this._dragDirection != 'x' )
            ? ( ( this._dragDirection == 'y' && position.current.x > this.game.world.width / 2 ) ? 'z' : 'x' )
            : 'y';

          this._flipAxis = new THREE.Vector3();
          this._flipAxis[ axis ] = 1 * ( ( axis == 'x' ) ? - 1 : 1 );

        }

        this._flipAngle = 0;
        this._state = ROTATING;

      } else if ( this._state === ROTATING ) {

        const rotation = this._dragDelta[ this._dragDirection ];// * 2.25;

        if ( this._flipType === 'layer' ) { 

          this.group.rotateOnAxis( this._flipAxis, rotation );
          this._flipAngle += rotation;

        } else {

          this.edges.rotateOnWorldAxis( this._flipAxis, rotation );
          this.game.cube.object.rotation.copy( this.edges.rotation );
          this._flipAngle += rotation;

        }

      }

    };

    this.draggable.onDragEnd = position => {

      if ( this._state !== ROTATING || this.disabled || this._scramble !== null ) return;

      this._state = ANIMATING;
      this._flipProgress = 0;

      const momentum = this.getMomentum()[ this._dragDirection ];
      const flip = ( Math.abs( momentum ) > 0.05 && Math.abs( this._flipAngle ) < Math.PI / 2 );

      const angle = flip
        ? this.roundAngle( this._flipAngle + Math.sign( this._flipAngle ) * ( Math.PI / 4 ) )
        : this.roundAngle( this._flipAngle );

      const delta = angle - this._flipAngle;

      if ( this._flipType === 'layer' ) {

        this.rotateLayer( delta, false, layer => {

          this.addMove( angle, layer );
          this.checkIsSolved();
          this._state = this._nextState;

        } );

      } else {

        this.rotateCube( delta, () => {

          this._state = this._nextState;

        } );

      }

    };

  }

  rotateLayer( rotation, scramble, callback ) {

    const bounce = scramble ? this._scrambleBounce : this._flipBounce;
    const bounceCube = ( bounce > 0 ) ? this.bounceCube() : ( () => {} );

    this.rotationTween = new CUBE.Tween( {
      duration:scramble ? this._scrambleSpeed : this._flipSpeed,
      easing: CUBE.Easing.Back.Out( bounce ),
      onUpdate: tween => {

        this._flipProgress = tween.progress;
        let deltaAngle = tween.delta * rotation;
        this.group.rotateOnAxis( this._flipAxis, deltaAngle );
        bounceCube( tween.progress, deltaAngle, rotation );

      },
      onComplete: () => {

        const layer = this._flipLayer.slice( 0 );

        this.game.cube.object.rotation.setFromVector3( this.snapRotation( this.game.cube.object.rotation.toVector3() ) );
        this.group.rotation.setFromVector3( this.snapRotation( this.group.rotation.toVector3() ) );
        this.deselectLayer( this._flipLayer );
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

          this.game.cube.object.rotateOnAxis( this._flipAxis, delta );

        }

    }

  }

  rotateCube( rotation, callback ) {

    this.rotationTween = new CUBE.Tween( {
      duration: this._flipSpeed,
      easing: CUBE.Easing.Back.Out( this._flipBounce ),
      onUpdate: tween => {

        this._flipProgress = tween.progress;
        this.edges.rotateOnWorldAxis( this._flipAxis, tween.delta * rotation );
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
      this._moves.length > 0 &&
      this._moves[ this._moves.length - 1 ][ 0 ] * -1 == angle
    ) {

      this._moves.pop();

    } else {

      move = [ angle, layer ];
      this._moves.push( move );

    }

    this.onMove( { moves: this._moves, move: move, length: this._moves.length } );

  }

  undoMove() {

    if ( this._moves.length > 0 ) {

      const move = this._moves[ this._moves.length - 1 ];
      const angle = move[ 0 ] * -1;
      const layer = move[ 1 ];

      this.selectLayer( layer );

      this.rotateLayer( angle, false, () => {

        this._moves.pop();
        this.onMove( { moves: this._moves, move: move, length: this._moves.length } );

      } );

    }

  }

  checkIsSolved() {

    let solved = true;
    const layers = { R: [], L: [], U: [], D: [], F: [], B: [] };

    this.game.cube.pieces.forEach( ( piece, index ) => {

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
    this._flipLayer = layer;

  }

  deselectLayer( layer ) {

    this.movePieces( layer, this.group, this.game.cube.object );
    this._flipLayer = null;

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

      axis = this.getMainAxis( this._flipAxis );
      position = this.getPiecePosition( this._dragIntersect.object );

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

    return this.game.cube.object.worldToLocal( position.sub( this.game.cube.animator.position ) ).round();

  }

  scrambleCube( callback ) {

    if ( this._scramble == null ) {

      this._scramble = this.game.scrambler;
      this._scramble.callback = ( typeof callback !== 'function' ) ? () => {} : callback;

    }

    const converted = this._scramble.converted;
    const move = converted[ 0 ];
    const layer = this.getLayer( move.position );

    this._flipAxis = new THREE.Vector3();
    this._flipAxis[ move.axis ] = 1;

    this.selectLayer( layer );
    this.rotateLayer( move.angle, true, () => {

      converted.shift();

      if ( converted.length > 0 ) {

        this.scrambleCube();

      } else {

        this._scramble.callback();
        this._scramble = null;

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

    this._momentum = this._momentum.filter( moment => time - moment.time < 500 );

    if ( delta !== false ) this._momentum.push( { delta, time } );

  }

  getMomentum() {

    const points = this._momentum.length;
    const momentum = new THREE.Vector2();

    this.addMomentumPoint( false );

    this._momentum.forEach( ( point, index ) => {

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
