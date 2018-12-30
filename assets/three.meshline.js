(function() {

    // Module code from underscore.js

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this;

    var Maf = function(obj) {
        if (obj instanceof Maf ) return obj;
        if (!(this instanceof Maf )) return new Maf(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for their old module API. If we're in
    // the browser, add `Maf` as a global object.
    // (`nodeType` is checked to ensure that `module`
    // and `exports` are not HTML elements.)
    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
        exports = module.exports = Maf;
        }
        exports.Maf = Maf;
    } else {
        root.Maf = Maf;
    }

    // Current version.
    Maf.VERSION = '1.0.0';

    Maf.PI = Math.PI;

    // https://www.opengl.org/sdk/docs/man/html/clamp.xhtml

    Maf.clamp = function( v, minVal, maxVal ) {
        return Math.min( maxVal, Math.max( minVal, v ) );
    };

    // https://www.opengl.org/sdk/docs/man/html/step.xhtml

    Maf.step = function( edge, v ) {
        return ( v < edge ) ? 0 : 1;
    }

    // https://www.opengl.org/sdk/docs/man/html/smoothstep.xhtml

    Maf.smoothStep = function ( edge0, edge1, v ) {
        var t = Maf.clamp( ( v - edge0 ) / ( edge1 - edge0 ), 0.0, 1.0 );
        return t * t * ( 3.0 - 2.0 * t );
    };

    // http://docs.unity3d.com/ScriptReference/Mathf.html
    // http://www.shaderific.com/glsl-functions/
    // https://www.opengl.org/sdk/docs/man4/html/
    // https://msdn.microsoft.com/en-us/library/windows/desktop/ff471376(v=vs.85).aspx
    // http://moutjs.com/docs/v0.11/math.html#map
    // https://code.google.com/p/kuda/source/browse/public/js/hemi/utils/mathUtils.js?r=8d581c02651077c4ac3f5fc4725323210b6b13cc

    // Converts from degrees to radians.
    Maf.deg2Rad = function( degrees ) {
      return degrees * Math.PI / 180;
    };
    
    Maf.toRadians = Maf.deg2Rad;

    // Converts from radians to degrees.
    Maf.rad2Deg = function(radians) {
      return radians * 180 / Math.PI;
    };

    Maf.toDegrees = Maf.rad2Deg;

    Maf.clamp01 = function( v ) {
        return Maf.clamp( v, 0, 1 );
    };

    // https://www.opengl.org/sdk/docs/man/html/mix.xhtml

    Maf.mix = function( x, y, a ) {
        if( a <= 0 ) return x;
        if( a >= 1 ) return y;
        return x + a * (y - x)
    };

    Maf.lerp = Maf.mix;

    Maf.inverseMix = function( a, b, v ) {
        return ( v - a ) / ( b - a );
    };

    Maf.inverseLerp = Maf.inverseMix;

    Maf.mixUnclamped = function( x, y, a ) {
        if( a <= 0 ) return x;
        if( a >= 1 ) return y;
        return x + a * (y - x)
    };

    Maf.lerpUnclamped = Maf.mixUnclamped;

    // https://www.opengl.org/sdk/docs/man/html/fract.xhtml

    Maf.fract = function( v ) {
        return v - Math.floor( v );
    };

    Maf.frac = Maf.fract;

    // http://stackoverflow.com/questions/4965301/finding-if-a-number-is-a-power-of-2

    Maf.isPowerOfTwo = function( v ) {
        return ( ( ( v - 1) & v ) == 0 );
    };

    // https://bocoup.com/weblog/find-the-closest-power-of-2-with-javascript

    Maf.closestPowerOfTwo = function( v ) {
        return Math.pow( 2, Math.round( Math.log( v ) / Math.log( 2 ) ) ); 
    };

    Maf.nextPowerOfTwo = function( v ) {
        return Math.pow( 2, Math.ceil( Math.log( v ) / Math.log( 2 ) ) );    
    }

    // http://stackoverflow.com/questions/1878907/the-smallest-difference-between-2-angles

    //function mod(a, n) { return a - Math.floor(a/n) * n; }
    Maf.mod = function(a, n) { return (a % n + n) % n; }

    Maf.deltaAngle = function( a, b ) {
        var d = Maf.mod( b - a, 360 );
        if( d > 180 ) d = Math.abs( d - 360 );
        return d;
    };

    Maf.deltaAngleDeg = Maf.deltaAngle;

    Maf.deltaAngleRad = function( a, b ) {
        return Maf.toRadians( Maf.deltaAngle( Maf.toDegrees( a ), Maf.toDegrees( b ) ) );
    };

    Maf.lerpAngle = function( a, b, t ) {
        var angle = Maf.deltaAngle( a, b );
        return Maf.mod( a + Maf.lerp( 0, angle, t ), 360 );
    };

    Maf.lerpAngleDeg = Maf.lerpAngle;

    Maf.lerpAngleRad = function( a, b, t ) {
        return Maf.toRadians( Maf.lerpAngleDeg( Maf.toDegrees( a ), Maf.toDegrees( b ), t ) );
    };

    // http://gamedev.stackexchange.com/questions/74324/gamma-space-and-linear-space-with-shader

    Maf.gammaToLinearSpace = function( v ) {
        return Math.pow( v, 2.2 );
    };

    Maf.linearToGammaSpace = function( v ) {
        return Math.pow( v, 1 / 2.2 );
    };

    Maf.map = function( from1, to1, from2, to2, v ) {
        return from2 + ( v - from1 ) * ( to2 - from2 ) / ( to1 - from1 );
    }

    Maf.scale = Maf.map;

    // http://www.iquilezles.org/www/articles/functions/functions.htm

    Maf.almostIdentity = function( x, m, n ) {
        
        if( x > m ) return x;

        var a = 2 * n - m;
        var b = 2 * m - 3 * n;
        var t = x / m;

        return ( a * t + b) * t * t + n;
    }

    Maf.impulse = function( k, x ) {
        var h = k * x;
        return h * Math.exp( 1 - h );
    };

    Maf.cubicPulse = function( c, w, x ) {
        x = Math.abs( x - c );
        if( x > w ) return 0;
        x /= w;
        return 1 - x * x * ( 3 - 2 * x );
    }

    Maf.expStep = function( x, k, n ) {
        return Math.exp( -k * Math.pow( x, n ) );
    }

    Maf.parabola = function( x, k ) {
        return Math.pow( 4 * x * ( 1 - x ), k );
    }

    Maf.powerCurve = function( x, a, b ) {
        var k = Math.pow( a + b, a + b ) / ( Math.pow( a, a ) * Math.pow( b, b ) );
        return k * Math.pow( x, a ) * Math.pow( 1 - x, b );
    }

    // http://iquilezles.org/www/articles/smin/smin.htm ?

    Maf.latLonToCartesian = function( lat, lon ) {

        lon += 180;
        lat = Maf.clamp( lat, -85, 85 );
        var phi = Maf.toRadians( 90 - lat );
        var theta = Maf.toRadians( 180 - lon );
        var x = Math.sin( phi ) * Math.cos( theta );
        var y = Math.cos( phi );
        var z = Math.sin( phi ) * Math.sin( theta );

        return { x: x, y: y, z: z }

    }

    Maf.cartesianToLatLon = function( x, y, z ) {
        var n = Math.sqrt( x * x + y * y + z * z );
        return{ lat: Math.asin( z / n ), lon: Math.atan2( y, x ) };
    }

    Maf.randomInRange = function( min, max ) {
        return min + Math.random() * ( max - min );
    }

    Maf.norm = function( v, minVal, maxVal ) {
        return ( v - minVal ) / ( maxVal - minVal );
    }

    Maf.hash = function( n ) {
        return Maf.fract( (1.0 + Math.cos(n)) * 415.92653);
    }

    Maf.noise2d = function( x, y ) {
        var xhash = Maf.hash( x * 37.0 );
        var yhash = Maf.hash( y * 57.0 );
        return Maf.fract( xhash + yhash );
    }

    // http://iquilezles.org/www/articles/smin/smin.htm

    Maf.smoothMin = function( a, b, k ) {
        var res = Math.exp( -k*a ) + Math.exp( -k*b );
        return - Math.log( res )/k;
    }

    Maf.smoothMax = function( a, b, k ){
        return Math.log( Math.exp(a) + Math.exp(b) )/k;
    }

    Maf.almost = function( a, b ) {
        return ( Math.abs( a - b ) < .0001 );
    }

}());

