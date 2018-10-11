import { Tween, Easing } from './Tween.js';

class Transition {

  constructor( game ) {

    this._game = game;

    this._tweens = {};
    this._durations = {};
    this._data = {};

    this._activeTransitions = 0;

  }

  initialize() {

    this._data.cubeY = -0.2;
    this._data.cameraZoom = 0.85;

    this._game.controls.disable();

    this._game.cube.object.position.y = this._data.cubeY;
    this._game.controls.edges.position.y = this._data.cubeY;
    this._game.cube.animator.position.y = 4;
    this._game.cube.animator.rotation.x = - Math.PI / 3;
    this._game.world.camera.zoom = this._data.cameraZoom;
    this._game.world.camera.updateProjectionMatrix();

  }

  cube( show ) {

    this._activeTransitions++;

    if ( typeof this._tweens.cube !== 'undefined' ) this._tweens.cube.stop();

    const currentY = this._game.cube.animator.position.y;
    const currentRotation = this._game.cube.animator.rotation.x;

    this._tweens.cube = new Tween( {
      duration: show ? 3000 : 1250,
      easing: show ? Easing.Elastic.Out( 0.8, 0.6 ) : Easing.Back.In( 1 ),
      onUpdate: tween => {

        this._game.cube.animator.position.y = show
          ? ( 1 - tween.value ) * 4
          : currentY + tween.value * 4;

        this._game.cube.animator.rotation.x = show
          ? ( 1 - tween.value ) * Math.PI / 3
          : currentRotation + tween.value * - Math.PI / 3;

      }
    } );

    setTimeout( () => {

      if ( this._game.playing ) this.timer( show );
      else this.title( show );

    }, show ? 700 : 0 );

    this._durations.cube = show ? 1500 : 1500;

    setTimeout( () => this._activeTransitions--, this._durations.cube );

  }

  float() {

    if ( typeof this._tweens.float !== 'undefined' ) this._tweens.float.stop();

    this._tweens.float = new Tween( {
      duration: 1500,
      easing: Easing.Sine.InOut(),
      yoyo: true,
      onUpdate: tween => {

        this._game.cube.holder.position.y = (- 0.02 + tween.value * 0.04); 
        this._game.cube.holder.rotation.x = 0.005 - tween.value * 0.01;
        this._game.cube.holder.rotation.z = - this._game.cube.holder.rotation.x;
        this._game.cube.holder.rotation.y = this._game.cube.holder.rotation.x;

      },
    } );

  }

  zoom( game, time, callback ) {

    this._activeTransitions++;

    const zoom = ( game ) ? 1 : this._data.cameraZoom;
    const cubeY = ( game ) ? -0.3 : this._data.cubeY;
    const duration = ( time > 0 ) ? Math.max( time, 1500 ) : 1500;
    const rotations = ( time > 0 ) ? Math.round( duration / 1500 ) : 1;
    const easing = Easing.Power.InOut( ( time > 0 ) ? 2 : 3 );

    this._tweens.zoom = new Tween( {
      target: this._game.world.camera,
      duration: duration,
      easing: easing,
      to: { zoom: zoom },
      onUpdate: () => { this._game.world.camera.updateProjectionMatrix(); },
    } );

    this._tweens.rotate = new Tween( {
      target: this._game.cube.animator.rotation,
      duration: duration,
      easing: easing,
      to: { y: - Math.PI * 2 * rotations },
      onComplete: () => { this._game.cube.animator.rotation.y = 0; callback(); },
    } );

    // this._tweens.cubeY = new Tween( {
    //   target: this._data,
    //   duration: duration,
    //   easing: easing,
    //   to: { cubeY: ( game ) ? -0.3 : -0.2 },
    //   onUpdate: () => {

    //     this._game.cube.object.position.y = this._data.cubeY;
    //     this._game.controls.edges.position.y = this._data.cubeY;

    //   },
    // } );

    this._durations.zoom = duration;

    setTimeout( () => this._activeTransitions--, this._durations.zoom );

  }

