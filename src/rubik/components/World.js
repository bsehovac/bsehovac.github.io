class World {

	constructor( container ) {

		const world = this;

		const scene = new THREE.Scene();

		const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setClearColor( 0xffffff, 1 );
		container.appendChild( renderer.domElement );

		const camera = new THREE.PerspectiveCamera( 2, 1, 0.1, 10000 );

		world.onAnimate = () => {};
		world.onResize = () => {};
		world.scene = scene;
		world.camera = camera;
		world.container = container;
		world.renderer = renderer;

		world.stage = { width: 2, height: 3 };
		world.fov = 15;

		world.createLights();

		function resize() {

			world.width = container.offsetWidth;
			world.height = container.offsetHeight;

			renderer.setSize( world.width, world.height );

			world.updateCamera();
			world.onResize();

		}

		resize();

		window.addEventListener( 'resize', resize, false );

		function animate() {

			renderer.render( scene, camera );
			world.onAnimate();

			requestAnimationFrame( animate );

		}

		animate();

	}

	createLights() {

		const world = this;
		const scene = world.scene;

		const lights = [
			new THREE.AmbientLight( 0xffffff, 0.75 ),
			new THREE.DirectionalLight( 0xffffff, 0.25 ),
			new THREE.DirectionalLight( 0xffffff, 0.15 ),
		];

		scene.add( lights[0] );
		scene.add( lights[1] );
		scene.add( lights[2] );

		lights[1].position.set( 0, 1.5, 2 );
		lights[2].position.set( 2, 1.5, 0 );

		world.lights = lights;

	}

	updateCamera() {

		const world = this;
		const stage = world.stage;
	  const camera = world.camera;
	  const fov = world.fov;

	  camera.fov = fov;
	  camera.aspect = world.width / world.height;

		const aspect = stage.width / stage.height;
	  const fovRad = fov * THREE.Math.DEG2RAD;

	  let distance = ( aspect < camera.aspect )
			? ( stage.height / 2 ) / Math.tan( fovRad / 2 )
			: ( stage.width / camera.aspect ) / ( 2 * Math.tan( fovRad / 2 ) );

	  distance /= 2.1;

		camera.position.set( distance, distance, distance );
		camera.lookAt( new THREE.Vector3() );
		camera.updateProjectionMatrix();

	}

	addCube( cube ) {

		const world = this;

		world.cube = cube;
		cube.world = world;

		world.scene.add( cube.object );
		world.scene.add( cube.shadow );

	}

	addControls( controls ) {

		const world = this;

		world.controls = controls;
		controls.world = world;

		world.scene.add( controls.helper );
		controls.draggable.init( world.container );

	}

}

export { World };
