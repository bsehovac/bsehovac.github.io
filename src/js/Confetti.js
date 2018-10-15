import { Animation } from './Animation.js';

class Confetti extends Animation {

  constructor( game ) {

    super( false );

    this.game = game;

    this.count = 100;
    this.particles = [];

    this.object = new THREE.Object3D();
    this.object.position.y = 0.25;
    this.game.world.scene.add( this.object );

    this.geometry = new THREE.PlaneGeometry( 1, 1 );
    this.material = new THREE.MeshLambertMaterial( { transparent: true, side: THREE.DoubleSide} );
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
    this.mesh.rotation.set( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )

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

export { Confetti };
