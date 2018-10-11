class Logo {

  constructor( world ) {

    const scale = 0.6;

    this.object = new THREE.Object3D();
    //this.object.position.y = 1.2;
    // this.object.rotation.y = Math.PI / 4;
    this.object.scale.set( scale, scale, scale );

    this.world = world;
    this.world.scene.add( this.object );

    this.material = new THREE.MeshStandardMaterial( {
      color: 0x08101a,
      side: THREE.FrontSide,
      roughness: 1,
      metalness: 0.5,
    } );

    this.words = {};

    this.words.object = new THREE.Object3D();
    // this.words.object.rotation.x = - Math.PI / 6;

    this.object.add( this.words.object );

    let gap;

    // CUBE TEXT

    this.words.cube = {};

    this.words.cube.object = new THREE.Object3D();
    this.words.cube.object.position.y = 0.125;

    this.words.object.add( this.words.cube.object );

    this.words.cube.letters = {};
    this.words.cube.letters.c = this.createLetter( 'c', this.words.cube.object, 0.01 );
    this.words.cube.letters.u = this.createLetter( 'u', this.words.cube.object, 0.01 );
    this.words.cube.letters.b = this.createLetter( 'b', this.words.cube.object, 0.01 );
    this.words.cube.letters.e = this.createLetter( 'e', this.words.cube.object, 0.01 );

    gap = 0.05;

    this.words.cube.letters.c.position.x = - 0.24 - gap / 2 - 0.48 - gap;
    this.words.cube.letters.u.position.x = - 0.24 - gap / 2;
    this.words.cube.letters.b.position.x = + 0.24 + gap / 2;
    this.words.cube.letters.e.position.x = + 0.24 + gap / 2 + 0.48 + gap;

    // THE TEXT

    this.words.the = {};

    this.words.the.object = new THREE.Object3D();
    this.words.the.object.position.y = 0.475;

    this.words.object.add( this.words.the.object );

    this.words.the.letters = {};
    this.words.the.letters.t = this.createLetter( 't', this.words.the.object, 0.0045 );
    this.words.the.letters.h = this.createLetter( 'h', this.words.the.object, 0.0045 );
    this.words.the.letters.e = this.createLetter( 'e', this.words.the.object, 0.0045 );

    gap = 0.0225;

    this.words.the.letters.t.position.x = - 0.22 - gap;
    // this.words.the.letters.h.position.x = - 0.11;
    this.words.the.letters.e.position.x = + 0.22 + gap;
  }

  createLetter( letter, object, scale ) {

    const shape = new THREE.Shape();
    const depth = 1;
    const segments = 3;

    this.constructor.letters[ letter ]( shape );

    const mesh = new THREE.Mesh(
      new THREE.ExtrudeBufferGeometry( shape, {
        depth: depth,
        curveSegments: segments,
        bevelEnabled: false
      } ),
      this.material
    );

    mesh.geometry.translate( -24, 0, -depth / 2 );
    mesh.scale.set( scale, scale, scale );
    mesh.rotation.x = Math.PI;

    object.add( mesh );

    return mesh;

  }

}

