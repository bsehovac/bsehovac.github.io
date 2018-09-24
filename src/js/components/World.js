class World {

	constructor( container, options ) {

		this.container = container;
		this.options = options;

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.container.appendChild( this.renderer.domElement );

		this.camera = new THREE.PerspectiveCamera( 2, 1, 0.1, 10000 );

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

		this.lights = {
			holder:  new THREE.Object3D,
			ambient: new THREE.AmbientLight( 0xffffff, 1.25 ),
			front:   new THREE.DirectionalLight( 0xffffff, 0.65 ),
			back:    new THREE.DirectionalLight( 0xffffff, 0.35 ),
		};

		this.lights.front.position.set( 0.3, 1,  0.6 );
		this.lights.back.position.set( -0.3, -1,  -0.6 );

		this.lights.holder.add( this.lights.ambient );
		this.lights.holder.add( this.lights.front );
		this.lights.holder.add( this.lights.back );

		this.scene.add( this.lights.holder );

	}

	updateCamera() {

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

	}

	addCube( cube ) {

		this.cube = cube;
		this.cube.world = this;

		this.scene.add( this.cube.holder );
		this.scene.add( this.cube.shadow );

	}

	// addAudio( audio ) {

	// 	this.audio = audio;
	// 	this.audio.world = this;

	// 	this.camera.add( this.audio.listener );

	// }

	addControls( controls ) {

		this.controls = controls;
		this.controls.world = this;

    this.scene.add( this.controls.edges );
    this.scene.add( this.controls.helper );

		this.controls.draggable.init( this.container );

	}

}

export { World };
