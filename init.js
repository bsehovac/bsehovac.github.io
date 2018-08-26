/*
http://zz85.github.io/mrdoobapproves/
*/

const scrambleLength = 20;

const ui = document.querySelector( '#ui' );
const start = document.querySelector( '#start' );
const time = document.querySelector( '#time' );
const moves = document.querySelector( '#moves' );
const undo = document.querySelector( '#undo' );

const container = document.getElementById( 'game' );

const game = new RUBIK.Game( container );
const cube = new RUBIK.Cube( 3 );
const controls = new RUBIK.Controls( cube );
const timer = new RUBIK.Timer( game, time );

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

game.addCube( cube );
game.addControls( controls );

game.camera.zoom = 0.8;
game.camera.updateProjectionMatrix();

controls.disabled = true;

let gameStarted = false;

start.onclick = function ( event ) {

  ui.classList.add('game');

	if ( gameStarted ) return;
	gameStarted = true;

	const scramble = new RUBIK.Scramble( cube, scrambleLength );

	floating.cube.kill();
  floating.shadow.kill();

  TweenMax.to( cube.object.position, 0.4, { y: 0, ease: Sine.easeInOut } );
  TweenMax.to( cube.shadow.material, 0.4, { opacity: 0.4, ease: Sine.easeInOut } );
  TweenMax.to( game.camera, 0.4, { zoom: 1, ease: Sine.easeInOut, onUpdate: function() {

    game.camera.updateProjectionMatrix();

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


// game.scene.fog = new THREE.Fog(0x000000, 77, 79)

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

// var floating = {
//   cube: TweenMax.fromTo( cube.object.position, 1.5,
//     { y: -0.1 },
//     { y: 0.1, repeat: -1, yoyo: true, ease: Sine.easeInOut }
//   ),
//   shadow: TweenMax.fromTo( scene.shadow.material, 1.5,
//     { opacity: 0.5 },
//     { opacity: 0.3, repeat: -1, yoyo: true, ease: Sine.easeInOut }
//   ),
// };

// var start = document.querySelector('#start');
// var timer = document.querySelector('#timer');
// var title = document.querySelector('#title');
// var startTime = null;

// start.onclick = function(e) {
  

//   title.classList.add('is-hidden');
//   start.classList.add('is-hidden');
// }

// var startTime = null;

// scene.animate.push(function() {
//   if (startTime == null) return;
//   var millis = new Date(Date.now() - startTime);
//   var minutes = Math.floor(millis / 60000);
//   var seconds = Math.round((millis % 60000) / 1000);
//   timeDomElement.innerHTML = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
// });