Logo.letters = {

  c: shape => {
    shape.moveTo(7.9, 59.4);
    shape.lineTo(40.1, 59.4);
    shape.bezierCurveTo(44.4, 59.4, 47.9, 55.8, 47.9, 51.5);
    shape.lineTo(47.9, 39.0);
    shape.bezierCurveTo(47.9, 37.9, 47.0, 36.9, 45.9, 36.9);
    shape.lineTo(35.8, 36.9);
    shape.bezierCurveTo(34.7, 36.9, 33.8, 37.9, 33.8, 39.0);
    shape.lineTo(33.8, 43.2);
    shape.bezierCurveTo(33.8, 44.3, 32.9, 45.2, 31.7, 45.2);
    shape.lineTo(16.1, 45.2);
    shape.bezierCurveTo(15.0, 45.2, 14.1, 44.3, 14.1, 43.2);
    shape.lineTo(14.1, 16.2);
    shape.bezierCurveTo(14.1, 15.1, 15.0, 14.2, 16.1, 14.2);
    shape.lineTo(31.7, 14.2);
    shape.bezierCurveTo(32.9, 14.2, 33.8, 15.1, 33.8, 16.2);
    shape.lineTo(33.8, 20.4);
    shape.bezierCurveTo(33.8, 21.5, 34.7, 22.4, 35.8, 22.4);
    shape.lineTo(45.9, 22.4);
    shape.bezierCurveTo(47.0, 22.4, 47.9, 21.5, 47.9, 20.4);
    shape.lineTo(47.9, 7.9);
    shape.bezierCurveTo(47.9, 3.6, 44.4, 0.0, 40.1, 0.0);
    shape.lineTo(7.9, 0.0);
    shape.bezierCurveTo(3.6, 0.0, 0.0, 3.6, 0.0, 7.9);
    shape.lineTo(0.0, 51.4);
    shape.bezierCurveTo(0.0, 55.7, 3.6, 59.3, 7.9, 59.3);
    shape.lineTo(7.9, 59.4);
  },

  u: shape => {
    shape.moveTo(48.1, 2.0);
    shape.lineTo(48.1, 51.5);
    shape.bezierCurveTo(48.1, 55.8, 44.5, 59.4, 40.1, 59.4);
    shape.lineTo(7.9, 59.4);
    shape.bezierCurveTo(3.6, 59.4, 0.0, 55.8, 0.0, 51.5);
    shape.lineTo(0.0, 2.0);
    shape.bezierCurveTo(0.0, 0.9, 0.9, 0.0, 2.0, 0.0);
    shape.lineTo(12.1, 0.0);
    shape.bezierCurveTo(13.3, 0.0, 14.2, 0.9, 14.2, 2.0);
    shape.lineTo(14.2, 43.2);
    shape.bezierCurveTo(14.2, 44.3, 15.1, 45.2, 16.2, 45.2);
    shape.lineTo(31.8, 45.2);
    shape.bezierCurveTo(32.9, 45.2, 33.8, 44.3, 33.8, 43.2);
    shape.lineTo(33.8, 2.0);
    shape.bezierCurveTo(33.8, 0.9, 34.7, 0.0, 35.9, 0.0);
    shape.lineTo(46.0, 0.0);
    shape.bezierCurveTo(47.1, 0.0, 48.0, 0.9, 48.0, 2.0);
    shape.lineTo(48.1, 2.0);
  },

  b: shape => {
    shape.moveTo(2.0, 59.3);
    shape.bezierCurveTo(0.9, 59.3, 0.0, 58.4, 0.0, 57.3);
    shape.lineTo(0.0, 2.0);
    shape.bezierCurveTo(0.0, 0.9, 0.9, 0.0, 2.0, 0.0);
    shape.lineTo(40.1, 0.0);
    shape.bezierCurveTo(44.4, 0.0, 47.9, 3.6, 47.9, 7.9);
    shape.lineTo(47.9, 26.1);
    shape.bezierCurveTo(47.9, 28.0, 46.4, 29.5, 44.6, 29.5);
    shape.bezierCurveTo(46.4, 29.5, 47.9, 31.0, 47.9, 32.9);
    shape.lineTo(47.9, 51.4);
    shape.bezierCurveTo(47.9, 55.7, 44.4, 59.3, 40.1, 59.3);
    shape.lineTo(2.0, 59.3);

    var hole1 = new THREE.Path();
    hole1.moveTo(14.2, 14.1);
    hole1.lineTo(14.2, 22.4);
    hole1.lineTo(33.8, 22.4);
    hole1.lineTo(33.8, 14.1);
    hole1.lineTo(14.2, 14.1);
    shape.holes.push( hole1 );

    var hole2 = new THREE.Path();
    hole2.moveTo(14.2, 36.5);
    hole2.lineTo(14.2, 45.2);
    hole2.lineTo(33.8, 45.2);
    hole2.lineTo(33.8, 36.5);
    hole2.lineTo(14.2, 36.5);
    shape.holes.push( hole2 );
  },

  e: shape => {
    shape.moveTo(46.0, 0.0);
    shape.bezierCurveTo(47.1, 0.0, 48.0, 0.9, 48.0, 2.0);
    shape.lineTo(48.0, 12.1);
    shape.bezierCurveTo(48.0, 13.2, 47.1, 14.2, 46.0, 14.2);
    shape.lineTo(14.2, 14.2);
    shape.lineTo(14.2, 22.4);
    shape.lineTo(41.4, 22.4);
    shape.bezierCurveTo(42.5, 22.4, 43.4, 23.4, 43.4, 24.5);
    shape.lineTo(43.4, 34.6);
    shape.bezierCurveTo(43.4, 35.7, 42.5, 36.6, 41.4, 36.6);
    shape.lineTo(14.2, 36.6);
    shape.lineTo(14.2, 45.2);
    shape.lineTo(46.0, 45.2);
    shape.bezierCurveTo(47.1, 45.2, 48.0, 46.1, 48.0, 47.2);
    shape.lineTo(48.0, 57.4);
    shape.bezierCurveTo(48.0, 58.5, 47.1, 59.4, 46.0, 59.4);
    shape.bezierCurveTo(31.3, 59.4, 16.7, 59.4, 2.0, 59.4);
    shape.bezierCurveTo(0.9, 59.4, 0.0, 58.5, 0.0, 57.4);
    shape.lineTo(0.0, 2.0);
    shape.bezierCurveTo(0.0, 0.9, 0.9, 0.0, 2.0, 0.0);
    shape.bezierCurveTo(16.7, 0.0, 31.3, 0.0, 46.0, 0.0);
  },

  t: shape => {
    shape.moveTo(2.1, 0.0);
    shape.lineTo(46.1, 0.0);
    shape.bezierCurveTo(47.2, 0.0, 48.1, 0.9, 48.1, 2.0);
    shape.lineTo(48.1, 12.2);
    shape.bezierCurveTo(48.1, 13.3, 47.2, 14.2, 46.1, 14.2);
    shape.lineTo(31.1, 14.2);
    shape.lineTo(31.1, 57.4);
    shape.bezierCurveTo(31.1, 58.5, 30.2, 59.4, 29.1, 59.4);
    shape.lineTo(19.0, 59.4);
    shape.bezierCurveTo(17.9, 59.4, 16.9, 58.5, 16.9, 57.4);
    shape.lineTo(16.9, 14.2);
    shape.lineTo(2.0, 14.2);
    shape.bezierCurveTo(0.9, 14.2, 0.0, 13.3, 0.0, 12.2);
    shape.lineTo(0.0, 2.0);
    shape.bezierCurveTo(0.0, 0.9, 0.9, 0.0, 2.0, 0.0);
    shape.lineTo(2.1, 0.0);
  },

  h: shape => {
    shape.moveTo(14.2, 2.0);
    shape.lineTo(14.2, 22.4);
    shape.lineTo(33.9, 22.4);
    shape.lineTo(33.9, 2.0);
    shape.bezierCurveTo(33.9, 0.9, 34.8, 0.0, 35.9, 0.0);
    shape.lineTo(46.1, 0.0);
    shape.bezierCurveTo(47.2, 0.0, 48.1, 0.9, 48.1, 2.0);
    shape.lineTo(48.1, 57.3);
    shape.bezierCurveTo(48.1, 58.5, 47.2, 59.4, 46.1, 59.4);
    shape.lineTo(35.9, 59.4);
    shape.bezierCurveTo(34.8, 59.4, 33.9, 58.5, 33.9, 57.3);
    shape.lineTo(33.9, 36.6);
    shape.lineTo(14.2, 36.6);
    shape.lineTo(14.2, 57.3);
    shape.bezierCurveTo(14.2, 58.5, 13.3, 59.4, 12.2, 59.4);
    shape.lineTo(2.0, 59.4);
    shape.bezierCurveTo(0.9, 59.4, 0.0, 58.5, 0.0, 57.3);
    shape.lineTo(0.0, 2.0);
    shape.bezierCurveTo(0.0, 0.9, 0.9, 0.0, 2.0, 0.0);
    shape.lineTo(12.2, 0.0);
    shape.bezierCurveTo(13.3, 0.0, 14.2, 0.9, 14.2, 2.0);
  }

}

export { Logo };