  preferences( show ) {

    this._activeTransitions++;

    if ( typeof this._tweens.range === 'undefined' ) this._tweens.range = [];  
    else this._tweens.range.forEach( tween => { tween.stop(); tween = null; } )

    let tweenId = -1;
    let listMax = 0;

    const ranges = this._game.dom.prefs.querySelectorAll( '.range' );
    const easing = show ? Easing.Power.Out(2) : Easing.Power.In(3);

    ranges.forEach( ( range, rangeIndex ) => {

      const label = range.querySelector( '.range__label' );
      const track = range.querySelector( '.range__track-line' );
      const handle = range.querySelector( '.range__handle' );
      const list = range.querySelectorAll( '.range__list div' );

      const delay = rangeIndex * ( show ? 120 : 100 );

      label.style.opacity = show ? 0 : 1;
      track.style.opacity = show ? 0 : 1;
      handle.style.opacity = show ? 0 : 1;
      handle.style.pointerEvents = show ? 'all' : 'none';

      this._tweens.range[ tweenId++ ] = new Tween( {
        delay: show ? delay : delay,
        duration: 400,
        easing: easing,
        onUpdate: tween => {

          const translate = show ? ( 1 - tween.value ) : tween.value;
          const opacity = show ? tween.value : ( 1 - tween.value );

          label.style.transform = `translate3d(0, ${translate}em, 0)`;
          label.style.opacity = opacity;

        }
      } );

      this._tweens.range[ tweenId++ ] = new Tween( {
        delay: show ? delay + 100 : delay,
        duration: 400,
        easing: easing,
        onUpdate: tween => {

          const translate = show ? ( 1 - tween.value ) : tween.value;
          const scale = show ? tween.value : ( 1 - tween.value );
          const opacity = scale;

          track.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${scale}, 1, 1)`;
          track.style.opacity = opacity;

        }
      } );

      this._tweens.range[ tweenId++ ] = new Tween( {
        delay: show ? delay + 100 : delay,
        duration: 400,
        easing: easing,
        onUpdate: tween => {

          const translate = show ? ( 1 - tween.value ) : tween.value;
          const opacity = 1 - translate;
          const scale = 0.5 + opacity * 0.5;

          handle.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${scale}, ${scale}, ${scale})`;
          handle.style.opacity = opacity;

        }
      } );

      list.forEach( ( listItem, labelIndex ) => {

        listItem.style.opacity = show ? 0 : 1;

        this._tweens.range[ tweenId++ ] = new Tween( {
          delay: show ? delay + 200 + labelIndex * 50 : delay,
          duration: 400,
          easing: easing,
          onUpdate: tween => {

            const translate = show ? ( 1 - tween.value ) : tween.value;
            const opacity = show ? tween.value : ( 1 - tween.value );

            listItem.style.transform = `translate3d(0, ${translate}em, 0)`;
            listItem.style.opacity = opacity;

          }
        } );

      } );

      listMax = list.length > listMax ? list.length - 1 : listMax;

      range.style.opacity = 1;

    } );

    this._durations.preferences = show
      ? ( ( ranges.length - 1 ) * 100 ) + 200 + listMax * 50 + 400
      : ( ( ranges.length - 1 ) * 100 ) + 400;

    setTimeout( () => this._activeTransitions--, this._durations.preferences );

  }

  title( show ) {

    this._activeTransitions++;

    const title = this._game.dom.title;

    if ( title.querySelector( 'span i' ) === null )
      title.querySelectorAll( 'span' ).forEach( span => this.splitLetters( span ) );

    const letters = title.querySelectorAll( 'i' );

    this.flipLetters( 'title', letters, show );

    title.style.opacity = 1;

    const note = this._game.dom.note;

    this._tweens.title[ letters.length ] = new Tween( {
      target: note.style,
      easing: Easing.Sine.InOut(),
      duration: show ? 800 : 400,
      yoyo: show ? true : null,
      from: { opacity: show ? 0 : ( parseFloat( getComputedStyle( note ).opacity ) ) },
      to: { opacity: show ? 1 : 0 },
    } );

    setTimeout( () => this._activeTransitions--, this._durations.title );

  }

  timer( show ) {

    this._activeTransitions++;

    if ( ! show ) {

      this._game.controls.disable();
      this._game.timer.stop();

    }

    const timer = this._game.dom.timer;

    timer.style.opacity = 0;
    this._game.timer.convert();
    this._game.timer.setText();

    this.splitLetters( timer );
    const letters = timer.querySelectorAll( 'i' );
    this.flipLetters( 'timer', letters, show );

    timer.style.opacity = 1;

    if ( show && this._game.playing ) setTimeout( () => {

      this._game.controls.enable();
      this._game.timer.start( true );

    }, 1500 );

    setTimeout( () => this._activeTransitions--, this._durations.timer );

  }

  // Utilities

  splitLetters( element ) {

    const text = element.innerHTML;

    element.innerHTML = '';

    text.split( '' ).forEach( letter => {

      const i = document.createElement( 'i' );

      i.innerHTML = letter;

      element.appendChild( i );

    } );

  }

  flipLetters( type, letters, show ) {

    if ( typeof this._tweens[ type ] === 'undefined' ) this._tweens[ type ] = [];  
    else this._tweens[ type ].forEach( tween => { tween.stop(); tween = null; } )

    letters.forEach( ( letter, index ) => {

      letter.style.opacity = show ? 0 : 1;

      this._tweens[ type ][ index ] = new Tween( {
        easing: Easing.Sine.Out(),
        duration: show ? 800 : 400,
        delay: index * 50,
        onUpdate: tween => {

          const rotation = show ? ( 1 - tween.value ) * -80 : tween.value * 80;

          letter.style.transform = `rotate3d(0, 1, 0, ${rotation}deg)`;
          letter.style.opacity = show ? tween.value : ( 1 - tween.value );

        },
      } );

    } );

    this._durations[ type ] = ( letters.length - 1 ) * 50 + ( show ? 800 : 400 );

  }

}

export { Transition };
