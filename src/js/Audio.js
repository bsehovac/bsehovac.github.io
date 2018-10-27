import { Tween, Easing } from './Tween.js';

class Audio {

  constructor( game ) {

    this.game = game;
    this.volume = 0.2;
    this.volumeTween = null;

    const listener = new THREE.AudioListener();
    const audioLoader = new THREE.AudioLoader();

    this.music = new THREE.Audio( listener );

    audioLoader.load( 'assets/sounds/music.mp3', buffer => {

      this.music.setBuffer( buffer );
      this.music.setLoop( true );
      this.music.setVolume( 0 );

    });

    this.flip = new THREE.Audio( listener );

    audioLoader.load( 'assets/sounds/flip.mp3', buffer => {

      this.flip.setBuffer( buffer );
      this.flip.setLoop( false );
      this.flip.setVolume( this.volume );

    });

  }

  fadeMusic( play ) {

    if ( play ) this.music.play();

    if ( this.volumeTween != null ) this.volumeTween.stop();

    const from = this.music.getVolume();
    const to = play ? this.volume : 0;

    this.volumeTween = new Tween({
      duration: 500,
      onUpdate: tween => {

        const volume = from + ( to - from ) * tween.value;

        this.music.setVolume( volume );

      },
      onComplete: () => {

        if ( ! play ) this.music.pause();

      }
    });

  }

  setVolume( volume ) {

    this.flip.setVolume( this.volume );

  }

}

export { Audio };
