import { Animation } from './plugins/Animation.js';

class Confetti extends Animation {

  constructor( game ) {

    super( false );

    this.name = 'Confetti';

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
    this._mesh.rotation.set( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )

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

export { Confetti };
