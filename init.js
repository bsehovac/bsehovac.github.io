/*
http://zz85.github.io/mrdoobapproves/
*/

window.addEventListener( 'touchmove', function () {} );
document.addEventListener( 'touchmove', function( event ){ event.preventDefault(); }, { passive: false } );

const scrambleLength = 20;

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
const animate = new RUBIK.Animate( cube );

cube.object.rotation.x = Math.PI/6;
cube.object.rotation.y = Math.PI/6;
cube.object.position.y = 3;
cube.shadow.material.opacity = 0;

animate.dropAndFloat( () => {

  ui.classList.add('menu');

} );

world.addCube( cube );
world.addControls( controls );

world.camera.zoom = 0.8;
world.camera.updateProjectionMatrix();

controls.disabled = true;

let worldStarted = false;

start.onclick = function ( event ) {

  ui.classList.add('game');

	if ( worldStarted ) return;
	worldStarted = true;

	const scramble = new RUBIK.Scramble( cube, scrambleLength );

	animate.gameStart( () => {

    controls.scrambleCube( scramble, function () {
      timer.start();
      controls.disabled = false;
    } );

  } );

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
