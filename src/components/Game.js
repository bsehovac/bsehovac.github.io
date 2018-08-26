class Game {

	constructor( container ) {

		const game = this;

		const scene = new THREE.Scene();

		const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		container.appendChild( renderer.domElement );

		const camera = new THREE.PerspectiveCamera( 2, 1, 0.1, 10000 );

		game.onAnimate = () => {};
		game.onResize = () => {};
		game.scene = scene;
		game.camera = camera;
		game.container = container;
		game.renderer = renderer;

		game.stage = { width: 2.1, height: 3.5 };
		game.fov = 2;

		game.createLights();

		function animate() {

			requestAnimationFrame( animate );

			renderer.render( scene, camera );

			game.onAnimate();

		}

		animate();

		function resize() {

			const width = container.offsetWidth;
			const height = container.offsetHeight;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();

			renderer.setSize( width, height );

			game.width = width;
			game.height = height;

			game.updateCamera();
			game.onResize();

		}

		resize();

		window.addEventListener( 'resize', resize, false );

	}

	createLights() {

		const game = this;
		const scene = game.scene;

		const lights = {
			ambient: new THREE.AmbientLight( 0xffffff, 0.725 ),
			directional1: new THREE.DirectionalLight( 0xffffff, 0.15 ),
			directional2: new THREE.DirectionalLight( 0xffffff, 0.15 ),
		};

		scene.add( lights.ambient );

		lights.directional1.position.set( 0, 2, 2 );
		lights.directional1.lookAt( new THREE.Vector3() );
		scene.add( lights.directional1 );

		lights.directional2.position.set( 2, 2, 0 );
		lights.directional2.lookAt( new THREE.Vector3() );
		scene.add( lights.directional2 );

		game.lights = lights;

	}

	updateCamera() {

		const game = this;
		const stage = game.stage;
	  const camera = game.camera;
	  const fov = game.fov;

		const aspect = stage.width / stage.height;
	  const fovRad = fov * THREE.Math.DEG2RAD;

	  let distance = ( aspect < camera.aspect )
			? ( stage.height / 2 ) / Math.tan( fovRad / 2 )
			: ( stage.width / camera.aspect ) / ( 2 * Math.tan( fovRad / 2 ) );

	  distance /= 2.1;

	  camera.fov = fov;
		camera.position.set( distance, distance, distance );
		camera.lookAt( new THREE.Vector3() );
		camera.updateProjectionMatrix();

	}

	addCube( cube ) {

		const game = this;

		game.cube = cube;
		cube.game = game;

		game.scene.add( cube.object );
		game.scene.add( cube.shadow );

	}

	addControls( controls ) {

		const game = this;

		game.controls = controls;
		controls.game = game;

		game.scene.add( controls.helper );
		controls.touchEvents.init( game.container );

	}

}

export { Game };
