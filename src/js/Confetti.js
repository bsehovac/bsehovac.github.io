import { Animation } from './Animation.js';

class Confetti {

  constructor( game ) {

    this.game = game;
    this.started = 0;

    this.geometry = new THREE.PlaneGeometry( 1, 1 );
    this.material = new THREE.MeshLambertMaterial( { transparent: true, side: THREE.DoubleSide } );

    this.holders = [
      new ConfettiHolder( this.game, this.geometry, this.material, 1 ),
      new ConfettiHolder( this.game, this.geometry, this.material, -1 ),
    ];

  }

  start() {

    if ( this.started > 0 ) return;

    this.holders.forEach( holder => {

      this.game.world.scene.add( holder.holder );
      holder.start();
      this.started ++;

    } );

  }

  stop() {

    if ( this.started == 0 ) return;

    this.holders.forEach( holder => {

      holder.stop( () => {

        this.game.world.scene.remove( holder.holder );
        this.started --;

      } );

    } );

  }

  updateColors( colors ) {

    this.holders.forEach( holder => {

      holder.options.colors.forEach( ( color, index ) => {

        holder.options.colors[ index ] = colors[ [ 'D', 'F', 'R', 'B', 'L' ][ index ] ];

      } );

      console.log( colors, holder.options.colors );

    } );

  }

}

class ConfettiHolder extends Animation {

  constructor( game, geometry, material, distance ) {

    super( false );

    this.game = game;
    this.distanceFromCube = distance;

    this.count = 50;
    this.particles = [];

    this.holder = new THREE.Object3D();
    this.holder.rotation.copy( this.game.world.camera.rotation );

    this.object = new THREE.Object3D();
    this.holder.add( this.object );

    this.resizeViewport = this.resizeViewport.bind( this );
    this.game.world.onResize.push( this.resizeViewport )
    this.resizeViewport();    

    this.geometry = geometry;
    this.material = material;

    this.options = {
      velocity: { min: 5, max: 20 },
      revolution: { min: 0.001, max: 0.05 },
      radius: { min: 10, max: 15 },
      mass: { min: 0.025, max: 0.1 },
      gravity: -6.5, // 9.81
      geometryScale: 0.0085,
      positionScale: 0.3333,
      colors: [ 0x41aac8, 0x82ca38, 0xffef48, 0xef3923, 0xff8c0a ],
    };

    let i = this.count;
    while ( i-- ) this.particles.push( new Particle( this ) );

  }

  start() {

    this.time = performance.now();
    this.playing = true;

    let i = this.count;
    while ( i-- ) this.particles[ i ].reset();

    super.start();

  }

  stop( callback ) {

    this.playing = false;
    this.completed = 0;
    this.callback = callback;

  }

  reset() {

    super.stop();

    this.callback();

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

    const fovRad = this.game.world.camera.fov * THREE.Math.DEG2RAD;

    this.height = 2 * Math.tan( fovRad / 2 ) * ( this.game.world.camera.position.length() - this.distanceFromCube );
    this.width = this.height * this.game.world.camera.aspect;

    this.width *= 1.17647;
    this.height *= 1.17647;

    this.object.position.z = this.distanceFromCube;
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

    // this.physics = this.getPhysics( this.radius );

  }

  resetY() {

    this.reset();

    this.mesh.position.y = this.scale;

  }

  update( delta ) {

    delta = 16 / 1000;

    // check is force 0, if it is remove physics and add some static speed
    // const forceY = this.physics * this.velocity.y * this.velocity.y * Math.sign( this.velocity.y ) / this.mass;

    this.force.set( 0, this.ag, 0 );
    this.velocity.add( this.force.multiplyScalar( delta ) );

    this.mesh.position.add( this.velocity.clone().multiplyScalar( delta * this.confetti.options.positionScale ) );
    this.mesh.rotateX( this.revolution.x ).rotateY( this.revolution.y ).rotateZ( this.revolution.y );

    if ( this.mesh.position.y < - this.confetti.height - this.scale ) {

      if ( this.confetti.playing ) {

        this.resetY();

      } else {

        this.completed = true;
        this.confetti.completed ++;

      }

    }

  }

  // getPhysics( r ) {

  //   const Cd = 0.47;
  //   const rho = 1.22;
  //   const A = Math.PI * r * r / 10000;

  //   return -0.5 * Cd * rho * A;

  // }

}

export { Confetti };
