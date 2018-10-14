import { Tween, Easing } from './Tween.js';

class Transition {

  constructor( game ) {

    this.game = game;

    this.tweens = {};
    this.durations = {};
    this.data = {};

    this.activeTransitions = 0;

  }

  init() {

    this.data.cubeY = -0.2;
    this.data.cameraZoom = 0.85;

    this.game.controls.disable();

    this.game.cube.object.position.y = this.data.cubeY;
    this.game.controls.edges.position.y = this.data.cubeY;
    this.game.cube.animator.position.y = 4;
    this.game.cube.animator.rotation.x = - Math.PI / 3;
    this.game.world.camera.zoom = this.data.cameraZoom;
    this.game.world.camera.updateProjectionMatrix();

    this.tweens.buttons = {};
    this.tweens.timer = [];
    this.tweens.title = [];
    this.tweens.range = [];
    this.tweens.stats = [];

  }

  buttons( show, hide ) {

    const buttonTween = ( button, show ) => {

      return new Tween( {
        target: button.style,
        duration: 300,
        easing: show ? Easing.Power.Out( 2 ) : Easing.Power.In( 3 ),
        from: { opacity: show ? 0 : 1 },
        to: { opacity: show ? 1 : 0 },
        onUpdate: tween => {

          // const scale = show ? tween.value : 1 - tween.value;
          const translate = show ? 1 - tween.value : tween.value;

          // button.style.transform = `scale3d(${scale}, ${scale}, 1)`;
          button.style.transform = `translate3d(0, ${translate * 1.5}em, 0)`;

        },
        onComplete: () => {

          button.style.pointerEvents = show ? 'all' : 'none';

        }
      } );

    }

    hide.forEach( button =>
      this.tweens.buttons[ button ] = buttonTween( this.game.dom.buttons[ button ], false )
    );

    setTimeout( () => show.forEach( button =>
      this.tweens.buttons[ button ] = buttonTween( this.game.dom.buttons[ button ], true )
    ), hide ? 500 : 0 );

  }

  cube( show ) {

    this.activeTransitions++;

    try { this.tweens.cube.stop() } catch(e) {};

    const currentY = this.game.cube.animator.position.y;
    const currentRotation = this.game.cube.animator.rotation.x;

    this.tweens.cube = new Tween( {
      duration: show ? 3000 : 1250,
      easing: show ? Easing.Elastic.Out( 0.8, 0.6 ) : Easing.Back.In( 1 ),
      onUpdate: tween => {

        this.game.cube.animator.position.y = show
          ? ( 1 - tween.value ) * 4
          : currentY + tween.value * 4;

        this.game.cube.animator.rotation.x = show
          ? ( 1 - tween.value ) * Math.PI / 3
          : currentRotation + tween.value * - Math.PI / 3;

      }
    } );

    this.durations.cube = show ? 1500 : 1500;

    setTimeout( () => this.activeTransitions--, this.durations.cube );

  }

  float() {

    try { this.tweens.float.stop() } catch(e) {};

    this.tweens.float = new Tween( {
      duration: 1500,
      easing: Easing.Sine.InOut(),
      yoyo: true,
      onUpdate: tween => {

        this.game.cube.holder.position.y = (- 0.02 + tween.value * 0.04); 
        this.game.cube.holder.rotation.x = 0.005 - tween.value * 0.01;
        this.game.cube.holder.rotation.z = - this.game.cube.holder.rotation.x;
        this.game.cube.holder.rotation.y = this.game.cube.holder.rotation.x;

      },
    } );

  }

  zoom( game, time ) {

    this.activeTransitions++;

    const zoom = ( game ) ? 1 : this.data.cameraZoom;
    const cubeY = ( game ) ? -0.3 : this.data.cubeY;
    const duration = ( time > 0 ) ? Math.max( time, 1500 ) : 1500;
    const rotations = ( time > 0 ) ? Math.round( duration / 1500 ) : 1;
    const easing = Easing.Power.InOut( ( time > 0 ) ? 2 : 3 );

    this.tweens.zoom = new Tween( {
      target: this.game.world.camera,
      duration: duration,
      easing: easing,
      to: { zoom: zoom },
      onUpdate: () => { this.game.world.camera.updateProjectionMatrix(); },
    } );

    this.tweens.rotate = new Tween( {
      target: this.game.cube.animator.rotation,
      duration: duration,
      easing: easing,
      to: { y: - Math.PI * 2 * rotations },
      onComplete: () => { this.game.cube.animator.rotation.y = 0; },
    } );

    this.durations.zoom = duration;

    setTimeout( () => this.activeTransitions--, this.durations.zoom );

  }

