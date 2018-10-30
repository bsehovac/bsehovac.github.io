import { Animation } from './Animation.js';

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
    this.game.world.onResize.push( this.resizeViewport )
    this.resizeViewport();    

    this.geometry = new THREE.PlaneGeometry( 1, 1 );
    this.material = new THREE.MeshLambertMaterial( { transparent: true, side: THREE.DoubleSide } );

    this.options = {
      velocity: { min: 5, max: 20 },
      revolution: { min: 0.001, max: 0.05 },
      radius: { min: 10, max: 15 },
      mass: { min: 0.025, max: 0.1 },
      gravity: -9.81,
      geometryScale: 0.01,
      positionScale: 0.3333,
      colors: [ 0x41aac8, 0x82ca38, 0xffef48, 0xef3923, 0xff8c0a ],
    };

    let i = this.count;
    while ( i-- ) this.particles.push( new Particle( this ) );

  }

  start() {

    this.time = performance.now();
    this.playing = true;
    super.start();

  }

  stop() {

    this.playing = false;
    this.completed = 0;

  }

  reset() {

    super.stop();

    let i = this.count;
    while ( i-- ) this.particles[ i ].reset();

  }

  update() {

    const now = performance.now();
    const delta = now - this.time;
    this.time = now;

    let i = this.count;

    while ( i-- )
      if ( ! this.particles[ i ].completed ) this.particles[ i ].update( delta );

    if ( ! this.playing && this.completed == this.count ) this.reset();

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

class Particle {

  constructor( confetti ) {

    this.confetti = confetti;

    this.velocity = new THREE.Vector3();
    this.force = new THREE.Vector3();

    this.mesh = new THREE.Mesh( this.confetti.geometry, this.confetti.material.clone() );
    this.confetti.object.add( this.mesh );

    this.reset();

    this.ag = this.confetti.options.gravity;

    return this;

  }

  reset() {

    this.mass = THREE.Math.randFloat( this.confetti.options.mass.min, this.confetti.options.mass.max );
    this.radius = THREE.Math.randFloat( this.confetti.options.radius.min, this.confetti.options.radius.max );
    this.scale = this.radius * this.confetti.options.geometryScale;
    this.completed = false;

    this.velocity.set( 0, 0, 0 );
    this.color = new THREE.Color( this.confetti.options.colors[ Math.floor( Math.random() * this.confetti.options.colors.length ) ] );

    this.revolution = new THREE.Vector3(
      THREE.Math.randFloat( this.confetti.options.revolution.min, this.confetti.options.revolution.max ),
      THREE.Math.randFloat( this.confetti.options.revolution.min, this.confetti.options.revolution.max ),
      THREE.Math.randFloat( this.confetti.options.revolution.min, this.confetti.options.revolution.max )
    );

    this.mesh.position.set(
      THREE.Math.randFloat( - this.confetti.width / 2, this.confetti.width / 2 ),
      THREE.Math.randFloat( this.scale, this.confetti.height + this.scale ),
      0
    );

    this.mesh.scale.set( this.scale, this.scale, this.scale );
    this.mesh.material.color.set( this.color );
    this.mesh.rotation.set( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )

    this.physics = this.getPhysics( this.radius );

  }

  update( delta ) {

    delta = 16 / 1000;

    const forceY = this.physics * this.velocity.y * this.velocity.y * Math.sign( this.velocity.y ) / this.mass;

    this.force.set( 0, forceY + this.ag, 0 );
    this.velocity.add( this.force.multiplyScalar( delta ) );

    this.mesh.position.add( this.velocity.clone().multiplyScalar( delta * this.confetti.options.positionScale ) );
    this.mesh.rotateX( this.revolution.x ).rotateY( this.revolution.y ).rotateZ( this.revolution.y );

    if ( this.mesh.position.y < - this.confetti.height - this.scale ) {

      if ( this.confetti.playing ) this.mesh.position.y = this.scale;
      else {

        this.completed = true;
        this.confetti.completed ++;

      }

    }

  }

  getPhysics( r ) {

    const Cd = 0.47;
    const rho = 1.22;
    const A = Math.PI * r * r / 10000;

    return -0.5 * Cd * rho * A;

  }

}

export { Confetti };
