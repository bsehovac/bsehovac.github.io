class World {

	constructor( container ) {

		this.container = container;

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.container.appendChild( this.renderer.domElement );

		this.camera = new THREE.PerspectiveCamera( 2, 1, 0.1, 10000 );
		this.cameraOffset = new THREE.Vector3( 0, 0.15, 0 );

		this.onAnimate = () => {};
		this.onResize = () => {};

		this.stage = { width: 2, height: 3 };
		this.fov = 10;

		this.createLights();

		const resize = e => {

			this.width = container.offsetWidth;
			this.height = container.offsetHeight;

			this.renderer.setSize( this.width, this.height );

			this.updateCamera();
			this.onResize();

		};

		window.addEventListener( 'resize', resize, false );

		resize();

		const animate = () => {

			this.renderer.render( this.scene, this.camera );
			this.onAnimate();

			requestAnimationFrame( animate );

		}

		animate();

	}

	createLights() {

		// const lights = this.lights = [

		// 	new THREE.AmbientLight( 0xffffff, 1.65 ),
		// 	new THREE.DirectionalLight( 0xffffff, 0.2 ),
		// 	new THREE.DirectionalLight( 0xffffff, 0.4 ),

		// ];

		// lights[1].position.set( -1, -1,  1 );
		// lights[2].position.set( -1,  1, -1 );

		// this.scene.add( lights[0] );
		// this.scene.add( lights[1] );
		// this.scene.add( lights[2] );

		const lights = this.lights = [
			new THREE.AmbientLight( 0xffffff, 1.25 ),
			new THREE.DirectionalLight( 0xffffff, 0.65 ),
			new THREE.DirectionalLight( 0xffffff, 0.65 ),
		];

		lights[1].position.set( 0.3, 1,  0.6 );
		lights[2].position.set( -0.3, -1,  -0.6 );

		this.scene.add( lights[0] );
		this.scene.add( lights[1] );
		this.scene.add( lights[2] );

	}

	updateCamera() {

	  this.camera.fov = this.fov;
	  this.camera.aspect = this.width / this.height;

		const aspect = this.stage.width / this.stage.height;
	  const fovRad = this.fov * THREE.Math.DEG2RAD;

	  let distance = ( aspect < this.camera.aspect )
			? ( this.stage.height / 2 ) / Math.tan( fovRad / 2 )
			: ( this.stage.width / this.camera.aspect ) / ( 2 * Math.tan( fovRad / 2 ) );

	  distance /= 2.1;

		this.camera.position.set( distance, distance, distance);
		this.camera.lookAt( this.cameraOffset );
		this.camera.updateProjectionMatrix();

	}

	addCube( cube ) {

		cube.world = this;
		this.cube = cube;

		this.scene.add( cube.object );
		this.scene.add( cube.shadow );

	}

	addAudio( audio ) {

		audio.world = this;
		this.audio = audio;

		this.camera.add( audio.listener );

	}

	addControls( controls ) {

		controls.world = this;
		this.controls = controls;

		this.scene.add( controls.helper );
		controls.draggable.init( this.container );

	}

}

export { World };