;(function() {

"use strict";

var root = this

var has_require = typeof require !== 'undefined'

var THREE = root.THREE || has_require && require('three')
if( !THREE )
  throw new Error( 'MeshLine requires three.js' )

function MeshLine() {

  this.positions = [];

  this.previous = [];
  this.next = [];
  this.side = [];
  this.width = [];
  this.indices_array = [];
  this.uvs = [];
  this.counters = [];
  this.geometry = new THREE.BufferGeometry();

  this.widthCallback = null;

}

MeshLine.prototype.setGeometry = function( g, c ) {

  this.widthCallback = c;

  this.positions = [];
  this.counters = [];

  if( g instanceof THREE.Geometry ) {
    for( var j = 0; j < g.vertices.length; j++ ) {
      var v = g.vertices[ j ];
      var c = j/g.vertices.length;
      this.positions.push( v.x, v.y, v.z );
      this.positions.push( v.x, v.y, v.z );
      this.counters.push(c);
      this.counters.push(c);
    }
  }

  if( g instanceof THREE.BufferGeometry ) {
    // read attribute positions ?
  }

  if( g instanceof Float32Array || g instanceof Array ) {
    for( var j = 0; j < g.length; j += 3 ) {
      var c = j/g.length;
      this.positions.push( g[ j ], g[ j + 1 ], g[ j + 2 ] );
      this.positions.push( g[ j ], g[ j + 1 ], g[ j + 2 ] );
      this.counters.push(c);
      this.counters.push(c);
    }
  }

  this.process();

}

MeshLine.prototype.compareV3 = function( a, b ) {

  var aa = a * 6;
  var ab = b * 6;
  return ( this.positions[ aa ] === this.positions[ ab ] ) && ( this.positions[ aa + 1 ] === this.positions[ ab + 1 ] ) && ( this.positions[ aa + 2 ] === this.positions[ ab + 2 ] );

}

MeshLine.prototype.copyV3 = function( a ) {

  var aa = a * 6;
  return [ this.positions[ aa ], this.positions[ aa + 1 ], this.positions[ aa + 2 ] ];

}

MeshLine.prototype.process = function() {

  var l = this.positions.length / 6;

  this.previous = [];
  this.next = [];
  this.side = [];
  this.width = [];
  this.indices_array = [];
  this.uvs = [];

  for( var j = 0; j < l; j++ ) {
    this.side.push( 1 );
    this.side.push( -1 );
  }

  var w;
  for( var j = 0; j < l; j++ ) {
    if( this.widthCallback ) w = this.widthCallback( j / ( l -1 ) );
    else w = 1;
    this.width.push( w );
    this.width.push( w );
  }

  for( var j = 0; j < l; j++ ) {
    this.uvs.push( j / ( l - 1 ), 0 );
    this.uvs.push( j / ( l - 1 ), 1 );
  }

  var v;

  if( this.compareV3( 0, l - 1 ) ){
    v = this.copyV3( l - 2 );
  } else {
    v = this.copyV3( 0 );
  }
  this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
  this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
  for( var j = 0; j < l - 1; j++ ) {
    v = this.copyV3( j );
    this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
  }

  for( var j = 1; j < l; j++ ) {
    v = this.copyV3( j );
    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
  }

  if( this.compareV3( l - 1, 0 ) ){
    v = this.copyV3( 1 );
  } else {
    v = this.copyV3( l - 1 );
  }
  this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
  this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );

  for( var j = 0; j < l - 1; j++ ) {
    var n = j * 2;
    this.indices_array.push( n, n + 1, n + 2 );
    this.indices_array.push( n + 2, n + 1, n + 3 );
  }

  if (!this.attributes) {
    this.attributes = {
      position: new THREE.BufferAttribute( new Float32Array( this.positions ), 3 ),
      previous: new THREE.BufferAttribute( new Float32Array( this.previous ), 3 ),
      next: new THREE.BufferAttribute( new Float32Array( this.next ), 3 ),
      side: new THREE.BufferAttribute( new Float32Array( this.side ), 1 ),
      width: new THREE.BufferAttribute( new Float32Array( this.width ), 1 ),
      uv: new THREE.BufferAttribute( new Float32Array( this.uvs ), 2 ),
      index: new THREE.BufferAttribute( new Uint16Array( this.indices_array ), 1 ),
      counters: new THREE.BufferAttribute( new Float32Array( this.counters ), 1 )
    }
  } else {
    this.attributes.position.copyArray(new Float32Array(this.positions));
    this.attributes.position.needsUpdate = true;
    this.attributes.previous.copyArray(new Float32Array(this.previous));
    this.attributes.previous.needsUpdate = true;
    this.attributes.next.copyArray(new Float32Array(this.next));
    this.attributes.next.needsUpdate = true;
    this.attributes.side.copyArray(new Float32Array(this.side));
    this.attributes.side.needsUpdate = true;
    this.attributes.width.copyArray(new Float32Array(this.width));
    this.attributes.width.needsUpdate = true;
    this.attributes.uv.copyArray(new Float32Array(this.uvs));
    this.attributes.uv.needsUpdate = true;
    this.attributes.index.copyArray(new Uint16Array(this.indices_array));
    this.attributes.index.needsUpdate = true;
    }

  this.geometry.addAttribute( 'position', this.attributes.position );
  this.geometry.addAttribute( 'previous', this.attributes.previous );
  this.geometry.addAttribute( 'next', this.attributes.next );
  this.geometry.addAttribute( 'side', this.attributes.side );
  this.geometry.addAttribute( 'width', this.attributes.width );
  this.geometry.addAttribute( 'uv', this.attributes.uv );
  this.geometry.addAttribute( 'counters', this.attributes.counters );

  this.geometry.setIndex( this.attributes.index );

}

function memcpy (src, srcOffset, dst, dstOffset, length) {
  var i

  src = src.subarray || src.slice ? src : src.buffer
  dst = dst.subarray || dst.slice ? dst : dst.buffer

  src = srcOffset ? src.subarray ?
  src.subarray(srcOffset, length && srcOffset + length) :
  src.slice(srcOffset, length && srcOffset + length) : src

  if (dst.set) {
    dst.set(src, dstOffset)
  } else {
    for (i=0; i<src.length; i++) {
      dst[i + dstOffset] = src[i]
    }
  }

  return dst
}

/**
 * Fast method to advance the line by one position.  The oldest position is removed.
 * @param position
 */
MeshLine.prototype.advance = function(position) {

  var positions = this.attributes.position.array;
  var previous = this.attributes.previous.array;
  var next = this.attributes.next.array;
  var l = positions.length;

  // PREVIOUS
  memcpy( positions, 0, previous, 0, l );

  // POSITIONS
  memcpy( positions, 6, positions, 0, l - 6 );

  positions[l - 6] = position.x;
  positions[l - 5] = position.y;
  positions[l - 4] = position.z;
  positions[l - 3] = position.x;
  positions[l - 2] = position.y;
  positions[l - 1] = position.z;

    // NEXT
  memcpy( positions, 6, next, 0, l - 6 );

  next[l - 6]  = position.x;
  next[l - 5]  = position.y;
  next[l - 4]  = position.z;
  next[l - 3]  = position.x;
  next[l - 2]  = position.y;
  next[l - 1]  = position.z;

  this.attributes.position.needsUpdate = true;
  this.attributes.previous.needsUpdate = true;
  this.attributes.next.needsUpdate = true;

};

function MeshLineMaterial( parameters ) {

  var vertexShaderSource = [
'precision highp float;',
'',
'attribute vec3 position;',
'attribute vec3 previous;',
'attribute vec3 next;',
'attribute float side;',
'attribute float width;',
'attribute vec2 uv;',
'attribute float counters;',
'',
'uniform mat4 projectionMatrix;',
'uniform mat4 modelViewMatrix;',
'uniform vec2 resolution;',
'uniform float lineWidth;',
'uniform vec3 color;',
'uniform float opacity;',
'uniform float near;',
'uniform float far;',
'uniform float sizeAttenuation;',
'',
'varying vec2 vUV;',
'varying vec4 vColor;',
'varying float vCounters;',
'',
'vec2 fix( vec4 i, float aspect ) {',
'',
'    vec2 res = i.xy / i.w;',
'    res.x *= aspect;',
'  vCounters = counters;',
'    return res;',
'',
'}',
'',
'void main() {',
'',
'    float aspect = resolution.x / resolution.y;',
'  float pixelWidthRatio = 1. / (resolution.x * projectionMatrix[0][0]);',
'',
'    vColor = vec4( color, opacity );',
'    vUV = uv;',
'',
'    mat4 m = projectionMatrix * modelViewMatrix;',
'    vec4 finalPosition = m * vec4( position, 1.0 );',
'    vec4 prevPos = m * vec4( previous, 1.0 );',
'    vec4 nextPos = m * vec4( next, 1.0 );',
'',
'    vec2 currentP = fix( finalPosition, aspect );',
'    vec2 prevP = fix( prevPos, aspect );',
'    vec2 nextP = fix( nextPos, aspect );',
'',
'  float pixelWidth = finalPosition.w * pixelWidthRatio;',
'    float w = 1.8 * pixelWidth * lineWidth * width;',
'',
'    if( sizeAttenuation == 1. ) {',
'        w = 1.8 * lineWidth * width;',
'    }',
'',
'    vec2 dir;',
'    if( nextP == currentP ) dir = normalize( currentP - prevP );',
'    else if( prevP == currentP ) dir = normalize( nextP - currentP );',
'    else {',
'        vec2 dir1 = normalize( currentP - prevP );',
'        vec2 dir2 = normalize( nextP - currentP );',
'        dir = normalize( dir1 + dir2 );',
'',
'        vec2 perp = vec2( -dir1.y, dir1.x );',
'        vec2 miter = vec2( -dir.y, dir.x );',
'        //w = clamp( w / dot( miter, perp ), 0., 4. * lineWidth * width );',
'',
'    }',
'',
'    //vec2 normal = ( cross( vec3( dir, 0. ), vec3( 0., 0., 1. ) ) ).xy;',
'    vec2 normal = vec2( -dir.y, dir.x );',
'    normal.x /= aspect;',
'    normal *= .5 * w;',
'',
'    vec4 offset = vec4( normal * side, 0.0, 1.0 );',
'    finalPosition.xy += offset.xy;',
'',
'    gl_Position = finalPosition;',
'',
'}' ];

  var fragmentShaderSource = [
    '#extension GL_OES_standard_derivatives : enable',
'precision mediump float;',
'',
'uniform sampler2D map;',
'uniform sampler2D alphaMap;',
'uniform float useMap;',
'uniform float useAlphaMap;',
'uniform float useDash;',
'uniform float dashArray;',
'uniform float dashOffset;',
'uniform float dashRatio;',
'uniform float visibility;',
'uniform float alphaTest;',
'uniform vec2 repeat;',
'',
'varying vec2 vUV;',
'varying vec4 vColor;',
'varying float vCounters;',
'',
'void main() {',
'',
'    vec4 c = vColor;',
'    if( useMap == 1. ) c *= texture2D( map, vUV * repeat );',
'    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUV * repeat ).a;',
'    if( c.a < alphaTest ) discard;',
'    if( useDash == 1. ){',
'        c.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));',
'    }',
'    gl_FragColor = c;',
'    gl_FragColor.a *= step(vCounters, visibility);',
'}' ];

  function check( v, d ) {
    if( v === undefined ) return d;
    return v;
  }

  THREE.Material.call( this );

  parameters = parameters || {};

  this.lineWidth = check( parameters.lineWidth, 1 );
  this.map = check( parameters.map, null );
  this.useMap = check( parameters.useMap, 0 );
  this.alphaMap = check( parameters.alphaMap, null );
  this.useAlphaMap = check( parameters.useAlphaMap, 0 );
  this.color = check( parameters.color, new THREE.Color( 0xffffff ) );
  this.opacity = check( parameters.opacity, 1 );
  this.resolution = check( parameters.resolution, new THREE.Vector2( 1, 1 ) );
  this.sizeAttenuation = check( parameters.sizeAttenuation, 1 );
  this.near = check( parameters.near, 1 );
  this.far = check( parameters.far, 1 );
  this.dashArray = check( parameters.dashArray, 0 );
  this.dashOffset = check( parameters.dashOffset, 0 );
  this.dashRatio = check( parameters.dashRatio, 0.5 );
  this.useDash = ( this.dashArray !== 0 ) ? 1 : 0;
  this.visibility = check( parameters.visibility, 1 );
  this.alphaTest = check( parameters.alphaTest, 0 );
  this.repeat = check( parameters.repeat, new THREE.Vector2( 1, 1 ) );

  var material = new THREE.RawShaderMaterial( {
    uniforms:{
      lineWidth: { type: 'f', value: this.lineWidth },
      map: { type: 't', value: this.map },
      useMap: { type: 'f', value: this.useMap },
      alphaMap: { type: 't', value: this.alphaMap },
      useAlphaMap: { type: 'f', value: this.useAlphaMap },
      color: { type: 'c', value: this.color },
      opacity: { type: 'f', value: this.opacity },
      resolution: { type: 'v2', value: this.resolution },
      sizeAttenuation: { type: 'f', value: this.sizeAttenuation },
      near: { type: 'f', value: this.near },
      far: { type: 'f', value: this.far },
      dashArray: { type: 'f', value: this.dashArray },
      dashOffset: { type: 'f', value: this.dashOffset },
      dashRatio: { type: 'f', value: this.dashRatio },
      useDash: { type: 'f', value: this.useDash },
      visibility: {type: 'f', value: this.visibility},
      alphaTest: {type: 'f', value: this.alphaTest},
      repeat: { type: 'v2', value: this.repeat }
    },
    vertexShader: vertexShaderSource.join( '\r\n' ),
    fragmentShader: fragmentShaderSource.join( '\r\n' )
  });

  delete parameters.lineWidth;
  delete parameters.map;
  delete parameters.useMap;
  delete parameters.alphaMap;
  delete parameters.useAlphaMap;
  delete parameters.color;
  delete parameters.opacity;
  delete parameters.resolution;
  delete parameters.sizeAttenuation;
  delete parameters.near;
  delete parameters.far;
  delete parameters.dashArray;
  delete parameters.dashOffset;
  delete parameters.dashRatio;
  delete parameters.visibility;
  delete parameters.alphaTest;
  delete parameters.repeat;

  material.type = 'MeshLineMaterial';

  material.setValues( parameters );

  return material;

};

MeshLineMaterial.prototype = Object.create( THREE.Material.prototype );
MeshLineMaterial.prototype.constructor = MeshLineMaterial;

MeshLineMaterial.prototype.copy = function ( source ) {

  THREE.Material.prototype.copy.call( this, source );

  this.lineWidth = source.lineWidth;
  this.map = source.map;
  this.useMap = source.useMap;
  this.alphaMap = source.alphaMap;
  this.useAlphaMap = source.useAlphaMap;
  this.color.copy( source.color );
  this.opacity = source.opacity;
  this.resolution.copy( source.resolution );
  this.sizeAttenuation = source.sizeAttenuation;
  this.near = source.near;
  this.far = source.far;
  this.dashArray.copy( source.dashArray );
  this.dashOffset.copy( source.dashOffset );
  this.dashRatio.copy( source.dashRatio );
  this.useDash = source.useDash;
  this.visibility = source.visibility;
  this.alphaTest = source.alphaTest;
  this.repeat.copy( source.repeat );

  return this;

};

if( typeof exports !== 'undefined' ) {
  if( typeof module !== 'undefined' && module.exports ) {
    exports = module.exports = { MeshLine: MeshLine, MeshLineMaterial: MeshLineMaterial };
  }
  exports.MeshLine = MeshLine;
  exports.MeshLineMaterial = MeshLineMaterial;
}
else {
  root.MeshLine = MeshLine;
  root.MeshLineMaterial = MeshLineMaterial;
}

}).call(this);
