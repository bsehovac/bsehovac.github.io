import { Draggable } from './Draggable.js';

const STILL = 0;
const PREPARING = 1;
const ROTATING = 2;
const ANIMATING = 3;

const LAYER = 0;
const CUBE = 1;

class Controls {

  constructor( game ) {

    this.game = game;

    this.options = {
      flipSpeed: 0.15, // 0 slower, 1 faster
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
    this.state = STILL;

    this.initSpring();
    this.initDraggable();

  }

  initSpring() {

    this.spring = this.game.springSystem
      .createSpring( 70, 8 )
      .setSpringSpeedFix( this.options.flipSpeed )
      .setAtRest();

    this.spring.addListener( {

      onSpringUpdate: spring => {

        if ( ! ( this.state == ROTATING || this.state == ANIMATING ) ) return;

        const current = spring.getCurrentValue();
        const rotation = current * Math.PI / 2;
        const rotationDelta = rotation - this.spring.data.oldValue;
        this.spring.data.oldValue = rotation;

        if ( this.spring.data.type === LAYER ) { 

          this.group.rotateOnAxis( this.drag.axis, rotationDelta );

          if ( this.state == ANIMATING ) this.cubeBounce( rotationDelta );

        } else {

          this.edges.rotateOnWorldAxis( this.drag.axis, rotationDelta );
          this.game.cube.object.rotation.copy( this.edges.rotation );

        }

      },

      onSpringAtRest: spring => {

        if ( this.state == ANIMATING ) {

          this.roundCubeRotation();

          if ( this.spring.data.type === LAYER ) {

            const layer = this.drag.layer.slice( 0 );

            this.deselectLayer( this.drag.layer );
            this.game.cube.saveState();

            // flipping callback dont use in scramble
            // this.addMove( angle, layer );
            // this.checkIsSolved();

          }

          this.state = this.drag.canGetDelta ? PREPARING : STILL;
          this.spring.setSpringSpeedFix( this.options.flipSpeed );

          console.log( 'animation complete duration', performance.now() - window.startTime );

        }

      }

    } );

  }

  cubeBounce( rotationDelta ) {

    const currentAbsolute = Math.abs( this.spring.getCurrentValue() );

    if ( currentAbsolute >= 1 && this.spring.data.fixDelta ) {

      rotationDelta = ( currentAbsolute - 1 ) * this.spring.getEndValue() * Math.PI / 2;
      this.spring.data.fixDelta = false;

    }

    if ( ! this.spring.data.fixDelta ) this.game.cube.object.rotateOnAxis( this.drag.axis, rotationDelta );

  }

  initDraggable() {

    this.draggable = new Draggable( this.game.dom.game );

    this.draggable.onDragStart = position => {

      this.drag.canGetDelta = false;

      if ( this.disabled || this.scramble !== null ) return;

      if ( this.state === ANIMATING ) {

        const current = this.spring.getCurrentValue();
        const currentAbsolute = Math.abs( current );

        if ( currentAbsolute > 0.95 && currentAbsolute < 1.05 ) {

          this.spring.setSpringSpeedFix( this.options.flipSpeed * 5 );
          this.drag.canGetDelta = true;

        }

      }

      if ( !( this.state === STILL || this.state === ANIMATING ) ) return;
      if ( this.state === ANIMATING && ! this.drag.canGetDelta ) return;

      const edgeIntersect = this.getIntersect( position.current, this.edges, false );

      if ( edgeIntersect !== false ) {

        this.drag.normal = edgeIntersect.face.normal.round();
        this.drag.type = LAYER;

        this.attach( this.helper, this.game.cube.object )

        this.helper.rotation.set( 0, 0, 0 );
        this.helper.position.set( 0, 0, 0 );
        this.helper.lookAt( this.drag.normal );
        this.helper.translateZ( 0.5 );
        this.helper.updateMatrixWorld();

        this.detach( this.helper, this.game.cube.object );

        this.helper.rotation.setFromVector3( this.roundRotation( this.helper.rotation.toVector3() ) );
        this.drag.intersect = this.getIntersect( position.current, this.game.cube.cubes, true );

      } else {

        this.drag.normal = new THREE.Vector3( 0, 0, 1 );
        this.drag.type = CUBE;

        this.helper.position.set( 0, 0, 0 );
        this.helper.rotation.set( 0, Math.PI / 4, 0 );
        this.helper.updateMatrixWorld();

      }

      const planeIntersect = this.getIntersect( position.current, this.helper, false ).point;
      if ( planeIntersect === false ) return;

      this.drag.current = this.helper.worldToLocal( planeIntersect );
      this.drag.total = new THREE.Vector3();
      this.drag.delta = null;
      this.state = ( this.state !== ANIMATING ) ? PREPARING : ANIMATING;

      console.log( 'ready to get delta', performance.now() - window.startTime );

    };

    this.draggable.onDragMove = position => {

      if ( this.disabled || this.scramble !== null ) return;

      if ( this.state === STILL ) return;
      if ( this.state === ANIMATING && ! this.drag.canGetDelta ) return;

      const planeIntersect = this.getIntersect( position.current, this.helper, false );
      if ( planeIntersect === false ) return;

      const point = this.helper.worldToLocal( planeIntersect.point.clone() );

      this.drag.delta = point.clone().sub( this.drag.current ).setZ( 0 );
      this.drag.total.add( this.drag.delta );
      this.drag.current = point;
      this.addMomentumPoint( this.drag.delta );

      if ( this.state === PREPARING && this.drag.total.length() > 0.05 ) {

        this.drag.direction = this.getMainAxis( this.drag.total );

        if ( this.drag.type === LAYER ) {

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

        this.spring.data.type = this.drag.type;
        this.spring.data.oldValue = 0;
        this.spring.data.fixDelta = true;
        this.spring.setCurrentValue( 0 ).setAtRest();

        this.state = ROTATING;

      } else if ( this.state === ROTATING ) {

        this.spring
          .setCurrentValue( this.spring.getCurrentValue() + this.drag.delta[ this.drag.direction ] )
          .setAtRest();

        if ( Math.abs( this.spring.getCurrentValue() ) > 0.8 ) this.draggable.onDragEnd();

      }

    };

    this.draggable.onDragEnd = position => {

      if ( this.disabled || this.scramble !== null ) return;

      if ( this.state !== ROTATING ) return;

      this.state = ANIMATING;

      let current = this.spring.getCurrentValue();
      let momentum = this.getMomentum()[ this.drag.direction ];

      let endValue = 0;
      let velocity = 0;

      if ( Math.abs( current ) > 0.8 ) {

        current = 0.8 * Math.sign( current );
        this.spring.setCurrentValue( current ).setAtRest();
        endValue = Math.sign( current );
        velocity = momentum * 10;

      } else {

        const returnBack = ( -current > 0 && momentum > 0 ) || ( -current < 0 && momentum < 0 ); 
        const passedMomentumTolerance = ( Math.abs( momentum ) > 0.05 );
        const passedDistanceTolerance = ( Math.abs( current ) > 0.3 );

        if ( ( passedDistanceTolerance || passedMomentumTolerance ) && ! returnBack ) {

          if ( current == 0 ) endValue = ( momentum > 0 ) ? current + 1 : current - 1;
          else endValue = ( momentum > 0 ) ? Math.ceil( current ) : Math.floor( current );

          velocity = momentum * 10;

        }

      }

      velocity = Math.min( Math.abs( velocity ), 4 ) * Math.sign( velocity );

      this.spring.setEndValue( endValue ).setVelocity( velocity );

      window.startTime = performance.now();

    };

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

    return this.game.cube.object.worldToLocal( position.sub( this.game.cube.animator.position ) ).round();

  }

  scrambleCube( callback ) {

    if ( this.scramble == null ) {

      this.scramble = this.game.scrambler;
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

  roundRotation( angle ) {

    return angle.set(
      this.roundAngle( angle.x ),
      this.roundAngle( angle.y ),
      this.roundAngle( angle.z )
    );

  }

  roundCubeRotation() {

    this.edges.rotation.setFromVector3( this.roundRotation( this.edges.rotation.toVector3() ) );
    this.game.cube.object.rotation.copy( this.edges.rotation );

  }

  progressInRange( value, start, end ) {

    return ( value - start ) / ( end - start );

  }

}

export { Controls };
