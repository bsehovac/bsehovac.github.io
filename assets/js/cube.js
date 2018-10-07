(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.CUBE = {})));
}(this, (function (exports) { 'use strict';

	class World {

		constructor( game ) {

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

			requestAnimationFrame( () => this.render() );

		}

		render() {

			this.renderer.render( this.scene, this.camera );

			requestAnimationFrame( () => this.render() );

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
				ambient: new THREE.AmbientLight( 0xffffff, 1.25 ),
				front:   new THREE.DirectionalLight( 0xffffff, 0.65 ),
				back:    new THREE.DirectionalLight( 0xffffff, 0.35 ),
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
			new THREE.MeshStandardMaterial( {
				color: colors.piece,
				side: THREE.FrontSide,
				roughness: 1,
				metalness: 0.5,
			} )
		);

		const edgeGeometry = RoundedPlaneGeometry( - pieceSize / 2, - pieceSize / 2, pieceSize, pieceSize, pieceSize * edgeRoundness, edgeDepth );
		const edgeMaterial = new THREE.MeshStandardMaterial( {
			color: colors.piece,
			side: THREE.FrontSide,
			roughness: 1,
			metalness: 0.5,
		} );

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

			// this.generateShadow();

			this.game.world.scene.add( this.holder );
			// this.game.world.scene.add( this.shadow );

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

		generateShadow() {

			const shadowTexure = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAArlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABeyFOlAAAAOnRSTlMBBQkOEhYaMyIuJSk5RB4+SU1RfHNVWfKRXZZkpdpum6Cq1be87XeBiOmEjN7lxMxhstCuwGjIa+L2XWIURgAAPPdJREFUeNrs1cEJACAMA0Ddf2knKLRIoI87R0hMDwAAAAAAAAAAAAAAwCo38lgtHpUqbFP8z/wC2IapSPR7FkALCqkAJgvwpbkALkRUGUCVeU5vARThsWsGug3CQAzFx/7/m6epcxU4Us5NSkOShzRN1cTGfH4JLXXDf22Ar/LaAHMIynt/XCi0kH1CxgBzf1Dae37XTuPPcAaYLpDx1UF7lX+JN8BUgRZ+W+v82xwYYI5ANHw25rbpP9gbYIogwzb8HqL3Y/DHFEG++2n4PaW/UcEUgYOCvP2KH2GZIjgOH902f8/GAKPfHybpDxE+mQZg7qkBUBmrfNSEIhj4AyRsDIA6aIFZgnTuWgxsAGwMAJ3T0PlSOe7cFc2wDPlcySP64nV/n4BdCkjhGDD0cbYETF4vvzcxX/gesOIFIjHAAPcESA0AmTT3xgAx6IxiAKQGEGDDGszdg3ddsKDrR4nA+N22P6T8JlufQ94dUAO9qwBy+a1N3wtzoM3A4+jvBpHXxaVfcT7sA6wHxyeASUPA1DscAV7Wxc1fM4etHssdhYgzQAP0MwEbsQV4u/n5pENxH3N4XhleWNACvY3AP0L3TYNhh3td6SeJMATh/WAnE4DnUbv7LqVMhgKiK0x1AizqgQV9jACU+lu8+q7wDOYS/GiZ4IOoB5YFt98MggYIdj/eett183L877ewDWAhDywdjAD/8jrrPoPn/74d3DJUZT9w8/gRfNuPhTgt/rP1jaXvVgbKILAfOJ2A2z42hufX8vKz+HrwP1VYNSysAsBg5yNwxzeHf6k5Ex2pYSCIKhPuawEJ/v9TEYHgkOfqaidjxalwSLBziKp6bpvJToUAvvyJ5jfVfuvdM67WKOzmgjMrwX0/OLrGdjIyzUfxjefF9idr5pNm5wIDAh+B291dWmJrz/pN9Y35iwnC8+6a1xQgCkBBDILpYSNww2Vgygz/2v61+3Hnyy8Xad4kQapgLKSAOxy+zanQVAjQ3v61K9vus/V///GHk6DBCjOAIEuBexJgimW6L2s/j+n99p0pDqwhOECB23xk0B/8x+XX4H81H7D+9TP0ivIoCFJgI6A3hDfCQLjvV+XX3M/q9Z+rk9bnN5r1NqFMtjYCZMD4gwD7T4Xtfyjv505d7w8GhQE5C2iNToDyzhz+ab4qP/Z3tcZfKBKB5xEOAzwcvO0ggP4L96G1F+z+PFDnT+CghgEzCtztdsKSS3Poj/ZL++eTrX9TrkMqD2+HgecAKeC3hKN/b5Fd/xEB237f/YTtXXWKBTPVOgmM6n1JpcO/bz/N98VHzzuLWCAKNAf8LCAngbHvHgr6n22/6v4FjT9JBLVBzFJAaUTnSybz/Vftp/uq+S2d/7K9Iv33lUkpGlRBUKVAEwQG/nYCcvwz9mPlt9X3jj9bPg4tIwHmwXszwBwAPSZx6sfys/usvSt6VxENZAE5wGmgtiO4KwOw/fOb/2r9Z9/9M31/16QWJngUnIDA4w4MMAfA7D/tZ/dT1XeN31r674Lir7FE8CQgBrglWH6SAeMjYHkbpv9c/dvan6/9u+7Kw8BjwENgetyBAaX/PPyzq78sP5vP2tP6rhEobBAsAAiAAVAAEOAqMDIDpuUy4x9Wf7Q/3/1Dlf9wSIeA0MwBQAAMGH8vIPoP+7HtN+UPvXd+w/ajKs8F81UOogzEFBCTwGNUBhgA8ONeJQSu/SH1Few/dJMHA9cDrgWeAg9+bGx8BGS3f2h/2v6iw4T/2KTDUZAcaKBAdhS8HAHxAZAY/vlRD9ovu8/ih54b15NZ+NgWAskBzIPRAfH/GhoBvv++/rL8uvrK9M5K5kBwIFoIdruBGzAA9Y/6vxv+5xb7Wf0Tde8GBR0BDgOkwPxqvxuYb8KAVP/D4V/YX+9+Y+ffn1YjD+ohEBSIT4fJgLEQ0LD+76f/OWc/u580f+vfWf9tEk5FgAlQN5ePeiA4QWb9z7Q/0f0Tbe9ChUQITAR4MrjTWAiYggNgLP+p+rP86L52/2jb36q/sFQwg0E1AV+aIFBjwEMx4CIWeP7n66/bH3lv/D0vE5GIBIICHgJ6M1DRBQQAADAAqvG/bP7T7af9rL32HRHoEYQoAqQANwTYDZQI8LYR6AoCeAD4/kv7WX6ab+reWzYGAgOaAn4Z0IvABbcMRgAI+x8GAOWX9rP32bp/spfUDitHIlAoUCDAAEQMEAjI+T94/1f3Wf6o+imvDyqTiigFOgNtDPCrwOQicMkAgPHf2L+I/gfVr9Ze+94lCMxAmACMAmECyIDpMcwtg7r/RfX+y9Wf7svuq8p3l8iBDwEgoCMw78+EXAbsTcNXDQD17f9q/371l/YvvV/Lj9Ivvv/+TeoFf1ARH6S0vFh1NPjvsAAR2FEA2wF5KviYzVbwCgLkBgDff28/qJ9u/ctT1AQDYMBEwDJgWUgdArrfNEwA2P5vBgA9/BP+zv1Sf2H9S1eJAcFnQC0EnAX9JDjEfwpYAMwP3X9OfxL+GwH7x83/XNGJENgIkALcDnAZaJoCHAL6DwBy/ff4F+1Pm++Npt34AblgpEMgKOCWgWASvB4B+gZQv/63+9/u/mre36tVL3xwewbaE0AG6AOhixCgCbDRMrZi/vf2e/eN9aj4efGpGAWEwGUgH4FBEUD7UwBQ4x8DQP/ZfZqfqvvXUPFjywtEERAJQADkKDgyAhQA1AlggH/YT/cV+eu9f4HXTxJzUGWBwgAygAhkGTAMAqIj4OVtpvsftj9j/2KHsb5HDNaXzURAUsAzYH7ldgKeAP0BQP6n+0//ab8y3+Cd+pZUQxJIAmQAEZCDgGfAVpcgQPefO0Dff4N/lj9qfqPpJ8MAEggOpJaB+zAgOQGsEfD9Z/11+2X1213/XlV7FnZTATIACgACZg7gGDDCFAD3AQDXf4l/3f5d97X7xvG8XAiIgnoEXAIWmUVAIsAToD8AHmoCwAHAG/of1p/uB9WH509VGAQxEIACiAATsChEwOVTwET5AYD918v/pv0s/4t031v/I61UDNRiAAxwFPgYJyBAwJw6DIB6AYD9f2AAaOs/618rv7Aejj9JUQ4ECCQFDjJgIASw/w4Acv4v/rP+gP+LsT9r/c9Q2RioCBADIQQwCSIAQMB1U4D4GAB2AJ7/tv5sP92vW0+/TyrMQSUFoEBjBJgAMuBSBNgJwPff1x+jn7b/n/Nb838K53+Rcza8VRZREE5aNUrUalq0Qv2GFlARUVH//x/zvjSX6d1nZ2fXy7u9xUOi8SuEzHPmzDn74leb0l/cKP4b5EAsLD+XGDAInDAO7kVA/kaYFjApAWQD8Pr79u9Qv9r3ddnHq45C1QvAAF3AmYAn4EAtgD9h6n8BkPXn8If6Xvtu1V/Y6mbBUwAGaAKZAH8PUgzIFjDZAfIGoPyX+7+8+Zjer6pvJI+VcagxgGFgJoHWAUOAkuDIJjDZAUYCAP0/68/2p/pe+6T6w85KLHgKwIA3gUzAB94C8ouAagUDSL8RAAMA+1/Wn+4f5If2WfZcloKAAOZAIoDboIbAIVkAfrYBA/D618J/h/oV6bPsf4bKKFQwiAx4BEhAtIDjvhRwAAmAAQD6c/zr8AP9g/zQPqieylMQEAAB2AY+BgHVIXBwFjCWALgAtPSvTf+kPqRvqf7XQIGFFgaJASSB5AGRAKSASQ6wrwH06v+J19/LD+mD7N/sVEABGBgEPAFCIHvAwVpASABWfy4AWX/JL/UpPjpfwkPs4aqDACcgBGKAJuA9gKuACMgpgBYwaQfIBsABMK4/m1/yQ3wov19VKIARwAZIQPYADoFsARoBdICDMAAEQKN/n/xo/kJ7q/vZfyhLQkEBbKAbARDggyAJyG+CB2EANgDY/j+x+qP5q+oH5ffkoMoAbMATcGI8wMcAbwEhBByEAbyfAqD0R/9Tfqmv3of2QfjLUPY/JAXwATFABOQBIiAEwTAEJl4Dx24AeQPI+i8l/dX91eYv1e9VfZyFkgHagFxABHAKyAMwBOwmcPsW4B0gJwBeALz+WX4rfp/up7b6SLAQZAS8B/AaEIdAugbOigAygAxA1v+zrf/T/Sm/U//ybFdxiJ5r+W92Kbh0DBABzoHtFPgMHgACMgD834lPcAAawMgK0N//Gv9GfqlvxFeNyp59wUAgBgwCCgL9HpBzYAoBEw1gfAPA/le1f7m/1C9bX9Kr8U9r2l9dXS1/bNb2X0PJD85uYFAYgRjQHJAHcBsoPGBwE5hsAXkH8ACYALj5xbP/pT/av6J/rfMh/H8uYkAnqBAAExAB9AB7D8oATHgPSDsAvwQcHwCu/yW/2n/X+iF+0v1ZVyUSAMHuKJAJCAHnAYNDgIvAvD1g5AhgTgBG/9D/Wf+K+ln3cRIqDGQCjAcEAswxADEwXQPnRAB+CpwHAPTvk5/qU/y28E9itUEgBGAgIkAPyEMgxsBZDrB/AlAAQAC0+j+8qT+bvyJ+1D2XpaBAAGFAUcAQwCD4ukZSAC1gtRCA/ufvB/NHwDgA4P/QX/Kr+5viB91/alYgoQGBXEAIkABMgTAEcBC+pT0AEwDyhwQQB8An0N/Zv5qf8kv9IHsuR0EFAdmAGQMk4LX8bgj4FDBrD6AB5DPwyABYSvqj/2H/an92P8WPup+biiQQArqATABjgB5QXAP6h8DsPaDsf5wBEQExAfIAoP+z/Svd79TvE70PBscAXKBmApwCYQhgBjAGznsPyBHAR8AwAKj/56b/Jb+6n+JD+ix8rioGhEAuIASMB3xOAmQBhgDGwBwCJkUAAiD9gwFwAUD/a/eX/kH+pP2DZiUKAgIiQDcBeABXgWABn1oLiJeAtX5DQIoAJgFgAEB/xP8O+Sl+r+hjMACCgIDGgPUADgGfAuIeMMkB8g7ACOhPAAqApv+hv5WfnZ+1z+UY8AiQAHqAgqC3AMbAvAdwDVg7Ahx3TQAmAB8A2f8Kf5LfqN9U/tvuanJgGBACCoP0ABsEuQqaGUALmBAC8g7QEQERAGgA7f6/tPpT/Sx9rsSAJeCy4QGwgBN4QI6Bfg+AB6weAY6SAdzzAIT+p/yXu/JXe79P+e9QfRxUfWAXgUsiEDwAAJgUMLgHzNsBxhMANwDpf33+k/3vjv+r093u9/IXgkt1FlkogPAI7LrA6dVuENAYuD4KigCXA3MKmLkH5AggBwhHoI8GDEDrP+3/TfdLfohvuj1VdAVA8AYBuQDHgA4C3gJ4DMjHoBwCbm8HyAmAGyDnf0N+qY/OD8pfLLX5E+rNP2JVrQAMNBBgDsAu2J8CwovgBAcwBjACQBgA6n/Zf1N/qk/lh6oBQRcBGgPygDQEMgB5Dzia5gDZAJgAuvVXALDyt9TvE34cBMdAEwHFgEhATgFxD6ADrLoEeAPIAEj/AoBCf23/0l/dT/mj+N83KkJABOQCIkAXgYKAAgARoBRAAPIeYFLgnCtAPgIMGUDof8jver9L9QEWjA8AgeABAxaQTwETLgEmAggBD4COAD4BaAMwAcD0v9Ef6gftc9UZMAQYDzAxQJuAWQR0CgAA45eA+RGAEZCvgBwAi/xaAND/lJ/qt6X/PVYbAzBABOgBWgUWBDAEYAEuBuYQYBxgtSvAUQAgJYA8AIz+6H7KH5Qf5IAIwAUMAZ1DIMfA6ZeAfAWIO0BOAMUAkP+r/2X/Tv5S/KD8b7YCByUEBgGNAXmApkAxBGIKyHtAugRMuAKkHYAALAjAAHAB8vqf9+lvlA/lGfAEnHsCcA+CBZgZkADIFjAtAuQdQN8BIAHcrxnAmdHfyE/xs/A/vqkMAhkwCBgCzmoWoHsgj0FhD/AhYJYD5B2ABpATgBkAN+J/U/+K+pS9WYSADDQJuLEMmCGQUgAtwO8BB+oA4QigBOAHAPKflZ/dT+0pe64qBXABhwCToB0CSgHpFHCgDgAAzA6QEoAfAOp/6Y/uh/pR/FwVBowLiAB5gB0CKQVgDwAAB5UBkAFdBIwJAAGw6H/pL/lrzd/Q/lGsBgW7o6BEQAQUHoAgaFNAjoFMgdkBpi8BGYCWAegCwP6n/bP7pb/VPpdhgC7AMVDzAF0DvAXwQSADkC1gvgEQAHMEwA2gNgDU/zf0p/xUP0k/jgEYAAIiYMcDakMAtwBrAXkRzA+CM5aAfAZUBIQBcABQf2//8P6m9H+EamKASeDHAAngEGAKCCFAAEx8EAwGEACA/gLAJADprwUQ/Y/2rza/1X6QAtgATKDqAVoGRQBTQIiBCQBYwAoOMHgFGEwAX+wmAASAZZpq/1P/V+WX+kn550UZDghBHQF5gLbBJ5tCDLiZArZDIMRA7AETLSBHgP0B8AaAAaD+p/5ZfirP6kEABMADNASCBewPwK07wHGKAFv9GQGYALL+tH92P7Sn7rnqFMAFOAYyAUwBDAHbIZBCwPGtO0AEwBhAAIADgP2P9of8Qf1Xz18t5RkgAjAB4wEYAgkAWEAA4DAzQMyAjICtBKAAeA2AlZ/db7R/1VGGgnISNBC4BkBB0KUAxkDuAbe+BoyfAcwVAAYgAJwBuAGg8V/YP5o/i58pgA0UY0BBwAwBawH+GqgQkAHIDjDhDJAMgBMAEbBb/8r4r3Z/U/pfUU0Kqi5QCQK9BMQYmC3g1hwgR4AMABNABED9D/+X+wf5KT2rAwHNAU0BeEACAClgPwCO0ylwfgTQEhh3gCIBUP8HTn+0f6F+Fj5zUDAAE3AEPCgIQApwewAXwT1CwNqHQALQvgKECAgD0ACI+rP7o/ovlx+ZAbhAIkBDABYQY2DrEtAVAmY7QD4DcQL4CLjVXysA9b+A/uh+L/7LUBYCugAIuCAB20VABNgYyBmQT0HZAeZEgAwAl0BcAZUAtAIyAHj9H9X0T+JnCmoEPPIEMAZoFVQKwDUQi+AoAMctB1hhCQgvAciA+hZIO0AxAZAAMACM/lZ+I/0wBQYBEOCGAFNAMQN4C2IKzK8BK6wBdID9rwACADuAAUAGoADg9c/y//Dyh2pt/kFRRMAToBggC/AAaA8AAOOXgLwGrOUAfgvsiwAyAE0AJgANANP/kp/q70rfVYEBIWA8QEOAKUAzQBYQFsGwBhzflgO8VQDcCsATkACg/gJgG/Kz+BmC7Z4gAEiAAMA5yC0Cbw2Ag3MA9zVY3AH0CtAeALH/0fxG5VCwgegB7SGgF4GwB/jvwqY6AK8APgNI/zEAvjIAuAFwAf2d/K2J//Wmlj+qtn/PpwKDAAm4MEPAAfDVGAAiwGeAo0kOkCcAMyCXQEYAJAAYQL/+1H4piY8CBZ0E0AKYAhgCsAgiBeYZAAcoasJbYFcEsDtAcQVkAoD+8H8jP6TvLzJABDAFQABSQHENNHvAUAjgKXAFBxh9C7w3DkBpAAIAA2ABAPo/b+uvtk+1tYg2Ac9BwAIAhoAAKC1gHIB7yQFMCpy6BHxqAMAVADuAzsDFMxBWwN+gP+SH+qZ+fl1dNgAESMCmsAoWT0I6B2MPwCXAAPCpS4GzHIAGkAEwS2DeAZQAuAGg/43+lH0RnvV1hQRDADyAm4BSQNgDkAJHAZAFzHcA6U8AwhXALoFX2gGUAHYHgAJA0f+UHy2fCwwQAXlAEQN+3xRTgPaAK7MIxvcgAiACbt8BEgB0AF0BTAQwEdAEANv/Wf3MgPUAEwNMDFQIMJcAOkACYIIDpCUgPwXpfw+O3xBQLIHFDoAIaAaA7/8gfijPgDzADgGlgOoegEUQM4AA5Adh1QoOMPo1AB3AXwHsBDjPBqD+p/5e/r9//ruozd9pIQATkAdkCzh3M8BeAjIAYQ2Y7wA8A/AOmCOAi4C6AUh/+r+Rv9A+lGOg7gGVIKhbgImBMQTwFmgOAat9E5QjwF4A8ArAJdAYAAZA1h+Nz/JekAngEDAWwEUQlwALwPB74LoOcDwKgD8D7XwK4CdAMgDpb+Wn9r/cKFJgEBAB2QL8DDjDDOApaByAKQ4gBPIhMAPwwkeA800hAgoABgDqT/mpvaegSQBjgABgDFx+LT4EvOgF4N6dcIAP7RmAd8C8BPIIRAPw/Q/1KT2rwoD3AFoAj0F5EeQt0B4CPjx4B9AEGAXARgBvANoAOf/V/pA/VM0FmAO0CzoLYAiIAOTnoIN1AP8W6N+CmQEVAdwOKP1NAGD7U/xczgRMDBABbhNUCGAK9C/C/j3w4BzgbQHwrA1AHgDQ38j/9OaPpwYBEJCHQBuAZysAEBxgzaeAcQC4BIxMAK6AAmBE/qfVGkFAAGAVHJoBXAPGAXjvlhzALwEDADACaAnUDsAdkAYA/Sk/pWc5BESAsQBugtoDtAgiBPQBENcAOoBqPQcYB2D7EmAmwCmWQHcEUAJg/1N/uX6uzb8EAqwHKAW4UwAXwVMzA7a/S3wAgH4HmPRFYHgL5McAAkBnIEwAGwE5AKh/aP5oAySAQ8DHQC6COgX5EMD3wDviAHgMxlugAeCsyIAhAigBmAAg/UPzZxvIBCgFhBBQpMCzkAI7HoQHfm/QFAfwXwMQgL4MqB0ABhAGQGr/x08fqzZ/hSpMIAwBWID2gL4UeH8MgPkOcNTvAB/SAcaXgAebwgQIAFj9ob3UFwTAwBCQAOAMWH4tA2uAfwzodoCj23QAvgURAN4B/RmIACABjOgvyVkDBDAFEAB3CsItcAyA7ACq+Q7gnwIyAD4DagcoIyA2QOoP42e5cQACsAsWMVB7AEPAKAB8DLgjDuAA8C8BLgPqCsAJgAFg9Kf6GYFEAIeAZgAvASYF+tcAC8CBOcB73QCcRAB8BgQA2AEAAPSn/BkBEkAAsAcAAJsCMwAn3QC8N8EB8EkgvgjEJdh/DcAzAO+AiAAhAhoDSLM/hwFvAT4GIgTgFqhLEAFgCOAtmF8F+o8CV/kkMAPwUT8AZ0MAwACYAKW/b/8vix8wgUAALGAYgLN+AD7qAuBNre0Ax6MAuLdAboE+A3IH8AbA/qf6u7X5W8kDnAVwD/ApkHtguARlAHIIWOEQOA+Ai025JRAJQAOg0L8Qf5G7MIAFAfiACKAFKAU0FsGLTU0EYJ4DHL0dAB5mAHgFqJ6BwwBQXYu/6F04QM0HjAWIAJ6DeQnIADxcxwFU0x0gPwXwEMgzgH8IYATwA0DzX/JrAqjkAx0EmBDgngN4COAp8N11gI+7ANAHoQCAS2CxAygBYADA/9H78IE0BJQCsAdgERQA+DC0D4CP74wD4DU4A+C/B7MZkEsgDYD6q/2r6nMUeAJoAVwEfQr0X4VFAPgefGAOAADCJdg9Bj+JAPAMmAFg9wcX+FLbYDEEAIBiYBcAT/AgbG7BCYA76wAAgGcAHIIRAUYMgO2fERi2AIYAHoN5CCAA/18H4BIgAJQBeQUIAEhJ6Z/r5kYYAOAlQClQAHANeEcdQBlwBIC8BRIA7QCKgF5/BP9YIocEKAZqDwAA2AP3A0Ap8KAdYAyAfAbgIVgTYASAQfWv54ViQAJAMwDH4HgIGAbg7jvAfQLAM8C3AMBcATABRvT/J+QAWABnAC8BBGBTPAQQgPvvvgPok9BwB+paAgYAeEzplx/bPxMEWIABoHcNCJcgAfD5O+0A9pNQnQE8AHkJ0AQwBkAK/pEXBAtwi+AIADoE+M9C/x8O8C9757IbNRBEUTFkBRFIWfBYEPEyYqQICRaI/P+PIePF1fhQvm7bHXfNTLMiYUUdn66u6sf/toTOBABloEIB6Kt/HMbwFyDgFMBS0FwA/rst9GqAHoDvBECtoK8EgAIAAEH+/zgesgAUcJxUAAH4qnYQAfjeA3A1wOnBwG8AgM1gdAKQAngB6PvneCsExECQBiIJQDcADWEAoE1hF2OAk24wAeCecAHAFKAAAPP5CwFOAjEAPgsUANwZfgIAu0FJDfCqBgCfFgFAAfD75xh+GyhgGQCfagDwqlEDlAHAPcExAD/XAGC/fw0uBFYA8HMCAO4LflMCwFkYIATgXRkAHywAnfv+NaiAaQA+lAHwbgKASzHAXQkAHw0AKAT7NYDibx0QdIRQDDYAfCwB4C6HAYoAGOJfF4AHABAagIMKoAE6APBQE4CBgHIAqhtA8a8PQFwIjDsBPgV4NMMnAXE3IC4F1gdgGFUN0AYAaAZ/tilA9P37xaDNAj+jIbwrABkNcL8pAJwBvAC4FsQmUSUBWwNwXwGACgbAImA1AO83AwA5oAwgAWxkAGaBmwHwfjMAqID694TWB+BLKQDdKgMQgVIAvrQEwBkYYAUAhQYYhz8VAMoCL8sADwYAIwAzCUTLgAYBuAwD/C4HwAvAG8AD8Ht3AC7DAEUAGAF4A6QC4GoAbwA/rgY4WwPMSwKvBmjcAD+qGmDUDOhSJYGXYQCzDFxvgGsdIJsB5tYBZhaCrnWA9gywvBRsKkHWAOdQCm65G1i9GdStNEDKZtCzQ5puYPV28BoD9PicQzu4ZQPU3xBia0Hx+ZBsG0LQDt7UAGm3hCn4mgTMBMA9gam3hG1sgFSbQscKmFcE4J7AFJtCtQhod1fwk24LZ/gNAm9hgFTbwmWAzOcCNj4YQgRmTABCINXBkFQGeMKjYRpDiAv8n+tomAzQ5Ong3Q6HAoHQ/0Ag1+FQGaDJ08H7HQ/ntUCTJ0O1Bkx2PLxxA+xwQQQVwNUgp38JINkFEekMUP+KGF0QH2hA7p/KAJJcEZPbADUviRohIN8P0bd3BCW5JCqRAZ76mrjRUNg581MAxyzXxLVvgN0uigxnAWUFEwLIclFk+wZo7KrYIexWAGmuik1igB0ui4YDMBh/CSDNZdH7G6DV6+KxErAEdBmvi9/fAO0+GGEcAP1rM2iX58GIzAao8GQMHeARYBsw05MxKQyw36NRQsDHXm8GZXo0SgZo593Ahp6N+2d2N3pTpH02TgZo6N3A3R+OxMux/utX+LtUD0e2aIDb3Z+O7U7qQcELQsOP+t9lfjo2kwF2ezz6rbKB8YVweDq4S/Z49EoDcOz/evjWz8fLA33Y9Xj48OPsz8cHB4M2N8BhKQBqBphCgNpBKAYHSUA4CWgagAf4A37+ij8BYAqgQjBaQaYMoFbAYgAO0dHA7Q4HSgEegJfzAbhfAsCkAugAEDD6M44/EoApASwD4H4+AC9nAVDXAEwCbrArFIUAAfAaAET7grkMwEKQCuAkIAKAgB1H+B8TAAXARSAXAdgTHAHQ/48FZQDuCb0ZpwA1DHCIkwAPwK0HAFtCUAyGAmQAAkACOo+A7M/4EwAZAAJAIZjbQTwAtwYAlwLUNwABWFQLZiEgzgIHBQRpIAkQAmLAf/zQP+PPFFCLQOaAcRlgQSV43rGAw34GYBZYDACLwfFCkFlATIBHQNEP4o8MIF4EshDsATCLgCQGcABEpcBROwi1QJMGegIm8wERovgfo/ibFBB1wFErCHWgCIDbUwCSGOCFKwVyW+h0Fqg5wANAAoSA1oQjCPRTfP6IvwVAM8B0DsgtoSwDnEUOAACCQgCzQC4EsQ4wBBABYYC/nIZfn7/iTwFwDcBFIHNANYNNHaihHKBwQwAN8DoGQP3AiSwQChABmARIwBEIYED+BfGHAOIcUL3AEACtAk03eIUB6m8IYCFAG8PvVAtWJWhUDO5LQawEKA0MJgEQIAlYBuR+lX8Yf04ASgG1BkAZ6LQQ/I0A3GlTOMoA5dsBGjAAAGAWOAAQF4NZCQgV8MsSIA34j9/G/1coAFYB4kLwAAByQAKw0gBCoIoBbgRAeElMyTLAJgHKAsI0gAh4EYgShF/xxwSgDMCkAGWLgPiCGAFws7cBnhcCwH4guwFxFjjqBzALGIYj4NiHGBAo9ow/539mAKM+QJQCCIAwBSgH4Hk9A8R3hdYAIC4FxWmgCJADgAAs4Mcfhn8AABNAnALGZaAKAMQGMOE3DBgDFB0NibsBfg4QAKgFwAEiQAiUQKB//wD9cwL4jQygYAaIeoH+WEhzBvhL3dmrTBFEQRTUQEXwByMDUxNBEQPf/8lk/ZTD9qGm5jrOfmsnooEIdbpu1e1RFwBeTgFoM8ApwDkQAGwCINDlR3/2/wDgBOgE0CbAHICXCwB36wBlE6TXAKVAFUFZgIfA5YgAuQCnSK/bb/2/MAA2DMAlUBlQLwFlD3T3DlAeA2INWFZBsgA3QceATAAIcBbtJf8P6Z8CgDugDWBZA6USUN+C/gsHEADhOcgp0CFA7wGpCkKAETAFPr76lh/9UwXUO4AigDJgegoyAPfjAE+OAUAN6CmQb4ODBUwI+FEQ4OoX/ZsB8D1wz4CUgGMAPLmBAwy+C+4fBodVUJoBTgGOAQEBGODEey/1Jb8DgBNAnABeAw2egso3wfkt4C/ltwOAwAEAFAK8CcACHAM9BBoBRuCit37J5o/+vv9hACgCYgDeAhABjgBABDjbAeJjQPkiwKughx7Yi2C3ADxACMCAIPCx+FYf+bn/3QB6CXwAQGug8hicnwJOcID6HNi/CmwhwDNAALAP9hCwB0AAZ6/6Gv7yfw0AtsACQBOgRYD+RWB5DDzFAVwD8ofhbRmcV0GOgTTBMASCB8CAT7v2Vt/33wFQSyBHwLgG6otgfw7y+A7wdASAd4GsglwEeRMmBVAFNQRMAEfyX3PAL3+W/EF/DwAqIAmAl2CVQNZA2gNOAXj6GA4w/SIgroJyCHAMZAiYACNgBvrJ6lt+688AcARMESCugeZfA9zGAbCAtgiYA+Ae4BRADrQHmIArBICgi3+RHwSkv+4/CVAJQB1gDkBZA2AAJzqAa8AEgPwiTBF0D8ACtgj4jgcsCMAAZ3bzUR/5uf+Xs6U/BuAOQAnMb8FDADCA2zvAMwPQd4FYgGOgAVirYCfgDwIXCEwBLPCzP1aB+H/k7/ovFdAAEAFtAH0POPke6F/uAdoiwBYwAqD3AFuACTACMIAPzM831A/yS38bQO8AMwDmLwEHHeDQe2DeBLgHEAKcAkwAUwAC7AIwIAiq+Kjv24/++L/1dwIgAqgDvEP/YQRofyvgoAPU98DjADgEhBRAFSwecCEAG+BMxOfyo//m/acChgSgCDAH4O4cQJugrdeA3AOwAAjIQ8BTAATMABBwmvCIb/WR3/6fBwD6YwDqAGURLADqIvB8B3jWnoMuZwsALCADQBVkCGQCOgJWml/v8lt/DQAqYAQAA9gC4EV+CgKAcxzA+vcMYAC8CXARXP+GmJsgFpAJMAIwAAblSHrUt/zW3w3AHXD5O2Eugd4CtLfAUx0ABLwKnANQewDrYAiQBWx5gAmAgQddq/hSX/rn+28DQH/WwKUDTAHo/0DQkQlQvwjY6oGDIrhsA8sQEAEgAAOCoJ4sPuojv/QvA2DZAg5KYG6BfRHoCXDcARwCeg3wDHjHLggAnAKwgEKAXYBSmBj41tRHfm5/138xACcA1oDqAADQSsBtHWC+CHAK9N8QVA+wBRADTAD7ACEAA/hAMwOER3zUl/z0f/R3ALABqAO4BCoDTtYAJzmAQ8ABACCAGNgAoAvKAzCBisAfhaP0XX6uv+4/DbAB8KA/HWAEwMkfBHKyAxzfBDgGFgLkAewDQAAGgAAMyrH0iI/6yE//1/1v+jsCvj28BSACnOsAyL8XABdBA+AUQBX0EMADCAJygSUQAkEVX/L79jP+uf8eAFRAJQAACCWwGcC9OECbAfyLsZ4BpIBsAUsTSAgoCgABFPgsgkt7xNfwD/IvDSAagBMABuB/IzZPgEd3gN0A2AIyAFhAGgIKAhBgBMwArtDVR3701/jPAwADyADYAHYD8OgOUJbBLoL+6wGdgOgBMgEYEAWQUHS39ojv6+/73/XvEfDVxhrojjPAXwEQUoCHAB4QCOgIcJLyXf6oP/dfAyAlgNwBCgC3ywBlFThNgYqB3QIIgh/sAUYABoDAHPhYecRHfcvv+/+BAFgMwBFwnAHbIvCoA+S/HLSvBrQe4BRwlQM1BPAAJwFcAAR0Btojv26/pj/3/2oAKAE6AZQOMC4BZzjAfBGQvwtbYqA+DmUILATIA2QCsgFhUI+l9+X39ff9X/VnAOhj0NgBZACDNcAZDuAQEP960CgFeBegGPA7B0CAEFgZAALOTHqJL/UlP/r/nv8KANoBjBJA/p8iznSAYgGHAHAK8BDAA8oY0CSAAVFQtLf68v5i/9x/DwAngN4B2t8Kiy8BRx1gYAGhB9QYiAV4CNgDIAAE5AJAIArasfaI79uP/Ojv+88AsAG0COgOMNsCnO4AGQD3AGIg/3/MFQAXAtwE1iToMQACCwOcI+KjPvIH+1/yHwBcDYAFgDeKgOoACYAaAaT/XP7pJqCsAvQi5CEAAVdlUAgkF4ABKODskd3aI75vv+W/KoDozwBYDGDnEsBbgDt1gMUCAKClgDwE8IBMAAjAABD4WHaLj/rIn/Xn/ucB0BMAACwGcKcO0IogBLxyCshD4GMgICAAA0AABQGEIjzaS/0kf9D/owaAE0DvALkE3N4B+iYghwClgHeyAA0BEfChEAADOkV5qY/8Wf8P0l8DAAPwDsAAjLYAN3WAYgEpBPQUAAEEQSVBIwADQAAF4qAcKY/2iI/6lt/5jwCI/iUBtDVgLgEnOEANARmAHANJAaqCGgKBAMaAEIABnaHyqG/5bf/WXwNAFXDHBOgAZAOQ/mMCtkLAjh6gGKgUsA4BpgAewBgwAmYACIxBP5Ye8a2+5cf+uf/4/zIApL8i4KADBAfQmTvAaBdoC4gzoA+B6AEmAARggHNAe9RHfuuf738fAN4Cxg5QHgJOcQD/94HeBOQY2FNAIUAeYARsA1Dg01UP2uvyS37d/6J/SQAlAvYtgB1gfroD9B4wtIDsARDAGDACMGAI+rH4qG/5sX/0z/d/YAACoEcA/9MA/9IBHAJUA3oM7AQ4BmQEMgNAwJkLL/GD+lF+BYCu/yACagtweweAgYMAsA+EAKoAAHQCYAAIzMHlB0uO8hYf9bv+AEABQH92gAcBeBq2AGc4wHwT4BjYLAAPoAwWBGAACGBAHMzP8hshvtTfkJ8CyP1vBuAIOFgDnu8AbRnoFCACXpch8JUYcD0GPj0ggA3AABAYg19iDnRHfKRHfNTn8j/I/+na/gkAX3cNgJwAdq4Bz3EAfRc46gH6pwKaBVAFrjwAE9AgEAJAEE657Rbf8sv8uf5X958CIAMoA2DWARwB/pkDTHrA7hQAASDgHOAxAAJMAhiAAnPQj5W39qiP9yO/7d/zH/nRf1cCaB1AfyXgHAfY3QMg4AEAVcHqAYyB979OJAAfgAGdkfRSX3c/6v/wZ8X+y/3XDgAAnncDUAQ4xQHycwAETFIABNgCsgfYBMwAFMDB/Fh5xLf6vv75/ssAdP9LApD+eQuA+odbgDcBuQfsTAGOAQwBPMAEBARgAAQ4h7S3+ll+68/9ZwC4Ae5OAAbg1g5gC+gzIFuACbAHdAQEARj4jERHeovf5df9l/7NAHoEdAToDnD8n4oKPaDGwLAMiB7AQmAhICAAA1AwP9Ye9bP8i/7U/3j/QwMoEbB2AAj4lwhEC0gxMBBADIQAB0E8gDHwk7lzW5EiCKIguigOeHvy/z9VlmEJesLcmGK27EkvL+KKROTJrOoeFgVIAUmABWgQIiR40MMe+LfdD3740/9aABkAehl8uASKM8DWBOhzAAkwbQF9FnQGsAhgwGthgB1AAldBF3zTvxb44U/+q//h3wPAK2C9DLQzAXIJsAHzFkAGYIAzAAMcAk4BJJAFmNBl7rAXfHe/2x/+Q/8fAuASG0CeATbhjyVAAkxbgCJAQwADjocBQsApgAI4gAWu+7CbPfTB7+6n/bX+q/9/MQAOATBvABZgw+uA8VpQPBFcHgI+CtgAFGAQDBLIApmQZe6wn+ET/uAXfx0AlgeAV4AtrwN6B4gngjZgFoAPCWgNkAHTGGAQoAASYIFqhTvsBR/8hL/if+b/+9r/xwC4hADiryeBZyRAf0ishwBToBWwA0ggCyxCl8HD3vBNP/GzAMQA6A0A/gqASIDHXw1WBPRBoA34fWvAnzAABXAACVxL3A0f+uBv/n9u+f8u/n0EcACoAv9yAmgNfGALWMqAVwVYBXCAZQAJ0CBMyIK72QOf0Q99hv8V/0L/1wawcAYA3AdHACX8IQAG8EzAiyAGEAJvl0IyQDlAFGABdSWayK+/Cz2Nr943/+vlD+0Pfy+A11L/3yNAvwy0cQnQSwH3RoAvBJ0BXAsTAgcHGAVIQBIoC9bLbU/nA5/oh/6x/bn+df/rCnAlAHwNuDcBZMDxE0JhwLdpEfQecLgQGBTAgUGCqwbkgVVo7NeeB/0AH/oD/sPxX/N/XAC/Bf/PWx8EupwAioASoDNgGAPMASsgBxQGquh1FeRFf8LP9Ff8d/+3AB0An3YmgGfAcBCY14DLnAGtAA5YAjRoE6jmDnrDh37jn/v/Mi8AfQb8rwmAAh0BX8Y9cMiA452Q5wApIAVwAAlcy9SBD33jp/ud/oz/uf/nDfBLBoDPAE1/PQF8EFzaAmwAEUAGMAasACngGJAFEiGrwJu9m5/uB7/iX/2vAZAbYAfAlgSIzweEAO8NASKADJABpIAVwAEkaA+avOCbPvjp/uDPE8B5ACDAMwTAm05H/DoI1BCQAVMGhALEABJgARpgwlqZO+hhD3yav/C7/83/ZgA8TQD8KwEWtgAiYMiAMoA5oBjAASTAgvCgyMMe+NA/Nj/pH/yH/icAnmsDiATICIhFUBlgBXDAEhAEtgARXDNsgYe9Wt/woQ/+7n8vAMG/zwA7JBgSoCPAQ2DIgDRgVgAJ0CBUSOygF3zjD/6/3P/m3wL4GiheBtz3QGg5AjoDrEA4gATSwC50mfqAHvhBX/i7/4M/9BUA2xNAETBsAToJdAb4NDAZYAXkABaoVqnDXvSN/17+3f86AcwbgAJgXwL4W0hVBHgRtAE8G9QuGA5gARrgQaiQBXbIgx72SZ/pr/gXfy+A6xvALgXi8wERARoCMsCbgAyYFcABLFAtYTd76Ad++Kv9yX/x1wCoAOAMsDUBqGkGEAG1BrQBVsAOIIEtwAO70GXqJm/2wDd9t3/w9wLQG0B8k5i9CVBbwHAUmAz4fmsA26BiAAVwwBa4FpCLPfTBr+Z398N/yP/xANAbwL6XQTsB+i6AKdAGaBckBHAACWwBHrQLVFA3ebMHvrvf23/zd/47APYngPHPCdAZgAAyQCGAAjhwjAEUwIFjGCCCVPiHF/pzgT+2PfTBT/NDX8u/8MO/BwBvAp6WAChACb8ioDIAAzwHMMAxgAXKAlx4pKCuvoe9mn9Kf61/1f8dAODfvwK+RUtHwJwBHQLMgdsUUA5gARrIA9cCb5MHvdk7+r38dftH/ysAxH/3KSAiQBkgAciACAGnQCiAA9agq9FDP/HT/Xe3P/2PALkA7E8AKyD8vgzoKWADHAJSwBKggT1wrRMXeaEXfHX/0P7i3/mPAvA/IQFsgCLgoQwgBEIBO5AadBX6pv/D+OH/UP87AFSBf98QoIazYGRAKWAHLAEiuB5hbvCGT+9DH/zfB/xD/8N/+QTwMfgjAXQXoDfE46EAm2AYIAXCASSIauIN3/SV/Rz9gv9P938HgPDXGXB/AuBAZ0AsAkoBOYAF1sAudDV1ozd86IMf+h7/8C/8DoDTEgADpqfCIYAMQAEZIAXkQElAPQSdEnvoC7/4D/FvAXoD2PeBwPUPinoN6AzwGHAIUN8lgSxIE7qau+gLPpuf8Zt/438rL4Dq/0iAnW8GPZIBHgMOAe6HUWBwgNqG3p1v/K+/Mv7J/+5/rwDPkwA+CSxmgFMgYgALpEFUsu6CPOyj+dX9a/HvADg3AbwFHCOgDoMyQALYALYBBwEWhAdVTd70jf/7wD/Gf/R/PgX4XwkwZYASQAaUAu2AcwANbMKvbdhB795v+o1/PQC2kycBOgJexkXgy6oBKMA6gANzFLQIzV3km75u/Zb4u/99ACAAzk2AXgMyA2YF7IBnARI4DLqgG5wTPPB16jP9GX/3/0ssAJurPyfmk8C0B8yroFOAR0RvCuDAIMGGKviwN353/7z+zU+Anqb/+ZxYRIAyoMYAxwE7QB0cwIKhtkF34zd9L//Ef/X/EwaA1wDdCA4XQjwcvFuBy3EdwAKi4H0R7jEj/pI2fbM/Dv7L3fj1+E/89RKA+BMA++vuBDi8IzasghoEVsAx4IMBi8HuEnc6381v/J7+9H+0fzwE2l2eAsIvB3QaDAXkgCSYLTCXj4ROmf4l4It+4EeA/iAQA+AMCYYb4elWeNoFHQI2wArYARBdfzxswvAFBf928MOfe5/b9ufl36/D+B/2v5PugJ0AMQZ4P4gC/6CAHLAEtsAewO36c70AP/19oIs9zS/6Pvt1+z/HFXA+E2ATXM8AGdAK/FOCyz1M80cWHa+djxv/oflpf9a/UQBugOF/1h2w4RMBqxlgBeyAYwAJnAR2YUNdKHW+e9/0PfzX+//z+SdAJcCwBlQGtAGlgCVwfSj3SH16H/zvdT/tf8Dv/tdLQA6AM1bAiABdB/i5gBSQA5IADeTB9mr06n3RV/sbPwV7BsDzBMCbdb0GvIwh0Ab8LAViMaiirat8xXNx58/46X63/3vn/5fkf0oAYEFkQCwCUsAOoIAkkAZbAwHec+cD3/Sr/X388wJw/g1Q3waRAd4DCIFHFCgJOhXWu52WF/xr5zd+up/2f/3PCz8JoAOgFSCKTykUiD1ACmgVGBxAgtAAE/YXxI0e+NX8oDd/up/+nwbAKeVvLd97gBcBygZYgRsJzP+/WMC/1fRpfs1+D//b41+8AsQEOHcMzEcBGaBFAPxywBI4COyBa0u7m/wMP7o/Tv/Z/+clADtgZ4APAw4BDPCR4KjAigTAW3VBXyXgQ1+9D351v9qf0//LPf3/LAnwl52zW24TBoNokWd62fd/3Ja69klyIhYFCBLu6iJ06jiS90efhAwKUAaEEFApYA2QA04CS+FomHZzb+/DvO3v9A/+h//zE0CHhONaAAmQAikGnAOOAstgTzU83rLKPezL+zY/tb/Tv7AADP6/e/9UCXhD0JCab4t7AigADSgIlAURO1rdvhf3Mn+a/O1/3//pPAGQgEIgScC1QBABMrASjge8m/pI/r3arbF/d77u/3Z0BiSeDsmLAS0IFQPaG7IEfkkEmhkOAmFv8n+ZfhX+i3M/iz8w3RXQ2R5gOB2ik6LCDZAC1kBKAulAOMDsZt5Q17G+3A9sf07ayf/9JUAlA7wc9MaglwTeH3QSzOQ7DOpaoNW5pq0AaQRU87HlK/cr/uvbf+cfAms9HuKTor49ZAXkHLAKJIojAd3Z+q76gem3/aHe/u8zARBAmgUIgVANWgI/EYGon9thMvgQOga9q3hf9of+YP8ODoEtA01+jhJCABGEHMhhkNFu8BbbZ+8b0f72fx9LQDAtZ8AsZitAKRBzQFVBEAGupa1/6RqQSsH7mD+kv/zfyRmwtZha9oRIAUkgJ4El8W1Y7IZoN/uZ/r/o4EuAq2mn1QuBkAJpWchNQ1M/t2+RwYf4MehpG/3e/BvS/0sZUFIK5GoANbThAJ8bbGcbcL/K/WUw/6/LACoBS4AYSHMBBsu0P1vA9t+nX6u9D/2e/Uf2//JaQCGgFIg5YEGcBxjnKnnflb8n/zKc/8kAnRVXKRBSwDFwq1I/t7NUQBeAnQ//0f159h/E/xwWT3sCvkVQYhCcmQlNnYB67/pAv2b/0cr/dyABFjKgFgKVGCAJkg6IBLAr7bx/5n6J/vtYjX+fztjTv58gktcDiEDnBTwfnIAG58/9g3uzzzAr9i8D+58U0BkR0V+XQBbBXx10iL89g32Tv8w+3APoH8j+zwSQAvJE4MmgszCoud7Eu+ibf1T5L9i/t69/fPWseFZAJQXwiTQgFZylBEwv15t+BX8o/cT/6V8A+1ICWAL5yKBzQEGwlAffIobb3GT5mvWJsxqYE6eOj362gQSYryNKyoEsAu8dHEO8ka2/RH52/48Ovv3xBZAAOQOWJUASWAZZCbu0FmB8+l+l31O/BTBmAkD/jCnA1YCTgI+zd2B8qA/mT/E/WhX4ANEV+NcWsUAlfetVBgXncxHNH+gfNwH+gARICsgxgKW6DAO6Ri+j+bP9e/v2x4YEQAIpBgI0wZ4oBf68utZuftM/aO2n9eDq5QC+KAHy2TfrwFRn4n2vN9PfwQMAdl0RTitQFAQ5DUhft+0oapUOJDC6kvm/SAJoRTAJ8eRIhmjQ/6lFpmlGpN2Q9aP7xy39FyQwNxDrgayBTPbql25801z0ldXpfzkJkABsC2QUKoINSL7Or9wERtLi/vOf+wB2VcGjCXGncHeY6P0B+Xg/8X9VCZAASoEIPrwyCD5m2Mu73yfHGyRA9VyG0MAzuRDvi7s/HxprEUOvaeDaBWTyX4d6EoDNoRaUZ+tBC+pZK/mwP70E/doizBLIUjhFBvQhEJ9wJ/813K9zo0wFWyACdg6H8EcbYfMPfst3WwK0zwTmgQu3JWSS4ztvk8CD92vs+beBBEANR6DUW8MLdwcn/S5wz3f75hAm2A+Ru9Uk76+CB+XjHvfbDXgAEVwcjPUit3t3TID5x8Ul8G+QA5/1PQJyxRWT4M1YX7buq0AJcL3Z4N1TtV+67FshAv55hSjQaHp7xGdXeJsAV4iCHxrNf/Ij7Jk/bbC6YO6rBtHdwz27xScJcG9DiIAhvO37aF/v7QAyD5f9BYI6/rzu78n+AwHz+HLqZL1IT9/F1H/j74GQAP5sj5fEp91zrzp8oP/Q+N3OHaQADMJAAMT/f7oPWLQUbW1wJjcPQVDXW8YJELXwOkSzqFiuNs+nlNZ5fKNTmtBvlpvw6j/0JAHaZN10c+o7/TIB2OXlBPC5l7IsAQqNaAYAAAAAAAAAAAAA4EAXT834iybEATAAAAAASUVORK5CYII=';
			const shadowGeometry = new THREE.PlaneGeometry( 2, 2 );
			const shadowMaterial = new THREE.MeshBasicMaterial( {
				depthWrite: true,
				// color: 0x00ff33,
				transparent: true,
				opacity: 0.4,
				map: new THREE.TextureLoader().load( shadowTexure )
			} );

			const shadow = new THREE.Mesh( shadowGeometry, shadowMaterial );
			shadow.rotation.x = - Math.PI / 2;
			shadow.position.y = - 1.2;

			this.shadow = shadow;

		}

		loadState() {

			try {

				const gameInProgress = localStorage.getItem( 'gameInProgress' ) == 'yes';

				if ( !gameInProgress ) throw new Error();

				const cubeData = JSON.parse( localStorage.getItem( 'cubeData' ) );
				const gameMoves = JSON.parse( localStorage.getItem( 'gameMoves' ) );
				const gameTime = localStorage.getItem( 'gameTime' );

				if ( !cubeData || !gameMoves || !gameTime ) throw new Error();

				this.pieces.forEach( piece => {

					const index = cubeData.names.indexOf( piece.name );

					const position = cubeData.positions[index];
					const rotation = cubeData.rotations[index];

					piece.position.set( position.x, position.y, position.z );
					piece.rotation.set( rotation.x, rotation.y, rotation.z );

				} );

				this.game.controls.moves = gameMoves;

				this.game.controls.moves.forEach( move => {

					const angle = move[0];
					move[0] = new THREE.Vector3( angle.x, angle.y, angle.z );

				} );

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
			localStorage.setItem( 'gameMoves', JSON.stringify( this.game.controls.moves ) );
			localStorage.setItem( 'gameTime', this.game.timer.deltaTime );

		}

		clearState() {

			localStorage.removeItem( 'gameInProgress' );
			localStorage.removeItem( 'cubeData' );
			localStorage.removeItem( 'gameMoves' );
			localStorage.removeItem( 'gameTime' );

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

	    this.element = null;
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

	    if ( typeof element !== 'undefined' ) this.init( element );

	    return this;

	  }

	  init( element ) {

	    this.element = element;
	    this.element.addEventListener( 'touchstart', this.drag.start, false );
	    this.element.addEventListener( 'mousedown', this.drag.start, false );

	    return this;

	  }

	  dispose() {

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

	    this.draggable = new Draggable( this.game.dom.game );

	    this.draggable.onDragStart = position => {

	      if ( this.state !== 'still' || this.disabled || this.scramble !== null ) return;

	      const edgeIntersect = this.getIntersect( position.current, this.edges, false );

	      if ( edgeIntersect !== false ) {

	        this.drag.normal = edgeIntersect.face.normal.round();
	        this.drag.type = 'layer';

	        this.attach( this.helper, this.game.cube.object );

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

	    const bounce = scramble ? this.options.scrambleBounce : this.options.flipBounce;
	    const bounceCube = ( bounce > 0 ) ? this.bounceCube() : ( () => {} );

	    console.log( bounce ); 

	    this.rotationTween = new CUBE.Tween( {
	      duration: this.options[ scramble ? 'scrambleSpeed' : 'flipSpeed' ],
	      easing: CUBE.Easing.BackOut( bounce ),
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

	    this.rotationTween = new CUBE.Tween( {
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

	class Tween {

	  constructor( options ) {

	    this.target = options.target || null;
	    this.duration = options.duration || 500;
	    this.delay = options.delay || 0;
	    this.from = options.from || {};
	    this.to = options.to || null;
	    this.onComplete = options.onComplete || ( () => {} );
	    this.onUpdate = options.onUpdate || ( () => {} );
	    this.yoyo = options.yoyo || null;

	    if ( typeof options.easing == 'undefined' ) options.easing = p => p; 

	    this.easing = ( typeof options.easing !== 'function' ) 
	      ? this.constructor.Easings[ options.easing ]
	      : options.easing;

	    this.progress = 0;
	    this.delta = 0;
	    this.values = [];

	    if ( this.yoyo != null ) this.yoyo = false;

	    if ( this.target !== null && this.to !== null ) {

	      if ( Object.keys( this.from ).length < 1 ) {

	        Object.keys( this.to ).forEach( key => { this.from[ key ] = this.target[ key ]; } );

	      }

	      Object.keys( this.to ).forEach( key => { this.values.push( key ); } );

	    }

	    setTimeout( () => {

	      this.start = performance.now();
	      this.animate = requestAnimationFrame( () => this.update() );

	    }, this.delay );

	    return this;

	  }

	  kill() {

	    cancelAnimationFrame( this.animate );

	  }

	  update() {

	    const now = performance.now();
	    const old = this.progress * 1;
	    const delta = now - this.start;

	    let progress = delta / this.duration;

	    if ( this.yoyo == true ) progress = 1 - progress;

	    if ( this.yoyo == null && delta > this.duration - 1000 / 60 ) progress = 1;

	    if ( progress >= 1 ) { progress = 1; /*this.progress = 1;*/ }
	    else if ( progress <= 0 ) { progress = 0; /*this.progress = 0;*/ }
	    this.progress = this.easing( progress );

	    this.delta = this.progress - old;

	    this.values.forEach( key => {

	      this.target[ key ] = this.from[ key ] + ( this.to[ key ] - this.from[ key ] ) * this.progress;

	    } );

	    this.onUpdate( this );

	    if ( progress == 1 || progress == 0 ) {

	      if ( this.yoyo != null ) {

	        this.yoyo = ! this.yoyo;
	        this.start = now;

	      } else {

	        this.onComplete( this );
	        return;

	      }

	    }

	    this.animate = requestAnimationFrame( () => this.update() );

	  }

	}

	Tween.Easings = {

	  linear: p => p,

	  easeInQuad: p => {
	    return Math.pow(p, 2);
	  },

	  easeOutQuad: p => {
	    return -(Math.pow((p-1), 2) -1);
	  },

	  easeInOutQuad: p => {
	    if ((p/=0.5) < 1) return 0.5*Math.pow(p,2);
	    return -0.5 * ((p-=2)*p - 2);
	  },

	  easeInCubic: p => {
	    return Math.pow(p, 3);
	  },

	  easeOutCubic: p => {
	    return (Math.pow((p-1), 3) +1);
	  },

	  easeInOutCubic: p => {
	    if ((p/=0.5) < 1) return 0.5*Math.pow(p,3);
	    return 0.5 * (Math.pow((p-2),3) + 2);
	  },

	  easeInQuart: p => {
	    return Math.pow(p, 4);
	  },

	  easeOutQuart: p => {
	    return -(Math.pow((p-1), 4) -1);
	  },

	  easeInOutQuart: p => {
	    if ((p/=0.5) < 1) return 0.5*Math.pow(p,4);
	    return -0.5 * ((p-=2)*Math.pow(p,3) - 2);
	  },

	  easeInQuint: p => {
	    return Math.pow(p, 5);
	  },

	  easeOutQuint: p => {
	    return (Math.pow((p-1), 5) +1);
	  },

	  easeInOutQuint: p => {
	    if ((p/=0.5) < 1) return 0.5*Math.pow(p,5);
	    return 0.5 * (Math.pow((p-2),5) + 2);
	  },

	  easeInSine: p => {
	    return -Math.cos(p * (Math.PI/2)) + 1;
	  },

	  easeOutSine: p => {
	    return Math.sin(p * (Math.PI/2));
	  },

	  easeInOutSine: p => {
	    return (-0.5 * (Math.cos(Math.PI*p) -1));
	  },

	  easeInExpo: p => {
	    return (p===0) ? 0 : Math.pow(2, 10 * (p - 1));
	  },

	  easeOutExpo: p => {
	    return (p===1) ? 1 : -Math.pow(2, -10 * p) + 1;
	  },

	  easeInOutExpo: p => {
	    if(p===0) return 0;
	    if(p===1) return 1;
	    if((p/=0.5) < 1) return 0.5 * Math.pow(2,10 * (p-1));
	    return 0.5 * (-Math.pow(2, -10 * --p) + 2);
	  },

	  easeInCirc: p => {
	    return -(Math.sqrt(1 - (p*p)) - 1);
	  },

	  easeOutCirc: p => {
	    return Math.sqrt(1 - Math.pow((p-1), 2));
	  },

	  easeInOutCirc: p => {
	    if((p/=0.5) < 1) return -0.5 * (Math.sqrt(1 - p*p) - 1);
	    return 0.5 * (Math.sqrt(1 - (p-=2)*p) + 1);
	  },

	  swingFromTo: p => {
	    var s = 1.70158;
	    return ((p/=0.5) < 1) ? 0.5*(p*p*(((s*=(1.525))+1)*p - s)) :
	    0.5*((p-=2)*p*(((s*=(1.525))+1)*p + s) + 2);
	  },

	  swingFrom: p => {
	    var s = 1.70158;
	    return p*p*((s+1)*p - s);
	  },

	  swingTo: p => {
	    var s = 1.70158;
	    return (p-=1)*p*((s+1)*p + s) + 1;
	  },

	};

	const Easing = {

	  BackOut: s => {

	    if ( typeof s === 'undefined' ) s = 1.70158;

	    return p => { return ( p -= 1 ) * p * ( ( s + 1 ) * p + s ) + 1; };

	  },

	  ElasticOut: ( amplitude, period ) => {

	    let PI2 = Math.PI * 2;

	    let p1 = (amplitude >= 1) ? amplitude : 1;
	    let p2 = (period || 0.3) / (amplitude < 1 ? amplitude : 1);
	    let p3 = p2 / PI2 * (Math.asin(1 / p1) || 0);

	    p2 = PI2 / p2;

	    return (p) => { return p1 * Math.pow(2, -10 * p) * Math.sin( (p - p3) * p2 ) + 1; };

	  },

	  // ElasticOut: ( amplitude, period ) => {

	  //   if (typeof amplitude == 'undefined') amplitude = 1;
	  //   if (typeof period == 'undefined') period = 0;

	  //   return p => {
	    
	  //     var offset = 1.70158;

	  //     if ( p == 0 ) return 0;
	  //     if ( p == 1 ) return 1;

	  //     if ( ! period ) period = .3;

	  //     if ( amplitude < 1 ) {

	  //       amplitude = 1;
	  //       offset = period / 4;

	  //     } else {

	  //       offset = period / ( 2 * Math.PI ) * Math.asin( 1 / amplitude );

	  //     }

	  //     return amplitude * Math.pow( 2, -10 * p ) * Math.sin( ( p - offset ) * ( Math.PI * 2 ) / period ) + 1;

	  //   };

	  // },

	};

	class Transition {

	  constructor( game ) {

	    this.game = game;

	    this.data = {};
	    this.tweens = {};
	    this.initialized = false;

	  }

	  initialize() {

	    this.data.cubeY = -0.2;
	    this.data.cameraZoom = 0.85;

	    this.game.controls.disabled = true;

	    this.game.cube.object.position.y = this.data.cubeY;
	    this.game.controls.edges.position.y = this.data.cubeY;
	    this.game.cube.animator.position.y = 4;
	    this.game.cube.animator.rotation.x = - Math.PI / 3;
	    // this.game.cube.shadow.material.opacity = 0;
	    this.game.world.camera.zoom = this.data.cameraZoom;
	    this.game.world.camera.updateProjectionMatrix();

	    this.initialized = true;

	  }

	  cube( show ) {

	    if ( show ) {

	      if ( ! this.initialized ) this.initialize();

	      try { this.tweens.drop.kill(); } catch(e) {}
	      this.tweens.drop = new CUBE.Tween( {
	        duration: 3000, easing: CUBE.Easing.ElasticOut( 0.5, 0.5 ),
	        onUpdate: tween => {

	          this.game.cube.animator.position.y = ( 1 - tween.progress ) * 4;
	          this.game.cube.animator.rotation.x = ( 1 - tween.progress ) * - Math.PI / 3;
	          // this.game.cube.shadow.material.opacity = 0.4 - this.game.cube.animator.position.y / 6;

	        }
	      } );

	      if ( this.game.playing ) {

	        this.game.dom.timer.classList.remove( 'hide' );
	        this.game.dom.timer.innerHTML = this.game.timer.convert( this.game.timer.deltaTime );
	        setTimeout( () => this.timer( true ), 700 );

	      } else {

	        setTimeout( () => this.title( true ), 700 );

	      }

	      setTimeout( () => {

	        this.game.animating = false;

	        if ( this.game.playing ) {

	          this.game.controls.disabled = false;
	          this.game.timer.start( true );

	        }

	      }, 1500 );

	    } else {

	      this.game.controls.disabled = true;

	      if ( this.game.playing ) {

	        this.game.timer.stop();
	        this.timer( false );

	      } else {

	        this.title( false );

	      }

	      try { this.tweens.drop.kill(); } catch(e) {}
	      this.tweens.drop = new CUBE.Tween( {
	        duration: 2000, easing: CUBE.Easing.BackOut( 0.5 ),
	        onUpdate: tween => {

	          this.game.cube.animator.position.y = tween.progress * 4;
	          this.game.cube.animator.rotation.x = tween.progress * Math.PI / 3;
	          // this.game.cube.shadow.material.opacity = 0.4 - this.game.cube.animator.position.y / 6;

	        }
	      } );

	    }

	  }

	  float() {

	      this.tweens.float = new CUBE.Tween( {
	        duration: 1500,
	        easing: 'easeInOutSine',
	        yoyo: true,
	        onUpdate: tween => {

	          this.game.cube.holder.position.y = - 0.02 + tween.progress * 0.04;
	          this.game.cube.holder.rotation.x = 0.005 - tween.progress * 0.01;
	          this.game.cube.holder.rotation.z = - this.game.cube.holder.rotation.x;
	          this.game.cube.holder.rotation.y = this.game.cube.holder.rotation.x;

	        },
	      } );

	  }

	  zoom( game, time, callback ) {

	    const zoom = ( game ) ? 1 : this.data.cameraZoom;
	    const cubeY = ( game ) ? 0 : this.data.cubeY;
	    const duration = ( time > 0 ) ? Math.max( time, 1500 ) : 1500;
	    const rotations = ( time > 0 ) ? Math.round( duration / 1500 ) : 1;
	    const easing = ( time > 0 ) ? 'easeInOutQuad' : 'easeInOutCubic';

	    this.tweens.zoom = new CUBE.Tween( {
	      target: this.game.world.camera,
	      duration: duration,
	      easing: easing,
	      to: { zoom: zoom },
	      onUpdate: () => { this.game.world.camera.updateProjectionMatrix(); },
	    } );

	    this.tweens.rotate = new CUBE.Tween( {
	      target: this.game.cube.animator.rotation,
	      duration: duration,
	      easing: easing,
	      to: { y: - Math.PI * 2 * rotations },
	      onComplete: () => { this.game.cube.animator.rotation.y = 0; callback(); },
	    } );

	  }

	  title( show ) {

	    if ( this.game.dom.title.querySelector( 'span i' ) === null )
	      this.game.dom.title.querySelectorAll( 'span' ).forEach( span => CUBE.Lettering( span ) );

	    this.game.dom.title.classList.add( ( show ) ? 'show' : 'hide' );
	    this.game.dom.title.classList.remove( ( show ) ? 'hide' : 'show' );

	    this.game.dom.note.classList.remove( ( show ) ? 'hide' : 'show' );
	    this.game.dom.note.classList.add( ( show ) ? 'show' : 'hide' );

	  }

	  timer( show ) {

	    CUBE.Lettering( this.game.dom.timer );

	    this.game.dom.timer.classList.add( ( show ) ? 'show' : 'hide' );
	    this.game.dom.timer.classList.remove( ( show ) ? 'hide' : 'show' );

	  }  

	  preferences( show ) {

	    this.game.dom.prefs.querySelectorAll( '.range' ).forEach( ( range, index ) => {

	      if ( show ) range.classList.remove( 'hide', 'show' );

	      setTimeout( () => {

	        range.classList.add( ( show ) ? 'show' : 'hide' );

	      }, ( show ) ? 50 + index * 100 : index * 50 );

	    } );

	  }
	  
	}

	class Timer {

		constructor( game ) {

			this.game = game;

			this.startTime = null;

		}

		start( continueGame ) {

			this.startTime = ( continueGame ) ? ( Date.now() - this.deltaTime ) : Date.now();
			this.deltaTime = 0;
			this.converted = this.convert( this.deltaTime );

			this.animate = requestAnimationFrame( () => this.update() );

		}

		stop() {

			this.currentTime = Date.now();
			this.deltaTime = this.currentTime - this.startTime;

			cancelAnimationFrame( this.animate );

			return { time: this.convert( this.deltaTime ), millis: this.deltaTime };

		}

		update() {

			const old = this.converted;

			this.currentTime = Date.now();
			this.deltaTime = this.currentTime - this.startTime;
			this.converted = this.convert( this.deltaTime );

			if ( this.converted != old ) {

				localStorage.setItem( 'gameTime', JSON.stringify( this.deltaTime ) );
				this.game.dom.timer.innerHTML = this.converted;

			}

			this.animate = requestAnimationFrame( () => this.update() );

		}

		convert( time ) {

			this.seconds = parseInt( ( time / 1000 ) % 60 );
			this.minutes = parseInt( ( time / ( 1000 * 60 ) ) );

			return this.minutes + ':' + ( this.seconds < 10 ? '0' : '' ) + this.seconds;

		}

	}

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
	      }
	    };

	    this.world = new CUBE.World( this );
	    this.cube = new CUBE.Cube( this );
	    this.controls = new CUBE.Controls( this );
	    this.scrambler = new CUBE.Scrambler( this );
	    this.transition = new CUBE.Transition( this );
	    this.audio = new CUBE.Audio( this );
	    this.timer = new CUBE.Timer( this );
	    this.preferences = new CUBE.Preferences( this );
	    this.icons = new CUBE.Icons();

	    this.initStart();
	    // this.initPause();
	    this.initPrefs();

	    this.saved = this.cube.loadState();
	    this.playing = false;
	    this.animating = true;

	    this.transition.float();
	    this.transition.cube( true );

	    this.controls.onMove = data => { if ( this.audio.musicOn ) this.audio.click.play(); };
	    this.controls.onSolved = () => { this.timer.stop(); this.cube.clearState(); };

	  }

	  initPause() {

	    this.dom.buttons.home.onclick = e => {

	      e.stopPropagation();
	      if ( !this.playing ) return;

	      this.playing = false;
	      this.timer.stop();
	      this.controls.disabled = true;

	      this.transition.title( true );
	      setTimeout( () => this.transition.timer( false ), 500 );

	      this.transition.zoom( false, 0, () => {} );

	    };

	  }

	  initStart() {

	    let tappedTwice = false;

	    const tapHandler = event => {

	      event.preventDefault();

	      if ( ! tappedTwice ) {

	          tappedTwice = true;
	          setTimeout( () => { tappedTwice = false; }, 300 );
	          return false;

	      }

	      if ( this.playing || this.animating ) return;
	      this.animating = true;
	      let duration = 0;

	      if ( ! this.saved ) {

	        this.dom.timer.innerHTML = '0:00';

	        this.scrambler.scramble();
	        this.controls.scrambleCube( () => {} );

	        duration = this.scrambler.converted.length * this.controls.options.scrambleSpeed;

	      } else {

	        this.dom.timer.classList.remove( 'hide' );
	        this.dom.timer.innerHTML = this.timer.convert( this.timer.deltaTime );

	      }

	      this.transition.title( false );
	      setTimeout( () => this.transition.timer( true ), 500 );

	      this.transition.zoom( true, duration, () => {

	        this.playing = true;
	        this.animating = false;
	        this.controls.disabled = false;
	        this.timer.start( this.saved );
	        this.saved = true;

	      } );

	    };

	    this.dom.game.addEventListener( 'click', tapHandler, false );
	    this.dom.game.addEventListener( 'touchstart', tapHandler, false );

	  }

	  initPrefs() {

	    const button = this.dom.buttons.settings;

	    button.addEventListener( 'click', () => {

	      button.classList.toggle( 'active' );

	      if ( button.classList.contains( 'active' ) ) {

	        this.transition.cube( false );
	        setTimeout( () => this.transition.preferences( true ), 300 );

	      } else {

	        this.transition.preferences( false );
	        this.transition.cube( true );

	      }

	    }, false );

	  }

	}

	const Lettering = element => {

	  const text = element.innerHTML;

	  element.innerHTML = '';

	  text.split( '' ).forEach( letter => {

	    const i = document.createElement( 'i' );

	    i.innerHTML = letter;

	    element.appendChild( i );

	  } );

	};

	class Icons {

		constructor( options ) {

			options = Object.assign( {
				tagName: 'icon',
				className: 'icon',
				// styles: true,
				observe: false,
				convert: true,
			}, options || {} );

			this.tagName = options.tagName;
			this.className = options.className;
			this.svg = this.constructor.SVG;

			this.svgTag = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
			this.svgTag.setAttribute( 'class', this.className );

			// if ( options.styles ) this.addStyles();
			if ( options.convert ) this.convertAllIcons();

			if ( options.observe ) {

				const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
				this.observer = new MutationObserver( mutations => { this.convertAllIcons(); } );
				this.observer.observe( document.documentElement, { childList: true, subtree: true } );

			}

			return this;

		}

		convertAllIcons() {

			document.querySelectorAll( this.tagName ).forEach( icon => { this.convertIcon( icon ); } );

		}

		convertIcon( icon ) {

			const svgData = this.svg[ icon.attributes[0].localName ];

			if ( typeof svgData === 'undefined' ) return;

			const svg = this.svgTag.cloneNode( true );
			const viewBox = svgData.viewbox.split( ' ' );

			svg.setAttributeNS( null, 'viewBox', svgData.viewbox );
			svg.style.width = viewBox[2] / viewBox[3] + 'em';
			svg.style.height = '1em';
			svg.innerHTML = svgData.content;

			icon.parentNode.replaceChild( svg, icon );

		}

		// addStyles() {

		// 	const style = document.createElement( 'style' );
		// 	style.innerHTML = `
		// 		.${this.className} {
		// 			display: inline-block;
		// 			font-size: inherit;
		// 			overflow: visible;
		// 			vertical-align: -0.125em;
		// 			preserveAspectRatio: none;
		// 		}`;
		// 	document.head.appendChild( style );

		// }

	}

	Icons.SVG = {
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
	};

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

	class Preferences {

	  constructor( game ) {

	    this.game = game;

	    this.load();

	    this.elements = {

	      speed: new CUBE.Range( 'speed', {
	        value: this.game.controls.options.flipSpeed,
	        range: [ 300, 100 ],
	        onComplete: value => {

	          this.game.controls.options.flipSpeed = value;
	          localStorage.setItem( 'flipSpeed', value );

	          this.game.controls.options.flipBounce = ( ( value - 100 ) / 200 ) * 2;
	          localStorage.setItem( 'flipBounce', this.game.controls.options.flipBounce );
	          
	        },
	      } ),

	      // bounce: new CUBE.Range( 'bounce', {
	      //   value: this.game.controls.options.flipBounce,
	      //   range: [ 0, 2 ],
	      //   onUpdate: value => { this.game.controls.options.flipBounce = value; },
	      //   onComplete: value => { localStorage.setItem( 'flipBounce', value ); },
	      // } ),

	      scramble: new CUBE.Range( 'scramble', {
	        value: this.game.scrambler.scrambleLength,
	        range: [ 20, 30 ],
	        step: 5,
	        onComplete: value => {

	          this.game.scrambler.scrambleLength = value;
	          localStorage.setItem( 'scrambleLength', value );

	        },
	      } ),

	      fov: new CUBE.Range( 'fov', {
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

	      theme: new CUBE.Range( 'theme', {
	        value: 0,
	        range: [ 0, 1 ],
	        step: 1,
	        onUpdate: value => {},
	      } ),

	    };

	  }

	  load() {

	    const flipSpeed = parseFloat( localStorage.getItem( 'flipSpeed' ) );
	    const flipBounce = parseFloat( localStorage.getItem( 'flipBounce' ) );
	    const scrambleLength = parseInt( localStorage.getItem( 'scrambleLength' ) );
	    const fov = parseFloat( localStorage.getItem( 'fov' ) );
	    // const theme = localStorage.getItem( 'theme' );

	    if ( flipSpeed != null ) this.game.controls.options.flipSpeed = flipSpeed;
	    if ( flipBounce != null ) this.game.controls.options.flipBounce = flipBounce;
	    if ( scrambleLength != null ) this.game.scrambler.scrambleLength = scrambleLength;

	    if ( fov != null ) {

	      this.game.world.fov = fov;
	      this.game.world.resize();

	    }

	  }

	}

	const RangeHTML = [

	  '<div class="range">',
	    '<div class="range__label"></div>',
	    '<div class="range__track">',
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

	exports.World = World;
	exports.Cube = Cube;
	exports.Controls = Controls;
	exports.Scrambler = Scrambler;
	exports.Tween = Tween;
	exports.Easing = Easing;
	exports.Transition = Transition;
	exports.Timer = Timer;
	exports.Game = Game;
	exports.Lettering = Lettering;
	exports.Icons = Icons;
	exports.Audio = Audio;
	exports.Preferences = Preferences;
	exports.Range = Range;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
