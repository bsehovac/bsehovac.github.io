/*
http://zz85.github.io/mrdoobapproves/
*/

window.addEventListener( 'touchmove', function () {} );
document.addEventListener( 'touchmove', function( event ){ event.preventDefault(); }, { passive: false } );

// SET OPTIONS

const scrambleLength = 20;

// SELECT DOM ELEMENTS

const ui = document.querySelector( '#ui' );
const start = document.querySelector( '#start' );
const time = document.querySelector( '#time' );
const moves = document.querySelector( '#moves' );
const undo = document.querySelector( '#undo' );

const container = document.getElementById( 'world' );

// CREATE RUBIK GAME

const world = new RUBIK.World( container );
const cube = new RUBIK.Cube( 3 );
const controls = new RUBIK.Controls( cube );
const timer = new RUBIK.Timer( world, time );
const animate = new RUBIK.Animate( cube );

world.addCube( cube );
world.addControls( controls );

world.camera.zoom = 0.8;
world.camera.updateProjectionMatrix();

controls.disabled = true;

// START GAME

let gameSaved = cube.loadState();
let gameStarted = false;

start.innerHTML = gameSaved ? 'CONTINUE' : 'NEW GAME';

animate.dropAndFloat( () => {

    ui.classList.add('menu');

} );;

start.onclick = function ( event ) {

  ui.classList.add('game');

  gameStarted = true;

  if ( gameSaved ) {

    timer.element.innerHTML = timer.convert( timer.deltaTime );

    animate.gameStart( () => {

      timer.continue();
      controls.disabled = false;

    }, 0 );

  } else {

  	const scramble = new RUBIK.Scramble( cube, scrambleLength );

  	animate.gameStart( () => {

      controls.scrambleCube( scramble, function () {

        timer.start();
        controls.disabled = false;

      } );

    }, scramble.converted.length * controls.options.scrambleSpeed);

  }

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
  gameStarted = false

};

window.onbeforeunload = function () {
  
  if ( gameStarted ) cube.saveState();

};
