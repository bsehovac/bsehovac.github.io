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

    ui.classList.add('in-menu');

} );;

start.onclick = function ( event ) {

  ui.classList.remove('in-menu');
  ui.classList.add('in-game');

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
  if ( musicOn ) clickSound.play();

};

controls.onSolved = function () {

	var time = timer.stop();
	controls.disabled = true;
  gameStarted = false

};

var music = document.querySelector('#music');
var musicOn = localStorage.getItem( 'music' );
if ( musicOn == null ) {
  musicOn = true;
} else {
  musicOn = ( musicOn == 'true' ) ? true : false;
}

music.classList[ musicOn ? 'add' : 'remove' ]('is-active');

var listener = new THREE.AudioListener();
var musicSound = new THREE.Audio( listener );
var clickSound = new THREE.Audio( listener );
var audioLoader = new THREE.AudioLoader();

world.camera.add( listener );

audioLoader.load( 'assets/sounds/music.mp3', function( buffer ) {
  musicSound.setBuffer( buffer );
  musicSound.setLoop( true );
  musicSound.setVolume( 0.5 );
  if ( musicOn ) musicSound.play();
});

audioLoader.load( 'assets/sounds/click.mp3', function( buffer ) {
  clickSound.setBuffer( buffer );
  clickSound.setLoop( false );
  clickSound.setVolume( 0.5 );
});

music.addEventListener( 'click', () => {

  musicOn = !musicOn;

  console.log( musicOn );

  if ( musicOn ) { musicSound.play(); } else { musicSound.stop(); }

  music.classList[ musicOn ? 'add' : 'remove' ]('is-active');

  localStorage.setItem( 'music', musicOn );

}, false );

const home = document.querySelector( '#home' );

home.onclick = e => {

  ui.classList.remove('in-game');
  ui.classList.add('in-menu');

  timer.stop();
  animate.gameStop();

}
