(function () {
	'use strict';

	class AnimationEngine {

	  constructor() {

	    this.ids = [];
	    this.animations = {};
	    this.update = this.update.bind( this );
	    this.animating = false;
	    this.animation = null;
	    this.time = 0;

	    return this;

	  }

	  update() {

	    let i = this.ids.length;

	    if ( i > 0 ) requestAnimationFrame( this.update );
	    else this.animating = false;

	    const now = performance.now();
	    const delta = now - this.time;
	    this.time = now;

	    while ( i-- ) this.animations[ this.ids[ i ] ].update( delta );

	  }

	  add( animation ) {

	    Object.assign( this.animations, {

	      [ animation.id ]: animation

	    } );

	    this.ids.push( animation.id );

	    if ( ! this.animating ) {

	      requestAnimationFrame( this.update );
	      this.time = performance.now();
	      this.animating = true;

	    }

	  }

	  remove( animation ) {

	    const index = this.ids.indexOf( animation.id );

	    if ( index < 0 ) return;

	    this.ids.splice( index, 1 );

	    delete this.animations[ animation.id ];

	  }

	}

	const animationEngine = new AnimationEngine();

	let uniqueID = 0;

	class Animation {

	  constructor( start ) {

	    this.id = uniqueID ++;
	    this.update = this.update.bind( this );

	    if ( start === true ) this.start();

	  }

	  start() {

	    animationEngine.add( this );

	  }

	  stop() {

	    animationEngine.remove( this );

	  }

	  update( delta ) {}

	}

	class World extends Animation {

		constructor( game ) {

			super( true );

			this.game = game;

			this.container = this.game.dom.game;
			this.scene = new THREE.Scene();

			this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
			this.renderer.setPixelRatio( window.devicePixelRatio );
			this.container.appendChild( this.renderer.domElement );

			this.camera = new THREE.PerspectiveCamera( 2, 1, 0.1, 10000 );

			this.stage = { width: 2, height: 3 };
			this.fov = 10;

			this.createLights();

			this.resize();
			window.addEventListener( 'resize', () => this.resize(), false );

		}

		update() {

			this.renderer.render( this.scene, this.camera );

		}

		resize() {

			this.width = this.container.offsetWidth;
			this.height = this.container.offsetHeight;

			this.renderer.setSize( this.width, this.height );

		  this.camera.fov = this.fov;
		  this.camera.aspect = this.width / this.height;

			const aspect = this.stage.width / this.stage.height;
		  const fovRad = this.fov * THREE.Math.DEG2RAD;

		  let distance = ( aspect < this.camera.aspect )
				? ( this.stage.height / 2 ) / Math.tan( fovRad / 2 )
				: ( this.stage.width / this.camera.aspect ) / ( 2 * Math.tan( fovRad / 2 ) );

		  distance *= 0.5;

			this.camera.position.set( distance, distance, distance);
			this.camera.lookAt( this.scene.position );
			this.camera.updateProjectionMatrix();

			const docFontSize = ( aspect < this.camera.aspect )
				? ( this.height / 100 ) * aspect
				: this.width / 100;

			document.documentElement.style.fontSize = docFontSize + 'px';

		}

		createLights() {

			this.lights = {
				holder:  new THREE.Object3D,
				ambient: new THREE.AmbientLight( 0xffffff, 0.69 ),
				front:   new THREE.DirectionalLight( 0xffffff, 0.36 ),
				back:    new THREE.DirectionalLight( 0xffffff, 0.19 ),
			};

			this.lights.front.position.set( 0.3, 1,  0.6 );
			this.lights.back.position.set( -0.3, -1,  -0.6 );

			this.lights.holder.add( this.lights.ambient );
			this.lights.holder.add( this.lights.front );
			this.lights.holder.add( this.lights.back );

			this.scene.add( this.lights.holder );

		}

	}

	function RoundedBoxGeometry( width, height, depth, radius, radiusSegments ) {

	  THREE.BufferGeometry.call( this );

	  this.type = 'RoundedBoxGeometry';

	  radiusSegments = ! isNaN( radiusSegments ) ? Math.max( 1, Math.floor( radiusSegments ) ) : 1;

	  width = ! isNaN( width ) ? width : 1;
	  height = ! isNaN( height ) ? height : 1;
	  depth = ! isNaN( depth ) ? depth : 1;

	  radius = ! isNaN( radius ) ? radius : .15;
	  radius = Math.min( radius, Math.min( width, Math.min( height, Math.min( depth ) ) ) / 2 );

	  var edgeHalfWidth = width / 2 - radius;
	  var edgeHalfHeight = height / 2 - radius;
	  var edgeHalfDepth = depth / 2 - radius;

	  this.parameters = {
	    width: width,
	    height: height,
	    depth: depth,
	    radius: radius,
	    radiusSegments: radiusSegments
	  };

	  var rs1 = radiusSegments + 1; //radius segments + 1
	  var totalVertexCount = ( rs1 * radiusSegments + 1 ) << 3;

	  var positions = new THREE.BufferAttribute( new Float32Array( totalVertexCount * 3 ), 3 );
	  var normals = new THREE.BufferAttribute( new Float32Array( totalVertexCount * 3 ), 3 );

	  var
	    cornerVerts = [],
	    cornerNormals = [],
	    normal = new THREE.Vector3(),
	    vertex = new THREE.Vector3(),
	    vertexPool = [],
	    normalPool = [],
	    indices = []
	  ;

	  var
	    lastVertex = rs1 * radiusSegments,
	    cornerVertNumber = rs1 * radiusSegments + 1
	  ;

	  doVertices();
	  doFaces();
	  doCorners();
	  doHeightEdges();
	  doWidthEdges();
	  doDepthEdges();

	  function doVertices() {

	    var cornerLayout = [
	      new THREE.Vector3( 1, 1, 1 ),
	      new THREE.Vector3( 1, 1, - 1 ),
	      new THREE.Vector3( - 1, 1, - 1 ),
	      new THREE.Vector3( - 1, 1, 1 ),
	      new THREE.Vector3( 1, - 1, 1 ),
	      new THREE.Vector3( 1, - 1, - 1 ),
	      new THREE.Vector3( - 1, - 1, - 1 ),
	      new THREE.Vector3( - 1, - 1, 1 )
	    ];

	    for ( var j = 0; j < 8; j ++ ) {

	      cornerVerts.push( [] );
	      cornerNormals.push( [] );

	    }

	    var PIhalf = Math.PI / 2;
	    var cornerOffset = new THREE.Vector3( edgeHalfWidth, edgeHalfHeight, edgeHalfDepth );

	    for ( var y = 0; y <= radiusSegments; y ++ ) {

	      var v = y / radiusSegments;
	      var va = v * PIhalf; //arrange in 90 deg
	      var cosVa = Math.cos( va ); //scale of vertical angle
	      var sinVa = Math.sin( va );

	      if ( y == radiusSegments ) {

	        vertex.set( 0, 1, 0 );
	        var vert = vertex.clone().multiplyScalar( radius ).add( cornerOffset );
	        cornerVerts[ 0 ].push( vert );
	        vertexPool.push( vert );
	        var norm = vertex.clone();
	        cornerNormals[ 0 ].push( norm );
	        normalPool.push( norm );
	        continue; //skip row loop

	      }

	      for ( var x = 0; x <= radiusSegments; x ++ ) {

	        var u = x / radiusSegments;
	        var ha = u * PIhalf;
	        vertex.x = cosVa * Math.cos( ha );
	        vertex.y = sinVa;
	        vertex.z = cosVa * Math.sin( ha );

	        var vert = vertex.clone().multiplyScalar( radius ).add( cornerOffset );
	        cornerVerts[ 0 ].push( vert );
	        vertexPool.push( vert );

	        var norm = vertex.clone().normalize();
	        cornerNormals[ 0 ].push( norm );
	        normalPool.push( norm );

	      }

	    }

	    for ( var i = 1; i < 8; i ++ ) {

	      for ( var j = 0; j < cornerVerts[ 0 ].length; j ++ ) {

	        var vert = cornerVerts[ 0 ][ j ].clone().multiply( cornerLayout[ i ] );
	        cornerVerts[ i ].push( vert );
	        vertexPool.push( vert );

	        var norm = cornerNormals[ 0 ][ j ].clone().multiply( cornerLayout[ i ] );
	        cornerNormals[ i ].push( norm );
	        normalPool.push( norm );

	      }

	    }

	  }


	  // weave corners ====================================

	  function doCorners() {

	    var flips = [
	      true,
	      false,
	      true,
	      false,
	      false,
	      true,
	      false,
	      true
	    ];

	    var lastRowOffset = rs1 * ( radiusSegments - 1 );

	    for ( var i = 0; i < 8; i ++ ) {

	      var cornerOffset = cornerVertNumber * i;

	      for ( var v = 0; v < radiusSegments - 1; v ++ ) {

	        var r1 = v * rs1; //row offset
	        var r2 = ( v + 1 ) * rs1; //next row

	        for ( var u = 0; u < radiusSegments; u ++ ) {

	          var u1 = u + 1;
	          var a = cornerOffset + r1 + u;
	          var b = cornerOffset + r1 + u1;
	          var c = cornerOffset + r2 + u;
	          var d = cornerOffset + r2 + u1;

	          if ( ! flips[ i ] ) {

	            indices.push( a );
	            indices.push( b );
	            indices.push( c );

	            indices.push( b );
	            indices.push( d );
	            indices.push( c );

	          } else {

	            indices.push( a );
	            indices.push( c );
	            indices.push( b );

	            indices.push( b );
	            indices.push( c );
	            indices.push( d );

	          }

	        }

	      }

	      for ( var u = 0; u < radiusSegments; u ++ ) {

	        var a = cornerOffset + lastRowOffset + u;
	        var b = cornerOffset + lastRowOffset + u + 1;
	        var c = cornerOffset + lastVertex;

	        if ( ! flips[ i ] ) {

	          indices.push( a );
	          indices.push( b );
	          indices.push( c );

	        } else {

	          indices.push( a );
	          indices.push( c );
	          indices.push( b );

	        }

	      }

	    }

	  }

	  function doFaces() {

	    var a = lastVertex;// + cornerVertNumber * 0;
	    var b = lastVertex + cornerVertNumber;// * 1;
	    var c = lastVertex + cornerVertNumber * 2;
	    var d = lastVertex + cornerVertNumber * 3;

	    indices.push( a );
	    indices.push( b );
	    indices.push( c );
	    indices.push( a );
	    indices.push( c );
	    indices.push( d );

	    a = lastVertex + cornerVertNumber * 4;// + cornerVertNumber * 0;
	    b = lastVertex + cornerVertNumber * 5;// * 1;
	    c = lastVertex + cornerVertNumber * 6;
	    d = lastVertex + cornerVertNumber * 7;

	    indices.push( a );
	    indices.push( c );
	    indices.push( b );
	    indices.push( a );
	    indices.push( d );
	    indices.push( c );

	    a = 0;
	    b = cornerVertNumber;
	    c = cornerVertNumber * 4;
	    d = cornerVertNumber * 5;

	    indices.push( a );
	    indices.push( c );
	    indices.push( b );
	    indices.push( b );
	    indices.push( c );
	    indices.push( d );

	    a = cornerVertNumber * 2;
	    b = cornerVertNumber * 3;
	    c = cornerVertNumber * 6;
	    d = cornerVertNumber * 7;

	    indices.push( a );
	    indices.push( c );
	    indices.push( b );
	    indices.push( b );
	    indices.push( c );
	    indices.push( d );

	    a = radiusSegments;
	    b = radiusSegments + cornerVertNumber * 3;
	    c = radiusSegments + cornerVertNumber * 4;
	    d = radiusSegments + cornerVertNumber * 7;

	    indices.push( a );
	    indices.push( b );
	    indices.push( c );
	    indices.push( b );
	    indices.push( d );
	    indices.push( c );

	    a = radiusSegments + cornerVertNumber;
	    b = radiusSegments + cornerVertNumber * 2;
	    c = radiusSegments + cornerVertNumber * 5;
	    d = radiusSegments + cornerVertNumber * 6;

	    indices.push( a );
	    indices.push( c );
	    indices.push( b );
	    indices.push( b );
	    indices.push( c );
	    indices.push( d );

	  }

	  function doHeightEdges() {

	    for ( var i = 0; i < 4; i ++ ) {

	      var cOffset = i * cornerVertNumber;
	      var cRowOffset = 4 * cornerVertNumber + cOffset;
	      var needsFlip = i & 1 === 1;

	      for ( var u = 0; u < radiusSegments; u ++ ) {

	        var u1 = u + 1;
	        var a = cOffset + u;
	        var b = cOffset + u1;
	        var c = cRowOffset + u;
	        var d = cRowOffset + u1;

	        if ( ! needsFlip ) {

	          indices.push( a );
	          indices.push( b );
	          indices.push( c );
	          indices.push( b );
	          indices.push( d );
	          indices.push( c );

	        } else {

	          indices.push( a );
	          indices.push( c );
	          indices.push( b );
	          indices.push( b );
	          indices.push( c );
	          indices.push( d );

	        }

	      }

	    }

	  }

	  function doDepthEdges() {

	    var cStarts = [ 0, 2, 4, 6 ];
	    var cEnds = [ 1, 3, 5, 7 ];

	    for ( var i = 0; i < 4; i ++ ) {

	      var cStart = cornerVertNumber * cStarts[ i ];
	      var cEnd = cornerVertNumber * cEnds[ i ];

	      var needsFlip = 1 >= i;

	      for ( var u = 0; u < radiusSegments; u ++ ) {

	        var urs1 = u * rs1;
	        var u1rs1 = ( u + 1 ) * rs1;

	        var a = cStart + urs1;
	        var b = cStart + u1rs1;
	        var c = cEnd + urs1;
	        var d = cEnd + u1rs1;

	        if ( needsFlip ) {

	          indices.push( a );
	          indices.push( c );
	          indices.push( b );
	          indices.push( b );
	          indices.push( c );
	          indices.push( d );

	        } else {

	          indices.push( a );
	          indices.push( b );
	          indices.push( c );
	          indices.push( b );
	          indices.push( d );
	          indices.push( c );

	        }

	      }

	    }

	  }

	  function doWidthEdges() {

	    var end = radiusSegments - 1;

	    var cStarts = [ 0, 1, 4, 5 ];
	    var cEnds = [ 3, 2, 7, 6 ];
	    var needsFlip = [ 0, 1, 1, 0 ];

	    for ( var i = 0; i < 4; i ++ ) {

	      var cStart = cStarts[ i ] * cornerVertNumber;
	      var cEnd = cEnds[ i ] * cornerVertNumber;

	      for ( var u = 0; u <= end; u ++ ) {

	        var a = cStart + radiusSegments + u * rs1;
	        var b = cStart + ( u != end ? radiusSegments + ( u + 1 ) * rs1 : cornerVertNumber - 1 );

	        var c = cEnd + radiusSegments + u * rs1;
	        var d = cEnd + ( u != end ? radiusSegments + ( u + 1 ) * rs1 : cornerVertNumber - 1 );

	        if ( ! needsFlip[ i ] ) {

	          indices.push( a );
	          indices.push( b );
	          indices.push( c );
	          indices.push( b );
	          indices.push( d );
	          indices.push( c );

	        } else {

	          indices.push( a );
	          indices.push( c );
	          indices.push( b );
	          indices.push( b );
	          indices.push( c );
	          indices.push( d );

	        }

	      }

	    }

	  }

	  var index = 0;

	  for ( var i = 0; i < vertexPool.length; i ++ ) {

	    positions.setXYZ(
	      index,
	      vertexPool[ i ].x,
	      vertexPool[ i ].y,
	      vertexPool[ i ].z
	    );

	    normals.setXYZ(
	      index,
	      normalPool[ i ].x,
	      normalPool[ i ].y,
	      normalPool[ i ].z
	    );

	    index ++;

	  }

	  this.setIndex( new THREE.BufferAttribute( new Uint16Array( indices ), 1 ) );
	  this.addAttribute( 'position', positions );
	  this.addAttribute( 'normal', normals );

	}

	RoundedBoxGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
	RoundedBoxGeometry.constructor = RoundedBoxGeometry;

	function CubePieces( size, positions, colors ) {

		const pieces = [];

		const edgeScale = 0.84;
		const edgeRoundness = 0.15;
		const pieceRoundness = 0.105;
		const edgeDepth = 0.014;
		const pieceSize = 1 / size;

		const pieceMesh = new THREE.Mesh(
			new RoundedBoxGeometry( pieceSize, pieceSize, pieceSize, pieceSize * pieceRoundness, 3 ),
			new THREE.MeshLambertMaterial( { color: colors.piece, side: THREE.FrontSide } )
		);

		const edgeGeometry = RoundedPlaneGeometry( - pieceSize / 2, - pieceSize / 2, pieceSize, pieceSize, pieceSize * edgeRoundness, edgeDepth );
		const edgeMaterial = new THREE.MeshLambertMaterial( { color: colors.piece, side: THREE.FrontSide } );

		positions.forEach( ( position, index ) => {

			const piece = new THREE.Object3D();
			const pieceCube = pieceMesh.clone();
			const edges = [];
			// let edgesNames = '';

			piece.position.copy( position.clone().divideScalar( size ) );
			piece.add( pieceCube );
			piece.name = index;
			piece.edgesName = '';

			position.edges.forEach( position => {

				const edge = createEdge( position );
				edge.userData.name = [ 'L', 'R', 'D', 'U', 'B', 'F' ][ position ];
				piece.add( edge );
				edges.push( edge.userData.name );

			} );

			piece.userData.edges = edges;
			piece.userData.cube = pieceCube;

			pieces.push( piece );

		} );

		return pieces;

		function createEdge( position ) {

			const distance = pieceSize / 2;
			const edge = new THREE.Mesh(
			  edgeGeometry,
			  edgeMaterial.clone()
			);

			edge.position.set(
			  distance * [ - 1, 1, 0, 0, 0, 0 ][ position ],
			  distance * [ 0, 0, - 1, 1, 0, 0 ][ position ],
			  distance * [ 0, 0, 0, 0, - 1, 1 ][ position ]
			);

			edge.rotation.set(
			  Math.PI / 2 * [ 0, 0, 1, - 1, 0, 0 ][ position ],
			  Math.PI / 2 * [ - 1, 1, 0, 0, 2, 0 ][ position ],
		  	0
			);

			edge.material.color.setHex( colors[ [ 'left', 'right', 'bottom', 'top', 'back', 'front' ][ position ] ] );
			edge.scale.set( edgeScale, edgeScale, edgeScale );

			return edge;

		}

		function RoundedPlaneGeometry( x, y, width, height, radius, depth ) {

			const shape = new THREE.Shape();

			shape.moveTo( x, y + radius );
			shape.lineTo( x, y + height - radius );
			shape.quadraticCurveTo( x, y + height, x + radius, y + height );
			shape.lineTo( x + width - radius, y + height );
			shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
			shape.lineTo( x + width, y + radius );
			shape.quadraticCurveTo( x + width, y, x + width - radius, y );
			shape.lineTo( x + radius, y );
			shape.quadraticCurveTo( x, y, x, y + radius );

			const geometry = new THREE.ExtrudeBufferGeometry( shape, { depth: depth, bevelEnabled: false, curveSegments: 3 } );

			return geometry;

		}

	}

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
				const gameTime = localStorage.getItem( 'gameTime' );

				if ( !cubeData || !gameTime ) throw new Error();

				this.pieces.forEach( piece => {

					const index = cubeData.names.indexOf( piece.name );

					const position = cubeData.positions[index];
					const rotation = cubeData.rotations[index];

					piece.position.set( position.x, position.y, position.z );
					piece.rotation.set( rotation.x, rotation.y, rotation.z );

				} );

				this.game.timer.setDeltaTime( gameTime );

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
			localStorage.setItem( 'gameTime', this.game.timer.getDeltaTime() );

		}

		clearState() {

			localStorage.removeItem( 'gameInProgress' );
			localStorage.removeItem( 'cubeData' );
			localStorage.removeItem( 'gameTime' );

		}

	}

	const Easing = {

	  // Linear 1, Quad 2, Cubic 3, Quart 4, Quint 5

	  Power: {

	    In: power => {

	      power = Math.round( power || 1 );

	      return t => Math.pow( t, power );

	    },

	    Out: power => {

	      power = Math.round( power || 1 );

	      return t => 1 - Math.abs( Math.pow( t - 1, power ) );

	    },

	    InOut: power => {

	      power = Math.round( power || 1 );

	      return t => ( t < 0.5 )
	        ? Math.pow( t * 2, power ) / 2
	        : ( 1 - Math.abs( Math.pow( ( t * 2 - 1 ) - 1, power ) ) ) / 2 + 0.5;

	    },

	  },

	  Sine: {

	    In: () => t => 1 + Math.sin( Math.PI / 2 * t - Math.PI / 2 ),

	    Out: () => t => Math.sin( Math.PI / 2 * t ),

	    InOut: () => t => ( 1 + Math.sin( Math.PI * t - Math.PI / 2 ) ) / 2,

	  },

	  Back: {

	    Out: s => {

	      s = s || 1.70158;

	      return t => { return ( t -= 1 ) * t * ( ( s + 1 ) * t + s ) + 1; };

	    },

	    In: s => {

	      s = s || 1.70158;

	      return t => { return t * t * ( ( s + 1 ) * t - s ); };

	    }

	  },

	  Elastic: {

	    Out: ( amplitude, period ) => {

	      let PI2 = Math.PI * 2;

	      let p1 = ( amplitude >= 1 ) ? amplitude : 1;
	      let p2 = ( period || 0.3 ) / ( amplitude < 1 ? amplitude : 1 );
	      let p3 = p2 / PI2 * ( Math.asin( 1 / p1 ) || 0 );

	      p2 = PI2 / p2;

	      return t => { return p1 * Math.pow( 2, -10 * t ) * Math.sin( ( t - p3 ) * p2 ) + 1 }

	    },

	  },

	};

	class Tween extends Animation {

	  constructor( options ) {

	    super( false );

	    this.duration = options.duration || 500;
	    this.easing = options.easing || ( t => t );
	    this.onUpdate = options.onUpdate || ( () => {} );
	    this.onComplete = options.onComplete || ( () => {} );

	    this.delay = options.delay || false;
	    this.yoyo = options.yoyo ? false : null;

	    // this.time = 0;
	    this.progress = 0;
	    this.value = 0;
	    this.delta = 0;

	    this.getFromTo( options );

	    if ( this.delay ) setTimeout( () => super.start(), this.delay );
	    else super.start();

	    this.onUpdate( this );

	  }

	  update( delta ) {

	    const old = this.value * 1;

	    // this.time += delta;

	    this.progress += ( this.yoyo === true )
	      ? - ( delta / this.duration )
	      : delta / this.duration;

	    // this.progress = ( this.yoyo === true )
	    //   ? 1 - ( this.time / this.duration )
	    //   : this.time / this.duration;

	    this.value = this.easing( this.progress );
	    this.delta = this.value - old;

	    if ( this.values !== null ) this.updateFromTo();

	    if ( this.yoyo !== null ) this.updateYoyo();
	    else if ( this.progress <= 1 ) this.onUpdate( this );
	    else {

	      this.progress = 1;
	      this.value = 1;
	      this.onComplete( this );
	      this.onUpdate( this );
	      super.stop();      

	    }

	  }

	  updateYoyo() {

	    if ( this.progress > 1 || this.progress < 0 ) {

	      this.value = this.progress = ( this.progress > 1 ) ? 1 : 0;
	      this.yoyo = ! this.yoyo;
	      // this.time = 0;

	    }

	    this.onUpdate( this );

	  }

	  updateFromTo() {

	    this.values.forEach( key => {

	      this.target[ key ] = this.from[ key ] + ( this.to[ key ] - this.from[ key ] ) * this.value;

	    } );

	  }

	  getFromTo( options ) {

	    if ( ! options.target || ! options.to ) {

	      this.values = null;
	      return;

	    }

	    this.target = options.target || null;
	    this.from = options.from || {};
	    this.to = options.to || null;
	    this.values = [];

	    if ( Object.keys( this.from ).length < 1 )
	      Object.keys( this.to ).forEach( key => { this.from[ key ] = this.target[ key ]; } );

	    Object.keys( this.to ).forEach( key => { this.values.push( key ); } );

	  }

	}

	window.addEventListener( 'touchmove', () => {} );
	document.addEventListener( 'touchmove',  event => { event.preventDefault(); }, { passive: false } );

	class Draggable {

	  constructor( element, options ) {

	    this.position = {
	      current: new THREE.Vector2(),
	      start: new THREE.Vector2(),
	      delta: new THREE.Vector2(),
	      old: new THREE.Vector2(),
	      drag: new THREE.Vector2(),
	      // momentum: new THREE.Vector2(),
	    };

	    this.options = Object.assign( {
	      calcDelta: false,
	      // calcMomentum: false,
	    }, options || {} );

	    // if ( this.options.calcMomentum ) this.options.calcDelta = true;

	    this.element = element;
	    this.touch = null;

	    this.drag = {

	      start: ( event ) => {

	        if ( event.type == 'mousedown' && event.which != 1 ) return;
	        if ( event.type == 'touchstart' && event.touches.length > 1 ) return;

	        this.getPositionCurrent( event );

	        if ( this.options.calcDelta ) {

	          this.position.start = this.position.current.clone();
	          this.position.delta.set( 0, 0 );
	          this.position.drag.set( 0, 0 );

	        }

	        // if ( this.options.calcMomentum ) {

	        //     this.position.momentum.set( 0, 0 );

	        // }

	        this.touch = ( event.type == 'touchstart' );

	        this.onDragStart( this.position );

	        window.addEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.drag.move, false );
	        window.addEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.drag.end, false );

	      },

	      move: ( event ) => {

	        if ( this.options.calcDelta ) {

	          this.position.old = this.position.current.clone();

	        }

	        this.getPositionCurrent( event );

	        if ( this.options.calcDelta ) {

	          this.position.delta = this.position.current.clone().sub( this.position.old );
	          this.position.drag = this.position.current.clone().sub( this.position.start );

	        }

	        // if ( this.options.calcMomentum ) {

	        //   this.addMomentumPoint( this.position.delta );

	        // }

	        this.onDragMove( this.position );

	      },

	      end: ( event ) => {

	        this.getPositionCurrent( event );

	        // if ( this.options.calcMomentum ) this.getMomentum();

	        this.onDragEnd( this.position );

	        window.removeEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.drag.move, false );
	        window.removeEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.drag.end, false );

	      },

	    };

	    this.onDragStart = () => {};
	    this.onDragMove = () => {};
	    this.onDragEnd = () => {};

	    this.enable();

	    return this;

	  }

	  enable() {

	    this.element.addEventListener( 'touchstart', this.drag.start, false );
	    this.element.addEventListener( 'mousedown', this.drag.start, false );

	    return this;

	  }

	  disable() {

	    this.element.removeEventListener( 'touchstart', this.drag.start, false );
	    this.element.removeEventListener( 'mousedown', this.drag.start, false );

	    return this;

	  }

	  getPositionCurrent( event ) {

	    const dragEvent = event.touches
	      ? ( event.touches[ 0 ] || event.changedTouches[ 0 ] )
	      : event;

	    this.position.current.set( dragEvent.pageX, dragEvent.pageY );

	  }

	  convertPosition( position ) {

	    position.x = ( position.x / this.element.offsetWidth ) * 2 - 1;
	    position.y = - ( ( position.y / this.element.offsetHeight ) * 2 - 1 );

	    return position;

	  }

	  // addMomentumPoint( delta ) {

	  //   const time = Date.now();

	  //   while ( this.momentum.length > 0 ) {

	  //     if ( time - this.momentum[0].time <= 200 ) break;
	  //     this.momentum.shift();

	  //   }

	  //   if ( delta !== false ) this.momentum.push( { delta, time } );

	  // }

	  // getMomentum() {

	  //   const points = this.momentum.length;
	  //   const momentum = new THREE.Vector2();

	  //   this.addMomentumPoint( false );

	  //   this.momentum.forEach( ( point, index ) => {

	  //     momentum.add( point.delta.multiplyScalar( index / points ) )

	  //   } );

	  //   return momentum;

	  // }

	}

	const STILL = 0;
	const PREPARING = 1;
	const ROTATING = 2;
	const ANIMATING = 3;

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

	    this._scramble = null;
	    this._state = STILL;

	    this.initDraggable();

	  }

	  enable() {

	    this._draggable.enable();

	  }

	  disable() {

	    this._draggable.disable();

	  }

	  initDraggable() {

	    this._draggable = new Draggable( this.game.dom.game );

	    this._draggable.onDragStart = position => {

	      if ( this._scramble !== null ) return;
	      if ( this._state === PREPARING || this._state === ROTATING ) return;

	      this._gettingDrag = this._state === ANIMATING;

	      const edgeIntersect = this.getIntersect( position.current, this.edges, false );

	      if ( edgeIntersect !== false ) {

	        this._dragNormal = edgeIntersect.face.normal.round();
	        this._flipType = 'layer';

	        this.attach( this.helper, this.edges );

	        this.helper.rotation.set( 0, 0, 0 );
	        this.helper.position.set( 0, 0, 0 );
	        this.helper.lookAt( this._dragNormal );
	        this.helper.translateZ( 0.5 );
	        this.helper.updateMatrixWorld();

	        this.detach( this.helper, this.edges );

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
	      this._state = ( this._state === STILL ) ? PREPARING : this._state;

	    };

	    this._draggable.onDragMove = position => {

	      if ( this._scramble !== null ) return;
	      if ( this._state === STILL || ( this._state === ANIMATING && this._gettingDrag === false ) ) return;

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

	          this._dragIntersect = this.getIntersect( position.current, this.game.cube.cubes, true );

	          this.selectLayer( this.getLayer( false ) );

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

	    this._draggable.onDragEnd = position => {

	      if ( this._scramble !== null ) return;
	      if ( this._state !== ROTATING ) {

	        this._gettingDrag = false;
	        this._state = STILL;
	        return;

	      }

	      this._state = ANIMATING;

	      const momentum = this.getMomentum()[ this._dragDirection ];
	      const flip = ( Math.abs( momentum ) > 0.05 && Math.abs( this._flipAngle ) < Math.PI / 2 );

	      const angle = flip
	        ? this.roundAngle( this._flipAngle + Math.sign( this._flipAngle ) * ( Math.PI / 4 ) )
	        : this.roundAngle( this._flipAngle );

	      const delta = angle - this._flipAngle;

	      if ( this._flipType === 'layer' ) {

	        this.rotateLayer( delta, false, layer => {

	          // this.addMove( angle, layer );
	          this.checkIsSolved();
	          
	          this._state = this._gettingDrag ? PREPARING : STILL;
	          this._gettingDrag = false;

	        } );

	      } else {

	        this.rotateCube( delta, () => {

	          this._state = this._gettingDrag ? PREPARING : STILL;
	          this._gettingDrag = false;

	        } );

	      }

	    };

	  }

	  rotateLayer( rotation, scramble, callback ) {

	    const bounce = scramble ? this._scrambleBounce : this._flipBounce;
	    const bounceCube = ( bounce > 0 ) ? this.bounceCube() : ( () => {} );

	    this.rotationTween = new Tween( {
	      duration:scramble ? this._scrambleSpeed : this._flipSpeed,
	      easing: Easing.Back.Out( bounce ),
	      onUpdate: tween => {

	        let deltaAngle = tween.delta * rotation;
	        this.group.rotateOnAxis( this._flipAxis, deltaAngle );
	        bounceCube( tween.value, deltaAngle, rotation );

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

	    this.rotationTween = new Tween( {
	      duration: this._flipSpeed,
	      easing: Easing.Back.Out( this._flipBounce ),
	      onUpdate: tween => {

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

	    if ( position === false ) {

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

	  scrambleCube() {

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

	        this._scramble = null;

	      }

	    } );

	  }

	  getIntersect( position, object, multiple ) {

	    this.raycaster.setFromCamera(
	      this._draggable.convertPosition( position.clone() ),
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

	      momentum.add( point.delta.multiplyScalar( index / points ) );

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

	class Scrambler {

		constructor( game ) {

			this.game = game;

			this.scrambleLength = 20;

			this.moves = [];
			this.conveted = [];
			this.pring = '';

		}

		scramble( scramble ) {

			let count = 0;
			this.moves = ( typeof scramble !== 'undefined' ) ? scramble.split( ' ' ) : [];

			if ( this.moves.length < 1 ) {

				const faces = 'UDLRFB';
				const modifiers = [ "", "'", "2" ];
				const total = ( typeof scramble === 'undefined' ) ? this.scrambleLength : scramble;

				// TODO: Other Cube Sizes Scramble

				while ( count < total ) {

					const move = faces[ Math.floor( Math.random() * 6 ) ] + modifiers[ Math.floor( Math.random() * 3 ) ];
					if ( count > 0 && move.charAt( 0 ) == this.moves[ count - 1 ].charAt( 0 ) ) continue;
					if ( count > 1 && move.charAt( 0 ) == this.moves[ count - 2 ].charAt( 0 ) ) continue;
					this.moves.push( move );
					count ++;

				}

			}

			this.callback = () => {};
			this.convert();
			this.print = this.moves.join( ' ' );

			return this;

		}

		convert( moves ) {

			this.converted = [];

			this.moves.forEach( move => {

				const face = move.charAt( 0 );
				const modifier = move.charAt( 1 );

				const axis = { D: 'y', U: 'y', L: 'x', R: 'x', F: 'z', B: 'z' }[ face ];
				const row = { D: -1, U: 1, L: -1, R: 1, F: 1, B: -1 }[ face ];

				const position = new THREE.Vector3();
				position[ { D: 'y', U: 'y', L: 'x', R: 'x', F: 'z', B: 'z' }[ face ] ] = row;

				const angle = ( Math.PI / 2 ) * - row * ( ( modifier == "'" ) ? - 1 : 1 );

				const convertedMove = { position, axis, angle, name: move };

				this.converted.push( convertedMove );
				if ( modifier == "2" ) this.converted.push( convertedMove );

			} );

		}

	}

	class Transition {

	  constructor( game ) {

	    this._game = game;

	    this._tweens = {};
	    this._durations = {};
	    this._data = {};

	    this._activeTransitions = 0;

	  }

	  initialize() {

	    this._data.cubeY = -0.2;
	    this._data.cameraZoom = 0.85;

	    this._game.controls.disable();

	    this._game.cube.object.position.y = this._data.cubeY;
	    this._game.controls.edges.position.y = this._data.cubeY;
	    this._game.cube.animator.position.y = 4;
	    this._game.cube.animator.rotation.x = - Math.PI / 3;
	    this._game.world.camera.zoom = this._data.cameraZoom;
	    this._game.world.camera.updateProjectionMatrix();

	  }

	  cube( show ) {

	    this._activeTransitions++;

	    if ( typeof this._tweens.cube !== 'undefined' ) this._tweens.cube.stop();

	    const currentY = this._game.cube.animator.position.y;
	    const currentRotation = this._game.cube.animator.rotation.x;

	    this._tweens.cube = new Tween( {
	      duration: show ? 3000 : 1250,
	      easing: show ? Easing.Elastic.Out( 0.8, 0.6 ) : Easing.Back.In( 1 ),
	      onUpdate: tween => {

	        this._game.cube.animator.position.y = show
	          ? ( 1 - tween.value ) * 4
	          : currentY + tween.value * 4;

	        this._game.cube.animator.rotation.x = show
	          ? ( 1 - tween.value ) * Math.PI / 3
	          : currentRotation + tween.value * - Math.PI / 3;

	      }
	    } );

	    setTimeout( () => {

	      if ( this._game.playing ) this.timer( show );
	      else this.title( show );

	    }, show ? 700 : 0 );

	    this._durations.cube = show ? 1500 : 1500;

	    setTimeout( () => this._activeTransitions--, this._durations.cube );

	  }

	  float() {

	    if ( typeof this._tweens.float !== 'undefined' ) this._tweens.float.stop();

	    this._tweens.float = new Tween( {
	      duration: 1500,
	      easing: Easing.Sine.InOut(),
	      yoyo: true,
	      onUpdate: tween => {

	        this._game.cube.holder.position.y = (- 0.02 + tween.value * 0.04); 
	        this._game.cube.holder.rotation.x = 0.005 - tween.value * 0.01;
	        this._game.cube.holder.rotation.z = - this._game.cube.holder.rotation.x;
	        this._game.cube.holder.rotation.y = this._game.cube.holder.rotation.x;

	      },
	    } );

	  }

	  zoom( game, time ) {

	    this._activeTransitions++;

	    const zoom = ( game ) ? 1 : this._data.cameraZoom;
	    const cubeY = ( game ) ? -0.3 : this._data.cubeY;
	    const duration = ( time > 0 ) ? Math.max( time, 1500 ) : 1500;
	    const rotations = ( time > 0 ) ? Math.round( duration / 1500 ) : 1;
	    const easing = Easing.Power.InOut( ( time > 0 ) ? 2 : 3 );

	    this._tweens.zoom = new Tween( {
	      target: this._game.world.camera,
	      duration: duration,
	      easing: easing,
	      to: { zoom: zoom },
	      onUpdate: () => { this._game.world.camera.updateProjectionMatrix(); },
	    } );

	    this._tweens.rotate = new Tween( {
	      target: this._game.cube.animator.rotation,
	      duration: duration,
	      easing: easing,
	      to: { y: - Math.PI * 2 * rotations },
	      onComplete: () => { this._game.cube.animator.rotation.y = 0; },
	    } );

	    this._durations.zoom = duration;

	    if ( ! this._game.playing ) {

	      this._game.saved = true;
	      this._game.playing = true;

	      this.title( false );
	      setTimeout( () => this.timer( true ), duration - 1000 );
	      setTimeout( () => this._game.controls.enable(), duration );

	    } else {

	      this.timer( false );
	      setTimeout( () => this.title( true ), duration - 1000 );

	    }

	    setTimeout( () => this._activeTransitions--, this._durations.zoom );

	  }

	  preferences( show ) {

	    this._activeTransitions++;

	    if ( typeof this._tweens.range === 'undefined' ) this._tweens.range = [];  
	    else this._tweens.range.forEach( tween => { tween.stop(); tween = null; } );

	    let tweenId = -1;
	    let listMax = 0;

	    const ranges = this._game.dom.prefs.querySelectorAll( '.range' );
	    const easing = show ? Easing.Power.Out(2) : Easing.Power.In(3);

	    ranges.forEach( ( range, rangeIndex ) => {

	      const label = range.querySelector( '.range__label' );
	      const track = range.querySelector( '.range__track-line' );
	      const handle = range.querySelector( '.range__handle' );
	      const list = range.querySelectorAll( '.range__list div' );

	      const delay = rangeIndex * ( show ? 120 : 100 );

	      label.style.opacity = show ? 0 : 1;
	      track.style.opacity = show ? 0 : 1;
	      handle.style.opacity = show ? 0 : 1;
	      handle.style.pointerEvents = show ? 'all' : 'none';

	      this._tweens.range[ tweenId++ ] = new Tween( {
	        delay: show ? delay : delay,
	        duration: 400,
	        easing: easing,
	        onUpdate: tween => {

	          const translate = show ? ( 1 - tween.value ) : tween.value;
	          const opacity = show ? tween.value : ( 1 - tween.value );

	          label.style.transform = `translate3d(0, ${translate}em, 0)`;
	          label.style.opacity = opacity;

	        }
	      } );

	      this._tweens.range[ tweenId++ ] = new Tween( {
	        delay: show ? delay + 100 : delay,
	        duration: 400,
	        easing: easing,
	        onUpdate: tween => {

	          const translate = show ? ( 1 - tween.value ) : tween.value;
	          const scale = show ? tween.value : ( 1 - tween.value );
	          const opacity = scale;

	          track.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${scale}, 1, 1)`;
	          track.style.opacity = opacity;

	        }
	      } );

	      this._tweens.range[ tweenId++ ] = new Tween( {
	        delay: show ? delay + 100 : delay,
	        duration: 400,
	        easing: easing,
	        onUpdate: tween => {

	          const translate = show ? ( 1 - tween.value ) : tween.value;
	          const opacity = 1 - translate;
	          const scale = 0.5 + opacity * 0.5;

	          handle.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${scale}, ${scale}, ${scale})`;
	          handle.style.opacity = opacity;

	        }
	      } );

	      list.forEach( ( listItem, labelIndex ) => {

	        listItem.style.opacity = show ? 0 : 1;

	        this._tweens.range[ tweenId++ ] = new Tween( {
	          delay: show ? delay + 200 + labelIndex * 50 : delay,
	          duration: 400,
	          easing: easing,
	          onUpdate: tween => {

	            const translate = show ? ( 1 - tween.value ) : tween.value;
	            const opacity = show ? tween.value : ( 1 - tween.value );

	            listItem.style.transform = `translate3d(0, ${translate}em, 0)`;
	            listItem.style.opacity = opacity;

	          }
	        } );

	      } );

	      listMax = list.length > listMax ? list.length - 1 : listMax;

	      range.style.opacity = 1;

	    } );

	    this._durations.preferences = show
	      ? ( ( ranges.length - 1 ) * 100 ) + 200 + listMax * 50 + 400
	      : ( ( ranges.length - 1 ) * 100 ) + 400;

	    setTimeout( () => this._activeTransitions--, this._durations.preferences );

	  }

	  title( show ) {

	    this._activeTransitions++;

	    const title = this._game.dom.title;

	    if ( title.querySelector( 'span i' ) === null )
	      title.querySelectorAll( 'span' ).forEach( span => this.splitLetters( span ) );

	    const letters = title.querySelectorAll( 'i' );

	    this.flipLetters( 'title', letters, show );

	    title.style.opacity = 1;

	    const note = this._game.dom.note;

	    this._tweens.title[ letters.length ] = new Tween( {
	      target: note.style,
	      easing: Easing.Sine.InOut(),
	      duration: show ? 800 : 400,
	      yoyo: show ? true : null,
	      from: { opacity: show ? 0 : ( parseFloat( getComputedStyle( note ).opacity ) ) },
	      to: { opacity: show ? 1 : 0 },
	    } );

	    setTimeout( () => this._activeTransitions--, this._durations.title );

	  }

	  timer( show ) {

	    this._activeTransitions++;

	    if ( ! show ) {

	      this._game.controls.disable();
	      this._game.timer.stop();

	    }

	    const timer = this._game.dom.timer;

	    timer.style.opacity = 0;
	    this._game.timer.convert();
	    this._game.timer.setText();

	    this.splitLetters( timer );
	    const letters = timer.querySelectorAll( 'i' );
	    this.flipLetters( 'timer', letters, show );

	    timer.style.opacity = 1;

	    if ( show && this._game.playing ) setTimeout( () => {

	      this._game.controls.enable();
	      this._game.timer.start( true );

	    }, 1000 );

	    setTimeout( () => this._activeTransitions--, this._durations.timer );

	  }

	  // Utilities

	  splitLetters( element ) {

	    const text = element.innerHTML;

	    element.innerHTML = '';

	    text.split( '' ).forEach( letter => {

	      const i = document.createElement( 'i' );

	      i.innerHTML = letter;

	      element.appendChild( i );

	    } );

	  }

	  flipLetters( type, letters, show ) {

	    if ( typeof this._tweens[ type ] === 'undefined' ) this._tweens[ type ] = [];  
	    else this._tweens[ type ].forEach( tween => { tween.stop(); tween = null; } );

	    letters.forEach( ( letter, index ) => {

	      letter.style.opacity = show ? 0 : 1;

	      this._tweens[ type ][ index ] = new Tween( {
	        easing: Easing.Sine.Out(),
	        duration: show ? 800 : 400,
	        delay: index * 50,
	        onUpdate: tween => {

	          const rotation = show ? ( 1 - tween.value ) * -80 : tween.value * 80;

	          letter.style.transform = `rotate3d(0, 1, 0, ${rotation}deg)`;
	          letter.style.opacity = show ? tween.value : ( 1 - tween.value );

	        },
	      } );

	    } );

	    this._durations[ type ] = ( letters.length - 1 ) * 50 + ( show ? 800 : 400 );

	  }

	  getActive() {

	    return this._activeTransitions;

	  }

	}

	class Timer extends Animation {

		constructor( game ) {

			super( false );

			this._game = game;

			this._startTime = 0;
			this._currentTime = 0;
			this._deltaTime = 0;
			this._converted = '0:00';

		}

		start( continueGame ) {

			this._startTime = continueGame ? ( Date.now() - this._deltaTime ) : Date.now();
			this._deltaTime = 0;
			this._converted = this.convert();

			super.start();

		}

		stop() {

			this._currentTime = Date.now();
			this._deltaTime = this._currentTime - this._startTime;
			this.convert();

			super.stop();

			return { time: this._converted, millis: this._deltaTime };

		}

		update() {

			const old = this._converted;

			this._currentTime = Date.now();
			this._deltaTime = this._currentTime - this._startTime;
			this.convert();

			if ( this._converted != old ) {

				localStorage.setItem( 'gameTime', this._deltaTime );
				this.setText();

			}

		}

		convert() {

			const seconds = parseInt( ( this._deltaTime / 1000 ) % 60 );
			const minutes = parseInt( ( this._deltaTime / ( 1000 * 60 ) ) );

			this._converted = minutes + ':' + ( seconds < 10 ? '0' : '' ) + seconds;

		}

		setText() {

			this._game.dom.timer.innerHTML = this._converted;

		}

		getDeltaTime() {

			return this._deltaTime;

		}

		setDeltaTime( time ) {

			this._deltaTime = time;

		}

	}

	class Audio {

	  constructor( game ) {

	    this.game = game;

	    const listener = new THREE.AudioListener();
	    const audioLoader = new THREE.AudioLoader();

	    this.musicOn = localStorage.getItem( 'music' );
	    this.musicOn = ( this.musicOn == null ) ? true : ( ( this.musicOn == 'true' ) ? true : false );

	    // this.music = new THREE.Audio( listener );

	    // audioLoader.load( 'assets/sounds/music.mp3', buffer => {

	    //   this.music.setBuffer( buffer );
	    //   this.music.setLoop( true );
	    //   this.music.setVolume( 0.5 );

	    //   if ( this.musicOn ) {

	    //     this.animate.audioIn( this );

	    //   }

	    // });

	    this.click = new THREE.Audio( listener );

	    audioLoader.load( 'assets/sounds/click.mp3', buffer => {

	      this.click.setBuffer( buffer );
	      this.click.setLoop( false );
	      this.click.setVolume( 0.1 );

	    });

	    // this.button.addEventListener( 'click', () => {

	    //   this.musicOn = !this.musicOn;

	    //   if ( this.musicOn && !this.button.gameStarted ) {

	    //     this.animate.audioIn( this );

	    //   } else {

	    //     this.animate.audioOut( this );

	    //   }

	    //   this.button.classList[ this.musicOn ? 'add' : 'remove' ]('is-active');

	    //   localStorage.setItem( 'music', this.musicOn );

	    // }, false );

	  }

	}

	const RangeHTML = [

	  '<div class="range">',
	    '<div class="range__label"></div>',
	    '<div class="range__track">',
	      '<div class="range__track-line"></div>',
	      '<div class="range__handle"></div>',
	    '</div>',
	    '<div class="range__list"></div>',
	  '</div>',

	].join( '\n' );

	document.querySelectorAll( 'range' ).forEach( el => {

	  const temp = document.createElement( 'div' );
	  temp.innerHTML = RangeHTML;

	  const range = temp.querySelector( '.range' );
	  const rangeLabel = range.querySelector( '.range__label' );
	  const rangeList = range.querySelector( '.range__list' );

	  range.setAttribute( 'name', el.getAttribute( 'name' ) );
	  rangeLabel.innerHTML = el.getAttribute( 'title' );

	  el.getAttribute( 'list' ).split( ',' ).forEach( listItemText => {

	    const listItem = document.createElement( 'div' );
	    listItem.innerHTML = listItemText;
	    rangeList.appendChild( listItem );

	  } );

	  el.parentNode.replaceChild( range, el );

	} );

	class Range {

	  constructor( name, options ) {

	    options = Object.assign( {
	      range: [ 0, 1 ],
	      value: 0,
	      step: 0,
	      onUpdate: () => {},
	      onComplete: () => {},
	    }, options || {} );

	    this.element = document.querySelector( '.range[name="' + name + '"]' );
	    this.track = this.element.querySelector( '.range__track' );
	    this.handle = this.element.querySelector( '.range__handle' );

	    this.value = options.value;
	    this.min = options.range[0];
	    this.max = options.range[1];
	    this.step = options.step;

	    this.onUpdate = options.onUpdate;
	    this.onComplete = options.onComplete;

	    this.value = this.round( this.limitValue( this.value ) );
	    this.setHandlePosition();

	    this.initDraggable();

	  }

	  initDraggable() {

	    let current;

	    this.draggable = new Draggable( this.handle, { calcDelta: true } );

	    this.draggable.onDragStart = position => {

	      current = this.positionFromValue( this.value );
	      this.handle.style.left = current + 'px';

	    };

	    this.draggable.onDragMove = position => {

	      current = this.limitPosition( current + position.delta.x );
	      this.value = this.round( this.valueFromPosition( current ) );
	      this.setHandlePosition();
	      
	      this.onUpdate( this.value );

	    };

	    this.draggable.onDragEnd = position => {

	      this.onComplete( this.value );

	    };

	  }

	  round( value ) {

	    if ( this.step < 1 ) return value;

	    return Math.round( ( value - this.min ) / this.step ) * this.step + this.min;

	  }

	  limitValue( value ) {

	    const max = Math.max( this.max, this.min );
	    const min = Math.min( this.max, this.min );

	    return Math.min( Math.max( value, min ), max );

	  }

	  limitPosition( position ) {

	    return Math.min( Math.max( position, 0 ), this.track.offsetWidth );

	  }

	  percentsFromValue( value ) {

	    return ( value - this.min ) / ( this.max - this.min );

	  }

	  valueFromPosition( position ) {

	    return this.min + ( this.max - this.min ) * ( position / this.track.offsetWidth );

	  }

	  positionFromValue( value ) {

	    return this.percentsFromValue( value ) * this.track.offsetWidth;

	  }

	  setHandlePosition() {

	    this.handle.style.left = this.percentsFromValue( this.value ) * 100 + '%';

	  }

	}

	class Preferences {

	  constructor( game ) {

	    this.game = game;

	    this.load();

	    this.elements = {

	      speed: new Range( 'speed', {
	        value: this.game.controls._flipSpeed,
	        range: [ 300, 100 ],
	        onComplete: value => {

	          this.game.controls._flipSpeed = value;
	          localStorage.setItem( 'flipSpeed', value );

	          this.game.controls._flipBounce = ( ( value - 100 ) / 200 ) * 2;
	          localStorage.setItem( 'flipBounce', this.game.controls._flipBounce );
	          
	        },
	      } ),

	      scramble: new Range( 'scramble', {
	        value: this.game.scrambler.scrambleLength,
	        range: [ 20, 30 ],
	        step: 5,
	        onComplete: value => {

	          this.game.scrambler.scrambleLength = value;
	          localStorage.setItem( 'scrambleLength', value );

	        },
	      } ),

	      fov: new Range( 'fov', {
	        value: this.game.world.fov,
	        range: [ 2, 45 ],
	        onUpdate: value => {

	          this.game.world.fov = value;
	          this.game.world.resize();

	        },
	        onComplete: value => {

	          localStorage.setItem( 'fov', value );

	        },
	      } ),

	      theme: new Range( 'theme', {
	        value: 0,
	        range: [ 0, 1 ],
	        step: 1,
	        onUpdate: value => {},
	      } ),

	    };

	  }

	  load() {

	    const flipSpeed = localStorage.getItem( 'flipSpeed' );
	    const flipBounce = localStorage.getItem( 'flipBounce' );
	    const scrambleLength = localStorage.getItem( 'scrambleLength' );
	    const fov = localStorage.getItem( 'fov' );
	    // const theme = localStorage.getItem( 'theme' );

	    if ( flipSpeed != null ) this.game.controls._flipSpeed = parseFloat( flipSpeed );
	    if ( flipBounce != null ) this.game.controls._flipBounce = parseFloat( flipBounce );
	    if ( scrambleLength != null ) this.game.scrambler.scrambleLength = parseInt( scrambleLength );

	    if ( fov != null ) {

	      this.game.world.fov = parseFloat( fov );
	      this.game.world.resize();

	    }

	  }

	}

	class Confetti extends Animation {

	  constructor( game ) {

	    super( false );

	    this._game = game;

	    this._count = 100;
	    this._particles = [];

	    this._object = new THREE.Object3D();
	    this._game.world.scene.add( this._object );

	    this._geometry = new THREE.PlaneGeometry( 1, 1 );
	    this._material = new THREE.MeshLambertMaterial( { transparent: true, side: THREE.DoubleSide} );
	    this._opacity = 0;

	    this._particleOptions = {
	      geometry: this._geometry,
	      material: this._material,
	      holder: this._object,
	      velocity: { min: 5, max: 15 },
	      revolution: { min: 0, max: 0.05 },
	      angle: { direction: new THREE.Vector3( 0, 1, 0 ), spread: 45 },
	      radius: { min: 10, max: 15 },
	      mass: { min: 0.05, max: 0.1 },
	      gravity: -9.81,
	      geometryScale: 0.01, // used to scale in threejs world
	      positionScale: 0.3333, // used to scale in threejs world
	      colors: [ 0x41aac8, 0x82ca38, 0xffef48, 0xef3923, 0xff8c0a ],
	    };

	    let i = this._count;
	    while ( i-- )  this._particles.push( new Particle( this._particleOptions ) );

	  }

	  start() {

	    this._opacity = 0;
	    this._done = 0;
	    this._time = performance.now();
	    super.start();

	  }

	  stop() {

	    super.stop();

	    let i = this._count;
	    while ( i-- ) this._particles[ i ].reset();

	  }

	  update() {

	    const now = performance.now();
	    const delta = now - this._time;
	    this._time = now;

	    this._opacity += ( 1 - this._opacity ) * 0.1;

	    let i = this._count;
	    while ( i-- ) {

	      if ( this._particles[ i ].update( delta, this._opacity ) ) this._done++;

	    }

	    if ( this._done == this._count) this.stop();

	  }
	  
	}

	const rnd = THREE.Math.randFloat;

	class Particle {

	  constructor( options ) {

	    this._options = options;

	    this._velocity = new THREE.Vector3();
	    this._force = new THREE.Vector3();

	    this._mesh = new THREE.Mesh( options.geometry, options.material.clone() );

	    options.holder.add( this._mesh );

	    this.reset();

	    this._ag = options.gravity; // -9.81

	    return this;

	  }

	  reset() {

	    const axis = this._velocity.clone();

	    this._velocity.copy( this._options.angle.direction ).multiplyScalar( rnd( this._options.velocity.min, this._options.velocity.max ) );
	    this._velocity.applyAxisAngle( axis.set( 1, 0, 0 ), rnd( -this._options.angle.spread / 2, this._options.angle.spread / 2 ) * THREE.Math.DEG2RAD );
	    this._velocity.applyAxisAngle( axis.set( 0, 0, 1 ), rnd( -this._options.angle.spread / 2, this._options.angle.spread / 2 ) * THREE.Math.DEG2RAD );

	    this._color = new THREE.Color( this._options.colors[ Math.floor( Math.random() * this._options.colors.length ) ] );

	    this._revolution = new THREE.Vector3(
	      rnd( this._options.revolution.min, this._options.revolution.max ),
	      rnd( this._options.revolution.min, this._options.revolution.max ),
	      rnd( this._options.revolution.min, this._options.revolution.max )
	    );

	    this._mesh.position.set( 0, 0, 0 );

	    this._positionScale = this._options.positionScale;
	    this._mass = rnd( this._options.mass.min, this._options.mass.max );
	    this._radius = rnd( this._options.radius.min, this._options.radius.max );
	    this._scale = this._radius * this._options.geometryScale;

	    this._mesh.scale.set( this._scale, this._scale, this._scale );
	    this._mesh.material.color.set( this._color );
	    this._mesh.material.opacity = 0;
	    this._mesh.rotation.set( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 );

	    this._physics = this.getPhysics( this._radius );

	    this._done = false;

	  }

	  update( delta, opacity, complete ) {

	    if ( this._done ) return false;

	    delta = 16 / 1000;

	    this._force.set(
	      this.getForce( this._velocity.x ),
	      this.getForce( this._velocity.y ) + this._ag,
	      this.getForce( this._velocity.z )
	    );

	    this._velocity.add( this._force.multiplyScalar( delta ) );

	    this._mesh.position.add( this._velocity.clone().multiplyScalar( delta * this._positionScale ) );
	    this._mesh.rotateX( this._revolution.x ).rotateY( this._revolution.y ).rotateZ( this._revolution.y );
	    this._mesh.material.opacity = opacity * this.getProgressInRange( this._mesh.position.y, -4, -2 );

	    if ( this._mesh.position.y < -4 ) { 
	      
	      this._done = true;
	      return true;

	    }

	    return false;

	  }

	  getPhysics( r ) {

	    const Cd = 0.47;
	    const rho = 1.22;
	    const A = Math.PI * r * r / 10000;

	    return -0.5 * Cd * rho * A;

	  }

	  getForce( velocity ) {

	    return this._physics * velocity * velocity * Math.sign( velocity ) / this._mass;

	  }

	  getProgressInRange( value, start, end ) {

	    return Math.min( Math.max( (value - start) / (end - start), 0 ), 1 );
	    
	  }

	}

	class IconsConverter {

		constructor( options ) {

			options = Object.assign( {
				tagName: 'icon',
				className: 'icon',
				styles: false,
	      icons: {},
				observe: false,
				convert: false,
			}, options || {} );

			this._tagName = options.tagName;
			this._className = options.className;
			this._icons = options.icons;

			this._svgTag = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
			this._svgTag.setAttribute( 'class', this._className );

			if ( options.styles ) this.addStyles();
			if ( options.convert ) this.convertAllIcons();

			if ( options.observe ) {

				const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
				this._observer = new MutationObserver( mutations => { this.convertAllIcons(); } );
				this._observer.observe( document.documentElement, { childList: true, subtree: true } );

			}

			return this;

		}

		convertAllIcons() {

			document.querySelectorAll( this._tagName ).forEach( icon => { this.convertIcon( icon ); } );

		}

		convertIcon( icon ) {

			const svgData = this._icons[ icon.attributes[0].localName ];

			if ( typeof svgData === 'undefined' ) return;

			const svg = this._svgTag.cloneNode( true );
			const viewBox = svgData.viewbox.split( ' ' );

			svg.setAttributeNS( null, 'viewBox', svgData.viewbox );
			svg.style.width = viewBox[2] / viewBox[3] + 'em';
			svg.style.height = '1em';
			svg.innerHTML = svgData.content;

			icon.parentNode.replaceChild( svg, icon );

		}

		addStyles() {

			const style = document.createElement( 'style' );
	    style.innerHTML = `.${this._className} { display: inline-block; font-size: inherit; overflow: visible; vertical-align: -0.125em; preserveAspectRatio: none; }`;
			document.head.appendChild( style );

		}

	}

	const Icons = new IconsConverter( {

	  icons: {
	    'audio': {
	      viewbox: '0 0 26712 21370',
	      content: '<g fill="currentColor"><path d="M11966 392l-4951 4950 -5680 0c-738,0 -1336,598 -1336,1336l0 8014c0,737 598,1336 1336,1336l5680 0 4951 4950c836,836 2280,249 2280,-944l0 -18696c0,-1194 -1445,-1780 -2280,-944z"/><path d="M18823 6407c-644,-352 -1457,-120 -1815,526 -356,646 -120,1458 526,1815 718,394 1165,1137 1165,1937 0,800 -446,1543 -1164,1937 -646,357 -882,1169 -526,1815 358,649 1171,879 1815,526 1571,-865 2547,-2504 2547,-4278 0,-1774 -976,-3413 -2548,-4277l0 0z"/><path d="M26712 10685c0,-3535 -1784,-6786 -4773,-8695 -623,-397 -1449,-213 -1843,415 -395,628 -210,1459 412,1857 2212,1413 3533,3814 3533,6423 0,2609 -1321,5010 -3533,6423 -623,397 -807,1228 -412,1856 362,577 1175,843 1843,415 2989,-1909 4773,-5159 4773,-8695z"/></g>',
	    },
	    'settings': {
	      viewbox: '0 0 512 512',
	      content: '<path fill="currentColor" d="M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z" class=""></path>',
	    },
	    'home': {
	      viewbox: '0 0 576 512',
	      content: '<path fill="currentColor" d="M488 312.7V456c0 13.3-10.7 24-24 24H348c-6.6 0-12-5.4-12-12V356c0-6.6-5.4-12-12-12h-72c-6.6 0-12 5.4-12 12v112c0 6.6-5.4 12-12 12H112c-13.3 0-24-10.7-24-24V312.7c0-3.6 1.6-7 4.4-9.3l188-154.8c4.4-3.6 10.8-3.6 15.3 0l188 154.8c2.7 2.3 4.3 5.7 4.3 9.3zm83.6-60.9L488 182.9V44.4c0-6.6-5.4-12-12-12h-56c-6.6 0-12 5.4-12 12V117l-89.5-73.7c-17.7-14.6-43.3-14.6-61 0L4.4 251.8c-5.1 4.2-5.8 11.8-1.6 16.9l25.5 31c4.2 5.1 11.8 5.8 16.9 1.6l235.2-193.7c4.4-3.6 10.8-3.6 15.3 0l235.2 193.7c5.1 4.2 12.7 3.5 16.9-1.6l25.5-31c4.2-5.2 3.4-12.7-1.7-16.9z" class=""></path>',
	    },
	    'trophy': {
	      viewbox: '0 0 576 512',
	      content: '<path fill="currentColor" d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 66.5 77.9 131.7 171.9 142.4C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6C498.4 275.6 576 210.3 576 144V88c0-13.3-10.7-24-24-24zM64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-47.5-16.4-77-49.9-77-70.2zm448 0c0 20.2-29.4 53.8-77 70.2 7-25 11.8-53.6 12.8-86.2H512v16zm-127.3 4.7l-39.6 38.6 9.4 54.6c1.7 9.8-8.7 17.2-17.4 12.6l-49-25.8-49 25.8c-8.8 4.6-19.1-2.9-17.4-12.6l9.4-54.6-39.6-38.6c-7.1-6.9-3.2-19 6.7-20.5l54.8-8 24.5-49.6c4.4-8.9 17.1-8.9 21.5 0l24.5 49.6 54.8 8c9.6 1.5 13.5 13.6 6.4 20.5z" class=""></path>',
	    }
	  },

	  convert: true,

	} );

	class Game {

	  constructor() {

	    this.dom = {
	      game: document.querySelector( '.ui__game' ),
	      texts: document.querySelector( '.ui__texts' ),
	      prefs: document.querySelector( '.ui__prefs' ),

	      title: document.querySelector( '.text--title' ),
	      note: document.querySelector( '.text--note' ),
	      timer: document.querySelector( '.text--timer' ),

	      buttons: {
	        settings: document.querySelector( '.btn--settings' ),
	        home: document.querySelector( '.btn--home' ),
	      }
	    };

	    this.world = new World( this );
	    this.cube = new Cube( this );
	    this.controls = new Controls( this );
	    this.scrambler = new Scrambler( this );
	    this.transition = new Transition( this );
	    this.audio = new Audio( this );
	    this.timer = new Timer( this );
	    this.preferences = new Preferences( this );
	    this.confetti = new Confetti( this );

	    this.initTapEvents();

	    this.saved = this.cube.loadState();
	    this.playing = false;

	    this.transition.initialize();
	    this.transition.cube( true );
	    this.transition.float();

	    this.controls.onMove = data => { if ( this.audio.musicOn ) this.audio.click.play(); };
	    this.controls.onSolved = () => { this.timer.stop(); this.cube.clearState(); };

	  }

	  initTapEvents() {

	    let tappedTwice = false;

	    this.dom.game.onclick = event => {

	      event.preventDefault();

	      if ( ! tappedTwice ) {

	        tappedTwice = true;
	        setTimeout( () => tappedTwice = false, 300 );
	        return false;

	      }

	      if ( this.playing || this.transition.getActive() > 0 ) return;
	      let duration = 0;

	      if ( ! this.saved ) {

	        this.scrambler.scramble();
	        this.controls.scrambleCube();

	        duration = this.scrambler.converted.length * this.controls._scrambleSpeed;

	      }

	      this.transition.zoom( true, duration );

	    };

	    this.dom.buttons.home.onclick = event => {

	      if ( !this.playing || this.transition.getActive() > 0 ) return;

	      this.transition.zoom( false, 0 );

	      this.playing = false;
	      this.controls.disable();

	    };

	    this.dom.buttons.settings.onclick = event => {

	      if ( this.transition.getActive() > 0 ) return;

	      event.target.classList.toggle( 'active' );

	      if ( event.target.classList.contains( 'active' ) ) {

	        this.transition.cube( false );
	        setTimeout( () => this.transition.preferences( true ), 1000 );

	      } else {

	        this.transition.preferences( false );
	        setTimeout( () => this.transition.cube( true ), 500 );

	      }

	    };

	  }

	}

	const game = new Game();

}());
