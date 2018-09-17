import { Draggable } from './Draggable.js';

class Controls {

  constructor( cube, options ) {

    this.object = new THREE.Object3D();

    this.object.plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 200, 200 ),
      new THREE.MeshBasicMaterial( { depthWrite: false, transparent: true, opacity: 0.2, color: 0x0033ff } )
    );

    this.object.cube = new THREE.Mesh(
      new THREE.BoxBufferGeometry( 1, 1, 1 ),
      new THREE.MeshBasicMaterial( { depthWrite: false, transparent: true, opacity: 0.2, color: 0x888888 } )
    );

    this.object.plane.name = 'Plane Helper';
    this.object.cube.name = 'Cube Helper';

    this.object.group = new THREE.Object3D();
    this.object.add( this.object.group );
    this.object.add( this.object.cube );

    this.cube = cube;

    this.drag = {};

    this.draggable = new Draggable();

    this.draggable.onDragStart = position => {

      const cubeIntersect = this.getIntersect( position.current, this.object.cube );

      if ( cubeIntersect !== false ) {

        this.drag.normal = cubeIntersect.face.normal;
        this.drag.type = 'layer';

        this.attach( this.object.plane, this.object.cube )

        this.object.plane.rotation.set( 0, 0, 0 );
        this.object.plane.position.set( 0, 0, 0 );
        this.object.plane.lookAt( this.drag.normal );
        this.object.plane.translateZ( 0.5 );
        this.object.plane.updateMatrixWorld();

        this.detach( this.object.plane, this.object.cube );

      } else {

        this.drag.normal = new THREE.Vector3( 0, 0, 1 );
        this.drag.type = 'cube';

        this.object.plane.position.set( 0, 0, 0 );
        this.object.plane.rotation.set( 0, Math.PI / 4, 0 );
        this.object.plane.updateMatrixWorld();

      }

      const planeIntersect = this.getIntersect( position.current, this.object.plane ).point;

      this.drag.current = this.object.plane.worldToLocal( planeIntersect );
      this.drag.total = new THREE.Vector3();
      this.drag.axis = null;
      this.drag.delta = null;

    };

    this.draggable.onDragMove = position => {

      const planeIntersect = this.getIntersect( position.current, this.object.plane );
      if ( planeIntersect === false ) return;

      const point = this.object.plane.worldToLocal( planeIntersect.point.clone() );

      this.drag.delta = point.clone().sub( this.drag.current ).setZ( 0 );
      this.drag.total.add( this.drag.delta );
      this.drag.current = point;

      if ( this.drag.axis === null && this.drag.total.length() > 0.1 ) {

        this.drag.direction = this.getLargesAxis( this.drag.total );

        if ( this.drag.type === 'layer' ) {

          const direction = new THREE.Vector3();
          direction[ this.drag.direction ] = 1;

          const worldDirection = this.object.plane.localToWorld( direction ).sub( this.object.plane.position );
          const objectDirection = this.object.worldToLocal( worldDirection ).round();

          this.drag.axis = objectDirection.cross( this.drag.normal ).negate();

        } else {

          const axis = ( this.drag.direction != 'x' )
            ? ( ( this.drag.direction == 'y' && position.current.x > this.world.width / 2 ) ? 'z' : 'x' )
            : 'y';

          this.drag.axis = new THREE.Vector3();
          this.drag.axis[ axis ] = 1 * ( ( axis == 'x' ) ? - 1 : 1 );

        }

      } else if ( this.drag.axis !== null ) {

        if ( this.drag.type == 'layer' ) { 

          this.object.rotateOnAxis( this.drag.axis, this.drag.delta[ this.drag.direction ] );

        } else {

          this.object.rotateOnWorldAxis( this.drag.axis, this.drag.delta[ this.drag.direction ] );

        }

      }

    };

    this.draggable.onDragEnd = position => {


    };

  }

  // Helpers

  getIntersect( position, object ) {

    this.world.raycaster.setFromCamera(
      this.draggable.convertPosition( position.clone() ),
      this.world.camera
    );

    const intersect = this.world.raycaster.intersectObject( object );

    return ( intersect.length > 0 ) ? intersect[ 0 ] : false;

  }

  getLargesAxis( vector ) {

    return Object.keys( vector ).reduce( ( a, b ) => Math.abs( vector[ a ] ) > Math.abs( vector[ b ] ) ? a : b );

  }

  detach( child, parent ) {

    child.applyMatrix( parent.matrixWorld );
    parent.remove( child );
    this.world.scene.add( child );

  }

  attach( child, parent ) {

    child.applyMatrix( new THREE.Matrix4().getInverse( parent.matrixWorld ) );
    this.world.scene.remove( child );
    parent.add( child );

  }

}

export { Controls };