  stats( show ) {

    this.activeTransitions++;

    this.tweens.stats.forEach( tween => { tween.stop(); tween = null; } );

    let tweenId = -1;

    const stats = this.game.dom.stats.querySelectorAll( '.stats' );
    const easing = show ? Easing.Power.Out( 2 ) : Easing.Power.In( 3 );

    stats.forEach( ( stat, index ) => {

      const delay = index * ( show ? 80 : 60 );

      this.tweens.stats[ tweenId++ ] = new Tween( {
        delay: delay,
        duration: 400,
        easing: easing,
        onUpdate: tween => {

          const translate = show ? ( 1 - tween.value ) : tween.value;
          const opacity = show ? tween.value : ( 1 - tween.value );

          stat.style.transform = `translate3d(0, ${translate}em, 0)`;
          stat.style.opacity = opacity;

        }
      } );

    } );

    this.durations.stats = 0;

    setTimeout( () => this.activeTransitions--, this.durations.stats );

  }

  preferences( show ) {

    this.activeTransitions++;

    this.tweens.range.forEach( tween => { tween.stop(); tween = null; } );

    let tweenId = -1;
    let listMax = 0;

    const ranges = this.game.dom.prefs.querySelectorAll( '.range' );
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

      this.tweens.range[ tweenId++ ] = new Tween( {
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

      this.tweens.range[ tweenId++ ] = new Tween( {
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

      this.tweens.range[ tweenId++ ] = new Tween( {
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

        this.tweens.range[ tweenId++ ] = new Tween( {
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

    this.durations.preferences = show
      ? ( ( ranges.length - 1 ) * 100 ) + 200 + listMax * 50 + 400
      : ( ( ranges.length - 1 ) * 100 ) + 400;

    setTimeout( () => this.activeTransitions--, this.durations.preferences );

  }

  title( show ) {

    this.activeTransitions++;

    const title = this.game.dom.texts.title;

    if ( title.querySelector( 'span i' ) === null )
      title.querySelectorAll( 'span' ).forEach( span => this.splitLetters( span ) );

    const letters = title.querySelectorAll( 'i' );

    this.flipLetters( 'title', letters, show );

    title.style.opacity = 1;

    const note = this.game.dom.texts.note;

    this.tweens.title[ letters.length ] = new Tween( {
      target: note.style,
      easing: Easing.Sine.InOut(),
      duration: show ? 800 : 400,
      yoyo: show ? true : null,
      from: { opacity: show ? 0 : ( parseFloat( getComputedStyle( note ).opacity ) ) },
      to: { opacity: show ? 1 : 0 },
    } );

    setTimeout( () => this.activeTransitions--, this.durations.title );

  }

  timer( show ) {

    this.activeTransitions++;

    if ( ! show ) {

      this.game.controls.disable();
      this.game.timer.stop();

    }

    const timer = this.game.dom.texts.timer;

    timer.style.opacity = 0;
    this.game.timer.convert();
    this.game.timer.setText();

    this.splitLetters( timer );
    const letters = timer.querySelectorAll( 'i' );
    this.flipLetters( 'timer', letters, show );

    timer.style.opacity = 1;

    if ( show ) setTimeout( () => {

      this.game.controls.enable();
      this.game.timer.start( true );

    }, 1000 );

    setTimeout( () => this.activeTransitions--, this.durations.timer );

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

    if ( typeof this.tweens[ type ] === 'undefined' ) this.tweens[ type ] = [];  
    else this.tweens[ type ].forEach( tween => { tween.stop(); tween = null; } )

    letters.forEach( ( letter, index ) => {

      letter.style.opacity = show ? 0 : 1;

      this.tweens[ type ][ index ] = new Tween( {
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

    this.durations[ type ] = ( letters.length - 1 ) * 50 + ( show ? 800 : 400 );

  }

}

export { Transition };
