(function () {
	'use strict';

	const animationEngine = ( () => {

	  let uniqueID = 0;

	  class AnimationEngine {

	    constructor() {

	      this.ids = [];
	      this.animations = {};
	      this.update = this.update.bind( this );
	      this.raf = 0;
	      this.time = 0;

	    }

	    update() {

	      const now = performance.now();
	      const delta = now - this.time;
	      this.time = now;

	      let i = this.ids.length;

	      this.raf = i ? requestAnimationFrame( this.update ) : 0;

	      while ( i-- )
	        this.animations[ this.ids[ i ] ] && this.animations[ this.ids[ i ] ].update( delta );

	    }

	    add( animation ) {

	      animation.id = uniqueID ++;

	      this.ids.push( animation.id );
	      this.animations[ animation.id ] = animation;

	      if ( this.raf !== 0 ) return;

	      this.time = performance.now();
	      this.raf = requestAnimationFrame( this.update );

	    }

	    remove( animation ) {

	      const index = this.ids.indexOf( animation.id );

	      if ( index < 0 ) return;

	      this.ids.splice( index, 1 );
	      delete this.animations[ animation.id ];
	      animation = null;

	    }

	  }

	  return new AnimationEngine();

	} )();

	class Animation {

	  constructor( start ) {

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

			this.onResize = [];

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

			if ( this.onResize ) this.onResize.forEach( cb => cb() );

		}

		createLights() {

			this.lights = {
				holder:  new THREE.Object3D,
				ambient: new THREE.AmbientLight( 0xffffff, 0.69 ),
				front:   new THREE.DirectionalLight( 0xffffff, 0.36 ),
				back:    new THREE.DirectionalLight( 0xffffff, 0.19 ),
			};

			this.lights.front.position.set( 1.5, 5, 3 );
			this.lights.back.position.set( -1.5, -5, -3 );

			this.lights.holder.add( this.lights.ambient );
			this.lights.holder.add( this.lights.front );
			this.lights.holder.add( this.lights.back );

			this.scene.add( this.lights.holder );

		}

		enableShadows() {

			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

			this.lights.front.castShadow = true;

	    this.lights.front.shadow.mapSize.width = 512;
	    this.lights.front.shadow.mapSize.height = 512;

	    var d = 1.5;

	    this.lights.front.shadow.camera.left = -d;
	    this.lights.front.shadow.camera.right = d;
	    this.lights.front.shadow.camera.top = d;
	    this.lights.front.shadow.camera.bottom = -d;

	    this.lights.front.shadow.camera.near = 1;
	    this.lights.front.shadow.camera.far = 9;

			// const helper = new THREE.CameraHelper( this.lights.front.shadow.camera );
			// this.scene.add( helper );

			this.game.cube.holder.traverse( node => {

				if ( node instanceof THREE.Mesh ) {

					node.castShadow = true;
					node.receiveShadow = true;

				}

			} );

			// this.ground = new THREE.Mesh(
			// 	new THREE.PlaneBufferGeometry( 20, 20 ),
			// 	new THREE.MeshStandardMaterial( { color: 0x00aaff } )
			// );

			// this.ground.receiveShadow = true;
			// this.ground.rotation.x = - Math.PI / 2;
			// this.ground.position.y = - 1.5;

			// this.scene.add( this.ground );

		}

	}

	function RoundedBoxGeometry( size, radius, radiusSegments ) {

	  THREE.BufferGeometry.call( this );

	  this.type = 'RoundedBoxGeometry';

	  radiusSegments = ! isNaN( radiusSegments ) ? Math.max( 1, Math.floor( radiusSegments ) ) : 1;

	  var width, height, depth;

	  width = height = depth = size;
	  radius = size * radius;

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

	window.addEventListener( 'touchmove', () => {} );
	document.addEventListener( 'touchmove',  event => { event.preventDefault(); }, { passive: false } );

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

	class Confetti extends Animation {

	  constructor( game ) {

	    super( false );

	    this.game = game;

	    this.count = 100;
	    this.particles = [];

	    this.holder = new THREE.Object3D();
	    this.holder.rotation.copy( this.game.world.camera.rotation );
	    this.game.world.scene.add( this.holder );

	    this.object = new THREE.Object3D();
	    this.holder.add( this.object );

	    this.resizeViewport = this.resizeViewport.bind( this );
	    this.game.world.onResize.push( this.resizeViewport );
	    this.resizeViewport();    

	    this.geometry = new THREE.PlaneGeometry( 1, 1 );
	    this.material = new THREE.MeshLambertMaterial( { transparent: true, side: THREE.DoubleSide } );
	    this.opacity = 0;
	    this.callback = ( () => {} );

	    this.particleOptions = {
	      geometry: this.geometry,
	      material: this.material,
	      holder: this.object,
	      velocity: { min: 5, max: 20 },
	      revolution: { min: 0, max: 0.05 },
	      angle: { direction: new THREE.Vector3( 0, 1, 0 ), spread: 30 },
	      radius: { min: 10, max: 15 },
	      mass: { min: 0.05, max: 0.1 },
	      gravity: -9.81,
	      geometryScale: 0.01, // used to scale in threejs world
	      positionScale: 0.3333, // used to scale in threejs world
	      colors: [ 0x41aac8, 0x82ca38, 0xffef48, 0xef3923, 0xff8c0a ],
	    };

	    let i = this.count;
	    while ( i-- )  this.particles.push( new Particle( this.particleOptions ) );

	  }

	  start( callback ) {

	    this.opacity = 0;
	    this.done = 0;
	    this.time = performance.now();
	    this.callback = ( typeof callback === 'function') ? callback : () => {};
	    
	    super.start();

	  }

	  stop() {

	    super.stop();

	    let i = this.count;
	    while ( i-- ) this.particles[ i ].reset();

	  }

	  update() {

	    const now = performance.now();
	    const delta = now - this.time;
	    this.time = now;

	    this.opacity += ( 1 - this.opacity ) * 0.1;

	    let i = this.count;
	    while ( i-- ) {

	      if ( this.particles[ i ].update( delta, this.opacity ) ) this.done++;

	    }

	    if ( this.done == this.count) {

	      this.stop();

	      this.callback();
	      this.callback = ( () => {} );

	    }

	  }

	  resizeViewport() {

	    const distanceFromCube = 1;

	    const fovRad = this.game.world.camera.fov * THREE.Math.DEG2RAD;
	    this.height = 2 * Math.tan( fovRad / 2 ) * ( this.game.world.camera.position.length() - distanceFromCube );
	    this.width = this.height * this.game.world.camera.aspect;

	    this.object.position.z = distanceFromCube;
	    this.object.position.y = this.height / 2;

	  }
	  
	}

	const rnd = THREE.Math.randFloat;

	class Particle {

	  constructor( options ) {

	    this.options = options;

	    this.velocity = new THREE.Vector3();
	    this.force = new THREE.Vector3();

	    this.mesh = new THREE.Mesh( options.geometry, options.material.clone() );

	    options.holder.add( this.mesh );

	    this.reset();

	    this.ag = options.gravity; // -9.81

	    return this;

	  }

	  reset() {

	    const axis = this.velocity.clone();

	    this.velocity.copy( this.options.angle.direction ).multiplyScalar( rnd( this.options.velocity.min, this.options.velocity.max ) );
	    this.velocity.applyAxisAngle( axis.set( 1, 0, 0 ), rnd( -this.options.angle.spread / 2, this.options.angle.spread / 2 ) * THREE.Math.DEG2RAD );
	    this.velocity.applyAxisAngle( axis.set( 0, 0, 1 ), rnd( -this.options.angle.spread / 2, this.options.angle.spread / 2 ) * THREE.Math.DEG2RAD );

	    this.color = new THREE.Color( this.options.colors[ Math.floor( Math.random() * this.options.colors.length ) ] );

	    this.revolution = new THREE.Vector3(
	      rnd( this.options.revolution.min, this.options.revolution.max ),
	      rnd( this.options.revolution.min, this.options.revolution.max ),
	      rnd( this.options.revolution.min, this.options.revolution.max )
	    );

	    this.mesh.position.set( 0, 0, 0 );

	    this.positionScale = this.options.positionScale;
	    this.mass = rnd( this.options.mass.min, this.options.mass.max );
	    this.radius = rnd( this.options.radius.min, this.options.radius.max );
	    this.scale = this.radius * this.options.geometryScale;

	    this.mesh.scale.set( this.scale, this.scale, this.scale );
	    this.mesh.material.color.set( this.color );
	    this.mesh.material.opacity = 0;
	    this.mesh.rotation.set( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 );

	    this.physics = this.getPhysics( this.radius );

	    this.done = false;

	  }

	  update( delta, opacity, complete ) {

	    if ( this.done ) return false;

	    delta = 16 / 1000;

	    this.force.set(
	      this.getForce( this.velocity.x ),
	      this.getForce( this.velocity.y ) + this.ag,
	      this.getForce( this.velocity.z )
	    );

	    this.velocity.add( this.force.multiplyScalar( delta ) );

	    this.mesh.position.add( this.velocity.clone().multiplyScalar( delta * this.positionScale ) );
	    this.mesh.rotateX( this.revolution.x ).rotateY( this.revolution.y ).rotateZ( this.revolution.y );
	    this.mesh.material.opacity = opacity * this.getProgressInRange( this.mesh.position.y, -4, -2 );

	    if ( this.mesh.position.y < -4 ) { 
	      
	      this.done = true;
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

	    return this.physics * velocity * velocity * Math.sign( velocity ) / this.mass;

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

			this.tagName = options.tagName;
			this.className = options.className;
			this.icons = options.icons;

			this.svgTag = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
			this.svgTag.setAttribute( 'class', this.className );

			if ( options.styles ) this.addStyles();
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

			const svgData = this.icons[ icon.attributes[0].localName ];

			if ( typeof svgData === 'undefined' ) return;

			const svg = this.svgTag.cloneNode( true );
			const viewBox = svgData.viewbox.split( ' ' );

			svg.setAttributeNS( null, 'viewBox', svgData.viewbox );
			svg.style.width = viewBox[2] / viewBox[3] + 'em';
			svg.style.height = '1em';
			svg.innerHTML = svgData.content;

			icon.parentNode.replaceChild( svg, icon );

		}

		addStyles() {

			const style = document.createElement( 'style' );
	    style.innerHTML = `.${this.className} { display: inline-block; font-size: inherit; overflow: visible; vertical-align: -0.125em; preserveAspectRatio: none; }`;
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
	    'back': {
	      viewbox: '0 0 512 512',
	      content: '<path transform="translate(512, 0) scale(-1,1)" fill="currentColor" d="M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z" class=""></path>',
	    },
	    'trophy': {
	      viewbox: '0 0 576 512',
	      content: '<path fill="currentColor" d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 66.5 77.9 131.7 171.9 142.4C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6C498.4 275.6 576 210.3 576 144V88c0-13.3-10.7-24-24-24zM64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-47.5-16.4-77-49.9-77-70.2zm448 0c0 20.2-29.4 53.8-77 70.2 7-25 11.8-53.6 12.8-86.2H512v16zm-127.3 4.7l-39.6 38.6 9.4 54.6c1.7 9.8-8.7 17.2-17.4 12.6l-49-25.8-49 25.8c-8.8 4.6-19.1-2.9-17.4-12.6l9.4-54.6-39.6-38.6c-7.1-6.9-3.2-19 6.7-20.5l54.8-8 24.5-49.6c4.4-8.9 17.1-8.9 21.5 0l24.5 49.6 54.8 8c9.6 1.5 13.5 13.6 6.4 20.5z" class=""></path>',
	    },
	    // 'settings': {
	    //   viewbox: '0 0 627 627',
	    //   content: '<g fill-rule="evenodd" clip-rule="evenodd"><path fill="darkgray" d="M386 114l64 37 103 -20 38 66 -69 79 0 74 69 80 -38 66 -103 -20 -64 37 -35 99c-25,0 -50,0 -76,0l-34 -99 -64 -37 -104 20 -38 -66 69 -80 0 -74 -69 -79 38 -66 104 20 64 -37 34 -100c26,0 51,0 76,0l35 100zm-73 94l91 53 0 105 -91 52 -91 -52 0 -105 91 -53z"/><path fill="#7C7C7D" d="M313 178l118 68 0 135 -118 68 -117 -68 0 -135 117 -68zm0 98l38 37 -38 38 -37 -38 37 -37z"/></g>',
	    // },
	    // 'back': {
	    //   viewbox: '0 0 656 656',
	    //   content: '<polygon fill="darkgray" points="254,547 15,328 254,110 254,228 511,228 641,563 425,428 254,428 "/>',
	    // },
	    // 'trophy': {
	    //   viewbox: '0 0 599 599',
	    //   content: '<polygon fill="#41AAC8" points="130,14 469,14 469,144 305,335 300,316 294,335 130,144 "/><rect fill="#368DA7" x="226" y="14" width="147" height="227"/><polygon fill="darkgray" points="300,135 494,248 494,473 300,585 105,473 105,248 "/><polygon fill="#7C7C7D" points="300,213 331,311 433,310 350,370 382,467 300,407 217,467 249,370 166,310 268,311 "/>',
	    // }
	  },

	  convert: true,

	} );

	const MENU = 0;
	const PLAYING = 1;
	const COMPLETE = 2;
	const STATS = 3;
	const PREFS = 4;

	const SHOW = true;
	const HIDE = false;

	class Game {

	  constructor() {

	    this.dom = {
	      ui: document.querySelector( '.ui' ),
	      game: document.querySelector( '.ui__game' ),
	      texts: document.querySelector( '.ui__texts' ),
	      prefs: document.querySelector( '.ui__prefs' ),
	      stats: document.querySelector( '.ui__stats' ),
	      texts: {
	        title: document.querySelector( '.text--title' ),
	        note: document.querySelector( '.text--note' ),
	        timer: document.querySelector( '.text--timer' ),
	        stats: document.querySelector( '.text--timer' ),
	        complete: document.querySelector( '.text--complete' ),
	        best: document.querySelector( '.text--best-time' ),
	      },
	      buttons: {
	        prefs: document.querySelector( '.btn--prefs' ),
	        back: document.querySelector( '.btn--back' ),
	        stats: document.querySelector( '.btn--stats' ),
	      }
	    };

	    this.world = new World( this );
	    // this.cube = new Cube( this );
	    // this.controls = new Controls( this );
	    // this.scrambler = new Scrambler( this );
	    // this.transition = new Transition( this );
	    // this.timer = new Timer( this );
	    // this.preferences = new Preferences( this );
	    this.confetti = new Confetti( this );
	    // this.scores = new Scores( this );
	    // this.storage = new Storage( this );

	    // this.initActions();

	    // this.state = MENU;
	    // this.saved = false;

	    // this.storage.init();
	    // this.preferences.init();
	    // this.transition.init();

	    // this.scores.calcStats();

	    // setTimeout( () => {

	    //   this.transition.float();
	    //   this.transition.cube( SHOW );

	    //   setTimeout( () => this.transition.title( SHOW ), 700 );
	    //   setTimeout( () => this.transition.buttons( [ 'prefs', 'stats' ], [] ), 1000 );

	    // }, 500 );

	  }

	  initActions() {

	    let tappedTwice = false;

	    this.dom.game.onclick = event => {

	      if ( this.transition.activeTransitions > 0 ) return;
	      if ( this.state === PLAYING ) return;

	      if ( this.state === MENU ) {

	        if ( ! tappedTwice ) {

	          tappedTwice = true;
	          setTimeout( () => tappedTwice = false, 300 );
	          return false;

	        }

	        if ( ! this.saved ) {

	          this.scrambler.scramble();
	          this.controls.scrambleCube();

	        }

	        const duration = this.saved ? 0 : this.scrambler.converted.length * this.controls.scrambleSpeed;

	        this.state = PLAYING;
	        this.saved = true;

	        this.transition.buttons( [], [ 'stats', 'prefs' ] );

	        this.transition.zoom( PLAYING, duration );
	        this.transition.title( HIDE );

	        setTimeout( () => {

	          this.transition.timer( SHOW );
	          this.transition.buttons( [ 'back' ], [] );

	        }, this.transition.durations.zoom - 1000 );

	        setTimeout( () => {

	          this.controls.enable();
	          this.timer.start( true );

	        }, this.transition.durations.zoom );

	      } else if ( this.state === COMPLETE ) {

	        this.state = STATS;
	        this.saved = false;

	        this.transition.timer( HIDE );
	        this.transition.complete( HIDE, this.bestTime );
	        this.transition.cube( HIDE );
	        this.timer.reset();

	        setTimeout( () => {

	          this.cube.reset();

	          this.transition.stats( SHOW );
	          this.transition.elevate( 0 );

	        }, 1000 );

	        return false;

	      } else if ( this.state === STATS ) {

	        this.state = MENU;

	        this.transition.buttons( [ 'stats', 'prefs' ], [] );

	        this.transition.stats( HIDE );

	        setTimeout( () => this.transition.cube( SHOW ), 500 );
	        setTimeout( () => this.transition.title( SHOW ), 1200 );

	      } else if ( this.state === PREFS ) {

	        this.state = MENU;

	        this.transition.buttons( [ 'stats', 'prefs' ], [] );

	        this.transition.preferences( HIDE );

	        setTimeout( () => this.transition.cube( SHOW ), 500 );
	        setTimeout( () => this.transition.title( SHOW ), 1200 );

	      }

	    };

	    this.dom.buttons.back.onclick = event => {

	      if ( this.transition.activeTransitions > 0 ) return;
	      if ( this.state !== PLAYING ) return;

	      this.state = MENU;

	      this.transition.buttons( [ 'stats', 'prefs' ], [ 'back' ] );

	      this.transition.zoom( MENU, 0 );

	      this.controls.disable();
	      this.timer.stop();
	      this.transition.timer( HIDE );

	      setTimeout( () => this.transition.title( SHOW ), this.transition.durations.zoom - 1000 );

	      this.playing = false;
	      this.controls.disable();

	    };

	    this.dom.buttons.prefs.onclick = event => {

	      if ( this.transition.activeTransitions > 0 ) return;

	      this.state = PREFS;

	      this.transition.buttons( [], [ 'stats', 'prefs' ] );

	      this.transition.title( HIDE );
	      this.transition.cube( HIDE );

	      setTimeout( () => this.transition.preferences( SHOW ), 1000 );

	    };

	    this.dom.buttons.stats.onclick = event => {

	      if ( this.transition.activeTransitions > 0 ) return;

	      this.state = STATS;

	      this.transition.buttons( [], [ 'stats', 'prefs' ] );

	      this.transition.title( HIDE );
	      this.transition.cube( HIDE );

	      setTimeout( () => this.transition.stats( SHOW ), 1000 );

	    };

	    this.controls.onMove = () => {



	    };

	    this.controls.onSolved = () => {

	      this.transition.buttons( [], [ 'back' ] );

	      this.state = COMPLETE;
	      this.saved = false;

	      this.controls.disable();
	      this.timer.stop();
	      this.storage.clearGame();

	      this.bestTime = this.scores.addScore( this.timer.deltaTime );

	      this.transition.zoom( MENU, 0 );
	      this.transition.elevate( SHOW );

	      setTimeout( () => this.transition.complete( SHOW, this.bestTime ), 1000 );

	    };

	  }

	}

	const game = new Game();

	window.game = game;

}());
