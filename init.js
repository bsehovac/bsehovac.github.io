/*
http://zz85.github.io/mrdoobapproves/
*/

window.addEventListener( 'touchmove', function () {} );
document.addEventListener( 'touchmove', function( event ){ event.preventDefault(); }, { passive: false } );

const scrambleLength = 2;

const ui = document.querySelector( '#ui' );
const start = document.querySelector( '#start' );
const time = document.querySelector( '#time' );
const moves = document.querySelector( '#moves' );
const undo = document.querySelector( '#undo' );

const container = document.getElementById( 'world' );

const world = new RUBIK.World( container );
const cube = new RUBIK.Cube( 3 );
const controls = new RUBIK.Controls( cube );
const timer = new RUBIK.Timer( world, time );

const floating = {
  cube: TweenMax.fromTo( cube.object.position, 1.5,
    { y: -0.1 },
    { y: 0.1, repeat: -1, yoyo: true, ease: Sine.easeInOut }
  ),
  shadow: TweenMax.fromTo( cube.shadow.material, 1.5,
    { opacity: 0.5 },
    { opacity: 0.3, repeat: -1, yoyo: true, ease: Sine.easeInOut }
  ),
};

world.addCube( cube );
world.addControls( controls );

world.camera.zoom = 0.8;
world.camera.updateProjectionMatrix();

controls.disabled = true;

let worldStarted = false;

start.onclick = function ( event ) {

  ui.classList.add('world');

	if ( worldStarted ) return;
	worldStarted = true;

	const scramble = new RUBIK.Scramble( cube, scrambleLength );

	floating.cube.kill();
  floating.shadow.kill();

  TweenMax.to( cube.object.position, 0.4, { y: 0, ease: Sine.easeInOut } );
  TweenMax.to( cube.shadow.material, 0.4, { opacity: 0.4, ease: Sine.easeInOut } );
  TweenMax.to( world.camera, 0.4, { zoom: 1, ease: Sine.easeInOut, onUpdate: function() {

    world.camera.updateProjectionMatrix();

  }, onComplete: function() {
    
  	controls.scrambleCube( scramble, function () {

			timer.start();
			controls.disabled = false;

		} );

  } } );

};

undo.onclick = function ( event ) {

	controls.undo();

};

controls.onMove = function ( data ) {

	moves.innerHTML = data.length;

};

controls.onSolved = function () {

	var time = timer.stop();
	controls.disabled = true;

};


// world.scene.fog = new THREE.Fog(0x000000, 77, 79)

// var shatter = new RUBIK.Shatter( cube );
// var shattered = false;

// document.body.onclick = function() {
//   shattered = !shattered;
//   if (shattered) {
//     shatter.start()
//   } else {
//     shatter.restore();
//   }
// }


/*
var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var geom = new THREE.BoxGeometry(1, 1, 1);
geom = sliceGeometry(geom, plane);
var material = new THREE.MeshBasicMaterial({ wireframe: true });
var mesh = new THREE.Mesh(geom, material);
scene.add(mesh);
*/