;(function(){
  RoundedBoxGeometry = function ( width, height, depth, radius, radiusSegments ) {
    THREE.BufferGeometry.call( this );
    this.type = 'RoundedBoxGeometry';
    radiusSegments = !isNaN( radiusSegments ) ? Math.max( 1, Math.floor( radiusSegments ) ) : 1 ;
    width =  !isNaN(width)  ? width  : 1;
    height = !isNaN(height) ? height : 1;
    depth =  !isNaN(depth)  ? depth  : 1;
    radius = !isNaN(radius) ? radius : .15;
    radius = Math.min( radius , Math.min( width , Math.min( height , Math.min( depth ) ) ) / 2 );
    var edgeHalfWidth =  width / 2 - radius;
    var edgeHalfHeight = height / 2 - radius;
    var edgeHalfDepth =  depth / 2 - radius;
    this.parameters = {
      width: width , 
      height: height , 
      depth: depth , 
      radius: radius, 
      radiusSegments: radiusSegments
    };
    var rs1 =  radiusSegments + 1; //radius segments + 1 
    var totalVertexCount = ( rs1 * radiusSegments + 1 ) << 3; 
    var positions =   new THREE.BufferAttribute( new Float32Array( totalVertexCount * 3 ), 3 );
    var normals =     new THREE.BufferAttribute( new Float32Array( totalVertexCount * 3 ), 3 );
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
    doDepthEdges()
    function doVertices(){
      var cornerLayout = [
        new THREE.Vector3(  1 ,  1 ,  1 ),
        new THREE.Vector3(  1 ,  1 , -1 ),
        new THREE.Vector3( -1 ,  1 , -1 ),
        new THREE.Vector3( -1 ,  1 ,  1 ),
        new THREE.Vector3(  1 , -1 ,  1 ),
        new THREE.Vector3(  1 , -1 , -1 ),
        new THREE.Vector3( -1 , -1 , -1 ),
        new THREE.Vector3( -1 , -1 ,  1 )
      ];
      for ( var j = 0 ; j < 8 ; j ++ ){
        cornerVerts.push([]); 
        cornerNormals.push([]); 
      }
      var PIhalf = Math.PI / 2;
      var cornerOffset = new THREE.Vector3( edgeHalfWidth , edgeHalfHeight , edgeHalfDepth );
      for ( var y = 0; y <= radiusSegments; y ++ ) {
        var v = y / radiusSegments;
        var va = v * PIhalf; 
        var cosVa = Math.cos( va );
        var sinVa = Math.sin( va );
        if( y == radiusSegments ){
          vertex.set( 0 , 1 , 0 );
          var vert = vertex.clone().multiplyScalar( radius ).add( cornerOffset );
          cornerVerts[0].push( vert );
          vertexPool.push( vert );
          var norm = vertex.clone();
          cornerNormals[0].push( norm );
          normalPool.push( norm );
          continue;
        }   
        for ( var x = 0; x <= radiusSegments; x ++ ) {
          var u = x / radiusSegments;
          var ha = u * PIhalf;
          vertex.x = cosVa * Math.cos( ha );
          vertex.y = sinVa;
          vertex.z = cosVa * Math.sin( ha );
          var vert = vertex.clone().multiplyScalar( radius ).add( cornerOffset );
          cornerVerts[0].push( vert );
          vertexPool.push( vert );
          var norm = vertex.clone().normalize();
          cornerNormals[0].push( norm );
          normalPool.push( norm );
        }
      }
      for ( var i = 1 ; i < 8 ; i ++ ){
        for( var j = 0 ; j < cornerVerts[0].length ; j ++ ){
          var vert = cornerVerts[0][j].clone().multiply( cornerLayout[i] );
          cornerVerts[i].push( vert );
          vertexPool.push( vert );
          var norm = cornerNormals[0][j].clone().multiply( cornerLayout[i] );
          cornerNormals[i].push( norm );
          normalPool.push( norm );
        }
      } 
    }
    function doCorners(){
      var indexInd = 0;
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
      for ( var i = 0 ; i < 8 ; i ++ ){
        var cornerOffset = cornerVertNumber * i;
        for ( var v = 0 ; v < radiusSegments - 1 ; v ++ ){
          var r1 = v * rs1;     //row offset
          var r2 = (v + 1) * rs1; //next row
          for ( var u = 0 ; u < radiusSegments ; u ++ ){
            var u1 = u + 1;
            var a = cornerOffset + r1 + u;
            var b = cornerOffset + r1 + u1;
            var c = cornerOffset + r2 + u;
            var d = cornerOffset + r2 + u1;
            if( !flips[i] ){
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
        for ( var u = 0 ; u < radiusSegments ; u ++ ){
          var a = cornerOffset + lastRowOffset + u;
          var b = cornerOffset + lastRowOffset + u + 1;
          var c = cornerOffset + lastVertex;
          if( !flips[i] ){
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
    function doFaces(){
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
      //bottom
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
      //left 
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
      //right 
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
      //front 
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
      //back 
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
    function doHeightEdges(){
      for ( var i = 0 ; i < 4 ; i ++ ){
        var cOffset = i * cornerVertNumber;
        var cRowOffset = 4 * cornerVertNumber + cOffset;
        var needsFlip = i & 1 === 1;
        for ( var u = 0 ; u < radiusSegments ; u ++ ){
          var u1 = u + 1;
          var a = cOffset + u;
          var b = cOffset + u1;
          var c = cRowOffset + u;
          var d = cRowOffset + u1;
          if( !needsFlip ){
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
    function doDepthEdges(){
      var cStarts = [ 0 , 2 , 4 , 6 ];
      var cEnds =   [ 1 , 3 , 5 , 7 ];
      for ( var i = 0 ; i < 4 ; i ++ ){
        var cStart = cornerVertNumber * cStarts[ i ];
        var cEnd =   cornerVertNumber * cEnds[ i ];
        var needsFlip = 1 >= i;
        for ( var u = 0 ; u < radiusSegments ; u ++ ){
          var urs1 =  u * rs1;
          var u1rs1 = (u+1) * rs1;
          var a = cStart + urs1;
          var b = cStart + u1rs1;
          var c = cEnd + urs1;
          var d = cEnd + u1rs1
          if( needsFlip ){
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
    function doWidthEdges(){
      var end = radiusSegments - 1;
      var cStarts = [ 0 , 1 , 4 , 5 ];
      var cEnds =   [ 3 , 2 , 7 , 6 ];
      var needsFlip = [0,1,1,0];
      for ( var i = 0 ; i < 4 ; i ++ ){
        var cStart = cStarts[i] * cornerVertNumber;
        var cEnd = cEnds[i] * cornerVertNumber;
        
        for ( var u = 0 ; u <= end ; u ++ ){
          // var dInd = u != end ? radiusSegments + u * rs1 : cornerVertNumber - 1;
          var a = cStart + radiusSegments + u * rs1;
          var b = cStart + (u != end ? radiusSegments + (u + 1) * rs1 : cornerVertNumber - 1);
          var c = cEnd + radiusSegments + u * rs1;
          var d = cEnd + (u != end ? radiusSegments + (u + 1) * rs1 : cornerVertNumber - 1);
          if( !needsFlip[i] ){
            indices.push( a );
            indices.push( b );
            indices.push( c );
            indices.push( b );
            indices.push( d );
            indices.push( c );
          } 
          else {
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
    for ( var i = 0 ; i < vertexPool.length ; i ++ ){
      positions.setXYZ( 
        index , 
        vertexPool[i].x , 
        vertexPool[i].y , 
        vertexPool[i].z 
      );
      normals.setXYZ( 
        index , 
        normalPool[i].x , 
        normalPool[i].y , 
        normalPool[i].z 
      );
      index++;
    }
    this.setIndex( new THREE.BufferAttribute( new Uint16Array( indices ) , 1 ) );
    this.addAttribute( 'position', positions );
    this.addAttribute( 'normal', normals );
  };
  RoundedBoxGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
  RoundedBoxGeometry.constructor = RoundedBoxGeometry;
  window.RoundedBoxGeometry = RoundedBoxGeometry;
})();

;(function(){
  var RoundedPlaneShape = function( x, y, width, height, radius ) {
    var shape = new THREE.Shape();
    shape.moveTo( x, y + radius );
    shape.lineTo( x, y + height - radius );
    shape.quadraticCurveTo( x, y + height, x + radius, y + height );
    shape.lineTo( x + width - radius, y + height );
    shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
    shape.lineTo( x + width, y + radius );
    shape.quadraticCurveTo( x + width, y, x + width - radius, y );
    shape.lineTo( x + radius, y );
    shape.quadraticCurveTo( x, y, x, y + radius );
    return shape;
  };

  this.RoundedPlaneGeometry = function( x, y, width, height, radius, depth ) {
    var shape = RoundedPlaneShape( x, y, width, height, radius );
    var geometry = new THREE.ExtrudeBufferGeometry( shape, { depth: depth, bevelEnabled: false, curveSegments: 3 } );
    return geometry;
  }
})();

//@prepros-prepend js/RoundedBoxGeometry.js
//@prepros-prepend js/RoundedPlaneGeometry.js

;(function() {
  'use strict';

  window.RUBIK = {};

  /* ----- CUBE ----- */

  RUBIK.Cube = function( size, colors ) {
    var _this = this;

    size   = ( typeof size !== 'undefined') ? size : 3;
    colors = ( typeof colors !== 'undefined') ? colors : {
      right:  0x41aac8, // blue
      left:   0x82ca38, // green
      top:    0xfff7ff, // white
      bottom: 0xffef48, // yellow
      front:  0xef3923, // red
      back:   0xff8c0a, // orange
      piece:  0x08101a, // black
    };

    var object = new THREE.Object3D();
    var geometry = new RUBIK.Geometry( size, colors );

    var positions = [];
    var origin = [];

    for ( var i = 0; i < geometry.pieces.length; i++ ) {
      object.add( geometry.pieces[i] );
      origin.push( geometry.pieces[i] );
      positions.push( geometry.pieces[i].position.clone().multiplyScalar( size ).round() );
    }

    var rotation = new THREE.Object3D();
    object.add( rotation );

    var layers = { a: [], x: [], y: [], z: [] };

    for ( var i = 0, piecesPerFace = size * size; i < size; i++ ) {
      layers.y[i] = [];
      layers.x[i] = [];    
      layers.z[i] = [];
      for ( var j = 0; j < piecesPerFace; j++ ) {
        layers.a.push( j + i * piecesPerFace );
        layers.y[i].push( j + piecesPerFace * i );
        layers.z[i].push( j * 3 + i );
        layers.x[i].push( Math.floor( j / size ) * piecesPerFace + i * size + j % size );
      }
    }

    _this.layers    = layers;
    _this.colors    = colors;
    _this.object    = object;
    _this.size      = size;
    _this.pieces    = geometry.pieces;
    _this.edges     = geometry.edges;
    _this.origin    = origin;
    _this.positions = positions;
    _this.rotation  = rotation;
  };

  RUBIK.Cube.prototype.scramble = function( times ) {
    if ( this.controls.scrambling.active || this.controls.drag.rotation != null ) return;

    this.controls.scrambling.steps = times;
    RUBIK.Utils.scrambleRandomLayer( cube );
  }

  // RUBIK.Cube.prototype.scale = function( scale ) {
  //   this.object.scale.set( scale, scale, scale )
  // }

  /* ----- GEOMETRY ----- */

  RUBIK.Geometry = function( size, colors ) {
    var pieces = [];
    var edges  = [];

    var edgeScale = 0.85;
    var pieceSize = 1 / size;

    var pieceMesh = new THREE.Mesh(
      new RoundedBoxGeometry( pieceSize, pieceSize, pieceSize, pieceSize * (1 - edgeScale) / 1.5, 3 ),
      new THREE.MeshBasicMaterial({ color: colors.piece })
    );

    var helper = new THREE.Mesh(
      new THREE.PlaneGeometry( pieceSize, pieceSize, pieceSize ),
      new THREE.MeshBasicMaterial({ depthWrite: false, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );

    var edgeGeometry = RoundedPlaneGeometry( -pieceSize/2, -pieceSize/2, pieceSize, pieceSize, pieceSize * (1 - edgeScale), 0.0125 );
    var edgeMaterial = new THREE.MeshLambertMaterial({ color: colors.piece, side: THREE.FrontSide });

    for ( var xx = 0, place = 0; xx < size; xx++ ) {
      var x = -0.5 + pieceSize / 2 + pieceSize * xx;
      for ( var yy = 0; yy < size; yy++ ) {
        var y = -0.5 + pieceSize / 2 + pieceSize * yy;
        for ( var zz = 0; zz < size; zz++ ) {
          var z = -0.5 + pieceSize / 2 + pieceSize * zz;

          var piece = new THREE.Object3D();
          var pieceCube = pieceMesh.clone();

          piece.position.set(
            RUBIK.Utils.roundNumber( x, 4 ),
            RUBIK.Utils.roundNumber( y, 4 ),
            RUBIK.Utils.roundNumber( z, 4 )
          );
          piece.add( pieceCube );

          piece.place = place;
          place++;

          if ( xx == 0 || xx == size - 1 ) {
            var edge = createEdge( ( xx == 0 ) ? 0 : 1 ); // 0 - left, 1 - right
            piece.add( edge[0], edge[1] );
          }
          if ( yy == 0 || yy == size - 1 ) {
            var edge = createEdge( ( yy == 0 ) ? 2 : 3 ); // 2 - bottom, 3 - top
            piece.add( edge[0], edge[1] );
          }
          if ( zz == 0 || zz == size - 1 ) {
            var edge = createEdge( ( zz == 0 ) ? 4 : 5 ); // 4 - back, 5 - front
            piece.add( edge[0], edge[1] );
          }

          pieces.push( piece );
        }
      }
    }

    function createEdge( position ) {
      var edge = new THREE.Mesh(
        edgeGeometry,
        edgeMaterial.clone(),
      );
      var distance = pieceSize / 2;

      edge.position.set(
        distance * [ -1, 1, 0, 0, 0, 0 ][position],
        distance * [ 0, 0, -1, 1, 0, 0 ][position],
        distance * [ 0, 0, 0, 0, -1, 1 ][position]
      );

      edge.rotation.set(
        Math.PI/2 * [ 0, 0, 1, -1, 0, 0 ][position],
        Math.PI/2 * [ -1, 1, 0, 0, 2, 0 ][position],
        0
      );

      edge.material.color.setHex( colors[['left', 'right', 'bottom', 'top', 'back', 'front'][position]] ); 
      edge.scale.set( edgeScale, edgeScale, edgeScale );

      var edgeHelper = helper.clone();
      edgeHelper.position.copy(edge.position);
      edgeHelper.rotation.copy(edge.rotation);
      edges.push( edgeHelper );

      return [ edge, edgeHelper ];
    }

    this.pieces = pieces;
    this.edges  = edges;
  };

  /* ----- SCENE ----- */

  RUBIK.Scene = function( container, cube ) {
    var _this = this;

    var width  = _this.width  = container.offsetWidth;
    var height = _this.height = container.offsetHeight;
    var dpi    = _this.dpi    = window.devicePixelRatio;

    var scene = new THREE.Scene();
    scene.add( cube.object );

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize( width, height );
    renderer.setPixelRatio( dpi )
    container.appendChild( renderer.domElement );

    var camera = new THREE.PerspectiveCamera( 2, width / height, 0.1, 1000 );
    camera.position.set( 45, 45, 45 );
    camera.zoom = 0.8;
    camera.updateProjectionMatrix();
    camera.lookAt( new THREE.Vector3() );

    window.addEventListener( 'resize', function() {
      var width  = _this.width  = container.offsetWidth;
      var height = _this.height = container.offsetHeight;
      camera.aspect = width / height;
      renderer.setSize( width, height );
      renderer.setPixelRatio( dpi )
    }, false );

    // s:hadow

    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry( 2, 2, 2 ),
      new THREE.MeshBasicMaterial({
        depthWrite: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.33,
        map: new THREE.TextureLoader().load( 'data:image/png;base64,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' )
      })
    );
    shadow.rotation.x = Math.PI / 2;
    shadow.position.y = -1;
    scene.add( shadow );

    // e:hadow

    // s:lights

     var directionalLight1 = new THREE.DirectionalLight( 0xffffff, 0.15 );
    directionalLight1.position.set( 0, 2, 2 );
    directionalLight1.lookAt( new THREE.Vector3() );
    scene.add( directionalLight1 );

    var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.15 );
    directionalLight2.position.set( 2, 2, 0 );
    directionalLight2.lookAt( new THREE.Vector3() );
    scene.add( directionalLight2 );

    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.725 );
    scene.add( ambientLight );

    // e:lights

    _this.animate   = function() {};
    _this.scene     = scene;
    _this.camera    = camera;
    _this.container = container;
    _this.shadow    = shadow;

    cube.scene = _this;

    // var stats = new Stats();
    // stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild( stats.dom );

    function animate() {
      _this.animate()
      renderer.render( scene, camera );
      // stats.end();
      requestAnimationFrame( animate );
    }
    animate();
  };

  /* ----- CONTROLS ----- */

  RUBIK.Controls = function( cube, scene, options ) {
    var _this = this;

    var raycaster = new THREE.Raycaster();
    var group = new THREE.Object3D();
    var rotation = new THREE.Vector3();

    options = RUBIK.Utils.extend(( typeof options === 'undefined' ) ? {} : options, {
      bounce: 1,
    });

    var helper = new THREE.Mesh(
      new THREE.PlaneGeometry( 2, 2, 2 ),
      new THREE.MeshBasicMaterial({ depthWrite: false, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    helper.position.set( 0, 0, 0 )

    scene.scene.add( helper );
    cube.object.add( group );

    var intersect = {
      point : null,
      edge  : null,
      piece : null,
      start : null,
    };

    var drag = {
      disabled  : true,
      start     : new THREE.Vector2(),
      current   : new THREE.Vector2(),
      delta     : new THREE.Vector2(),
      active    : false,
      animation : false,
      layer     : null,
      touch     : null,
      direction : null,
      rotation  : null,
      startRotation   : new THREE.Vector3(),
      deltaAngle      : new THREE.Vector3(),
    };

    var animation = {
      drag: null,
      bounce: null,
    }

    var scrambling = {
      active: false,
      steps: 0,
      last: null,
    }

    window.addEventListener( 'mousemove', onMouseMove, { passive: false });
    window.addEventListener( 'mousedown', onMouseDown, { passive: false });
    window.addEventListener( 'mouseup', onMouseUp, { passive: false });

    document.addEventListener( 'touchmove', onMouseMove, { passive: false });
    document.addEventListener( 'touchstart', onMouseDown, { passive: false });
    document.addEventListener( 'touchend', onMouseUp, { passive: false });

    _this.cube       = cube;
    _this.intersect  = intersect;
    _this.drag       = drag;
    _this.scrambling = scrambling;
    _this.group      = group;
    _this.rotation   = rotation;
    _this.animation  = animation;
    _this.options    = options;

    cube.controls    = _this;

    function onMouseDown( event ) {
      if ( drag.active || drag.rotation != null || scrambling.active || drag.disabled ) return;

      var position = RUBIK.Utils.getMousePosition( event, scene );
      drag.current.copy( position );
      drag.start.copy( position );
      drag.type = null;

      var intersects = RUBIK.Utils.getIntersect( raycaster, drag.current, scene, cube.edges, true );

      if ( intersects.length > 0 ) {
        intersect.point = intersects[0].point;
        intersect.piece = intersects[0].object.parent;
        intersect.edge  = intersects[0].object;

        intersect.start = intersect.point.clone();
        drag.direction = RUBIK.Utils.roundVectorDirection( intersects[0].point );
        helper.position.set( intersect.point.x, intersect.point.y, intersect.point.z );
        helper.rotation.set( drag.direction.y * Math.PI/2, drag.direction.x * Math.PI/2, drag.direction.z * Math.PI/2 );

        drag.type = 'layer';
      } else {
        drag.type = 'cube';
      }

      drag.touch = ( event.type == 'touchstart');
      drag.rotation = null;
      drag.active = true;
    }

    function onMouseMove( event ) {
      event.preventDefault();
      if ( !drag.active ) return;

      var position = RUBIK.Utils.getMousePosition( event, scene );
      drag.current.copy( position );
      drag.delta.set( drag.current.x - drag.start.x, -( drag.current.y - drag.start.y ) );

      if ( drag.rotation == null && drag.delta.length() > 10 ) {
        if ( drag.type == 'layer' ) {
          var pieceIndex = cube.pieces.indexOf( intersect.piece );
          var intersectHelper = RUBIK.Utils.getIntersect( raycaster, drag.current, scene, helper, false )[0].point;

          var normalX = ( drag.direction.x == 1 ) ? 'z' : 'x';
          var normalY = ( drag.direction.y == 1 ) ? 'z' : 'y';

          var vs = new THREE.Vector2( intersect.start[normalX] * 1, intersect.start[normalY] * 1 );
          var ve = new THREE.Vector2( intersectHelper[normalX] * 1, intersectHelper[normalY] * 1 );
          var angle = Math.round( ve.sub( vs ).angle()/( Math.PI/2 )) * ( Math.PI/2 ) / ( Math.PI*2 );

          var layer = ( angle == 0.25 || angle == 0.75 )
            ? (( drag.direction.x == 1 ) ? 'z' : 'y')
            : (( drag.direction.y == 1 ) ? 'z' : 'x');

          for ( var key in cube.layers[layer] ) {
            if ( cube.layers[layer].hasOwnProperty( key ) ) {
              if ( cube.layers[layer][key].indexOf( pieceIndex ) > -1 ) {
                drag.layer = cube.layers[layer][key];
                RUBIK.Utils.selectLayer( cube, drag.layer );
                drag.rotation = layer;
              }
            }
          }
        } else if ( drag.type == 'cube' ) {
          var angle = RUBIK.Utils.closestAngle( drag.delta.angle(), false ) / ( Math.PI*2 );
          drag.rotation = ( angle == 0.25 || angle == 0.75 )
            ? (( drag.start.x > scene.width * 0.5 ) ? 'z' : 'y')
            : 'x';
          drag.layer = cube.layers.a;
          RUBIK.Utils.selectLayer( cube, drag.layer );
        }
      } else if ( drag.rotation != null ) {
        var groupAxis = { x: 'y', y: 'x', z: 'z' }[drag.rotation];
        var mouseAxis = { x: 'x', y: 'y', z: 'y' }[drag.rotation];
        group.rotation[groupAxis] = drag.delta[mouseAxis] / 100 * ((drag.rotation == 'y') ? -1 : 1);

        drag.deltaAngle = group.rotation.toVector3().sub( drag.startRotation );
        if ( Math.abs(drag.deltaAngle[groupAxis]) > Math.PI / 4 ) {
          onMouseUp();
        }
      } else {
        // mouse hover events
      }
    }

    function onMouseUp( event ) {
      if ( !drag.active ) return;
      drag.active = false;

      RUBIK.Utils.animateLayerRotation( cube, drag.layer, drag.deltaAngle, 0.25 );
    }

    scene.animate = function() {
      if (startTime == null) return;

      var millis = new Date(Date.now() - startTime);
      var minutes = Math.floor(millis / 60000);
      var seconds = Math.round((millis % 60000) / 1000);
      timer.innerHTML = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }
  }

  /* ----- UTILITIES ----- */

  RUBIK.Utils = {

    vector3: new THREE.Vector3(),

    roundNumber: function( num, scale ) {
      scale = Math.pow( 10, scale );
      return Math.round( num * scale ) / scale;
    },

    randomObjectKey: function( object ) {
      var result;
      var count = 0;
      for ( var key in object )
        if ( Math.random() < 1/++count )
          result = key;
      return result;
    },

    randomArrayValue: function( array ) {
      return array[Math.floor(Math.random() * array.length)];
    },

    isNumeric: function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },

    d2r: function(a) {
      return a * 180 / Math.PI;
    },

    r2d: function(a) {
      return a * Math.PI / 180;
    },

    closestAngle: function( angle, minimum ) {
      if ( angle == 0 ) return 0;
      var round = Math.PI * 0.5;
      if ( this.isNumeric( minimum ) ) {
        var small = Math.abs( angle ) < Math.PI/2 * minimum;
        var output = 0;
        if ( small ) return 0;
        if ( Math.abs( angle ) < round ) return Math.sign( angle ) * round;
        return Math.round( angle / round ) * round;
      } else {
        return Math.round( angle / round ) * round;
      }
    },

    roundVectorNumber: function( vector, scale ) {
      vector.set(
        this.roundNumber( vector.x, scale ),
        this.roundNumber( vector.y, scale ),
        this.roundNumber( vector.z, scale )
      );
      return vector;
    },

    closestVectorAngle: function( vector, minimum ) {
      vector.set(
        this.closestAngle( vector.x, minimum ),
        this.closestAngle( vector.y, minimum ),
        this.closestAngle( vector.z, minimum )
      );
      return vector;
    },

    getMousePosition: function( event, scene ) {
      event = event.changedTouches ? event.changedTouches[0] : event;
      var position = new THREE.Vector2().set( event.pageX, event.pageY );
      var rect = this.getOffset( scene.container );
      return position.sub( rect );
    },
    
    getOffset: function( element ) {
      var offset = element.getBoundingClientRect();
      return new THREE.Vector2().set( offset.left, offset.top );
    },

    getIntersect: function( raycaster, mouse, scene, object, multiple ) {
      var dragCoords = new THREE.Vector2().set(
        ( mouse.x / scene.width ) * 2 - 1,
        ( mouse.y / scene.height ) * - 2 + 1
      );
      raycaster.setFromCamera( dragCoords, scene.camera )
      return ( multiple )
        ? raycaster.intersectObjects( object )
        : raycaster.intersectObject( object );
    },

    roundVectorDirection: function( vector, sign ) {
      var output = new THREE.Vector3(), max;
      var sign = (typeof sign === 'undefined') ? false : sign;
      max = ( Math.abs( vector.x ) > Math.abs( vector.y ) ) ? 'x' : 'y';
      max = ( Math.abs( vector.z ) > Math.abs( vector[max] ) ) ? 'z' : max;
      output[max] = 1 * Math.sign( vector[max] );
      return output;
    },

    checkIsSolved: function( current, origin ) {
      for ( var i = 0; i < current.length; i++)
        if ( current[i] != origin[i] ) return false;
      return true;
    },

    detachPieceFromGroup: function( cube, piece ) {
      cube.pieces[piece].applyMatrix( cube.controls.group.matrixWorld );
      cube.controls.group.remove( cube.pieces[piece] );
      cube.object.add( cube.pieces[piece] );
    },

    attachPieceToGroup: function( cube, piece ) {
      cube.pieces[piece].applyMatrix(
        new THREE.Matrix4().getInverse( cube.controls.group.matrixWorld )
      );
      cube.object.remove( cube.pieces[piece] );
      cube.controls.group.add( cube.pieces[piece] );
    },

    selectLayer: function( cube, layer ) {
      cube.controls.group.rotation.set( 0, 0, 0 );
      cube.controls.group.updateMatrixWorld();
      for ( var i = 0; i < layer.length; i++ )
        RUBIK.Utils.attachPieceToGroup( cube, layer[i] );
    },

    deselectLayer: function( cube, layer, ) {
      cube.controls.group.updateMatrixWorld();
      for ( var i = 0; i < layer.length; i++)
        this.detachPieceFromGroup( cube, layer[i] );
      for ( var i = 0; i < cube.pieces.length; i++ ) {
        cube.pieces[i].position.multiplyScalar( cube.size ).round().divideScalar( cube.size );
        this.closestVectorAngle( cube.pieces[i].rotation, false );
      }
      cube.pieces = this.rearrangePieces( cube, layer );
    },

    rearrangePieces: function( cube, layer ) {
      var newPositions = [];
      var newPieces = [];
      for ( var i = 0; i < cube.pieces.length; i++ )
        newPositions.push( cube.pieces[i].position.clone().multiplyScalar( cube.size ).round().toArray().toString() );
      for ( var i = 0; i < cube.pieces.length; i++ ) {
        var index = newPositions.indexOf( cube.positions[i].toArray().toString() );
        newPieces[i] = cube.pieces[index];
      }
      return newPieces;
    },

    scrambleRandomLayer: function( cube ) {
      var axis = this.randomArrayValue(['x', 'y', 'z']);
      var row = Math.floor(Math.random() * cube.size);
      var direction = (Math.random() > 0.5) ? 1 : -1;
      if ( cube.controls.scrambling.last == [ axis, row, direction * -1 ].toString() ) {
        this.scrambleRandomLayer( cube );
      } else {
        cube.controls.scrambling.last = [ axis, row, direction ].toString();
        cube.controls.drag.layer = cube.layers[axis][row];
        cube.controls.scrambling.active = true;
        this.selectLayer( cube, cube.controls.drag.layer );
        var newAngle = cube.controls.group.rotation.clone();
        newAngle[{ x: 'y', y: 'x', z : 'z' }[axis]] += Math.PI / 2 * direction;
        this.animateLayerRotation( cube, cube.controls.drag.layer, newAngle, 0.15 );
      }
    },

    extend: function( options, defaults ) {
      var extended = {}, prop;
      for (prop in options)
        if (Object.prototype.hasOwnProperty.call(options, prop))
          extended[prop] = options[prop];
      for (prop in defaults)
        if (Object.prototype.hasOwnProperty.call(defaults, prop))
          extended[prop] = defaults[prop];
      return extended;
    },

    animateLayerRotation: function( cube, layer, angle, speed ) {
      if ( layer == null ) return;

      this.closestVectorAngle( angle, 0.15 );

      TweenMax.to( cube.controls.group.rotation, speed, {
        x: angle.x,
        y: angle.y,
        z: angle.z,
        ease: Elastic.easeOut.config(1.25, 1),
        onComplete: function() {
          angle.set( 0, 0, 0 );
          RUBIK.Utils.deselectLayer( cube, layer );
          cube.controls.drag.rotation = null;
          cube.controls.drag.layer = null;

          var scrambling = cube.controls.scrambling;
          if ( scrambling.active ) {
            scrambling.steps--;
            if ( scrambling.steps > 0 ) {
              RUBIK.Utils.scrambleRandomLayer( cube );
            } else {
              scrambling.active = false;
              timer.classList.add('is-active');
              startTime = Date.now();
            }
          }
        },
      });

      if (cube.controls.options.bounce !== null && cube.controls.drag.layer.toString() != cube.layers.a.toString()) {
        var bounce = RUBIK.Utils
          .roundVectorDirection( angle, true )
          .multiplyScalar( Math.PI/90 )
          .multiplyScalar( 0.5 * ((speed == 0.15) ? 0.25 : 1) );

        TweenMax.fromTo( cube.object.rotation, speed,
          { x: bounce.x, y: bounce.y, z: bounce.z },
          { x: 0, y: 0, z: 0, ease: Elastic.easeOut.config(1.25, 0.75) });
      }
    },

  };

})();

var container = document.getElementById('game-size');
var cube     = new RUBIK.Cube( 3 );
var scene    = new RUBIK.Scene( container, cube );
var controls = new RUBIK.Controls( cube, scene );

var floating = {
  cube: TweenMax.fromTo( cube.object.position, 1.5,
    { y: -0.1 },
    { y: 0.1, repeat: -1, yoyo: true, ease: Sine.easeInOut }
  ),
  shadow: TweenMax.fromTo( scene.shadow.material, 1.5,
    { opacity: 0.5 },
    { opacity: 0.3, repeat: -1, yoyo: true, ease: Sine.easeInOut }
  ),
};

var start = document.querySelector('#start');
var timer = document.querySelector('#timer');
var title = document.querySelector('#title');
var startTime = null;

start.onclick = function(e) {
  floating.cube.kill();
  floating.shadow.kill();

  TweenMax.to( cube.object.position, 0.4, { y: 0, ease: Sine.easeInOut } );
  TweenMax.to( scene.shadow.material, 0.4, { opacity: 0.4, ease: Sine.easeInOut } );
  TweenMax.to( scene.camera, 0.4, { zoom: 1, ease: Sine.easeInOut, onUpdate: function() {
    scene.camera.updateProjectionMatrix();
  }, onComplete: function() {
    controls.drag.disabled = false;
    cube.scramble(15);
  } } );

  title.classList.add('is-hidden');
  start.classList.add('is-hidden');
}

