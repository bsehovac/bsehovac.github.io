class Particle {

  constructor( position, geometry, material, holder, options ) {

    this._options = Object.assign( {
      velocity: 15,
      angle: 90,
      spread: 90,
      radius: 15,
      mass: 0.1,
      colors: [ 0x41aac8, 0x82ca38, 0xfff7ff, 0xffef48, 0xef3923, 0xff8c0a ],
    }, options || {} );

    const Va = THREE.Math.randFloat( this._options.angle - this._options.spread / 2, this._options.angle + this._options.spread / 2 ) * THREE.Math.DEG2RAD;
    const Vs = THREE.Math.randFloat( this._options.velocity / 4, this._options.velocity );

    this._velocity = new THREE.Vector3(
      Math.cos( Va ) * Vs,
      Math.sin( Va ) * Vs,
      Math.cos( Math.random() * Math.PI * 2 ) * Vs,
    );

    this._mass = THREE.Math.randFloat( this._options.mass / 2, this._options.mass );

    this._radius = THREE.Math.randFloat( this._options.radius / 2, this._options.radius );

    this._position = position.clone(),

    this._color = new THREE.Color( this._options.colors[ Math.floor( Math.random() * this._options.colors.length ) ] )
    // new THREE.Color(
    //   THREE.Math.randFloat( 0.2, 0.9 ),
    //   THREE.Math.randFloat( 0.2, 0.9 ),
    //   THREE.Math.randFloat( 0.2, 0.9 )
    // );

    this._revolution = new THREE.Vector3( Math.random() * 0.05, Math.random() * 0.05, Math.random() * 0.05 );

    this._force = new THREE.Vector3();

    this._mesh = new THREE.Mesh( geometry, material.clone() );
    this._mesh.position.copy( this._position );
    this._mesh.scale.set( this._radius / 200, this._radius / 200, this._radius / 200 )
    this._mesh.material.color.set( this._color );
    this._mesh.rotation.set( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )

    this._holder = holder;
    this._holder.add( this._mesh );

    // Static physics variables

    this._Cd = 0.47;
    this._rho = 1.22;
    this._A = Math.PI * this._radius * this._radius / 10000;
    this._ag = -9.81;


    return this;

  }

  update( delta ) {

    delta = 16 / 1000;

    let Fy = -0.5 * this._Cd * this._A * this._rho * Math.pow( this._velocity.y, 3 ) / Math.abs( this._velocity.y );
    let Fx = -0.5 * this._Cd * this._A * this._rho * Math.pow( this._velocity.x, 3 ) / Math.abs( this._velocity.x );
    let Fz = -0.5 * this._Cd * this._A * this._rho * Math.pow( this._velocity.z, 3 ) / Math.abs( this._velocity.z );
    
    Fy = ( isNaN( Fy ) ? 0 : Fy );
    Fx = ( isNaN( Fx ) ? 0 : Fx );
    Fz = ( isNaN( Fz ) ? 0 : Fz );

    const ay = this._ag + (Fy / this._mass);
    const ax = Fx / this._mass;
    const az = Fz / this._mass;

    this._force.set( ax, ay, az ).multiplyScalar( delta );
    this._velocity.add( this._force );
    this._position.add( this._velocity.clone().multiplyScalar( delta / 3 ) );

    this._mesh.position.copy( this._position );
    this._mesh.rotateX( this._revolution.x ).rotateY( this._revolution.y ).rotateZ( this._revolution.y );

  }

}

class Confetti {

  constructor( game ) {

    this._game = game;

    this._object = new THREE.Object3D();
    this._game.world.scene.add( this._object );

    this._particles = [];

    this._count = 50;

    this._position = new THREE.Vector3( 0, 0, 0 );

    this._geometry = new THREE.PlaneGeometry( 1, 1 );
    this._material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide} )

    let i = this._count;

    while ( i-- ) {

      const particle = new Particle( this._position, this._geometry, this._material, this._object );

      this._particles.push( particle );

    }

    this.update = this.update.bind( this );

    return this;

  }

  start() {

    this._time = performance.now();

    requestAnimationFrame( this.update );

  }

  update() {

    const now = performance.now();

    const delta = now - this._time;

    this._time = now;

    let i = this._count;

    while ( i-- ) this._particles[ i ].update( delta );

    requestAnimationFrame( this.update );

  }
  
}

export { Confetti };