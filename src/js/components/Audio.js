class Audio {

  constructor( button, animate ) {

    this.button = button;
    this.animate = animate;

    this.listener = new THREE.AudioListener();

    this.music = new THREE.Audio( this.listener );
    this.click = new THREE.Audio( this.listener );

    this.musicOn = localStorage.getItem( 'music' );
    this.musicOn = ( this.musicOn == null ) ? false : ( ( this.musicOn == 'true' ) ? true : false );

    const audioLoader = new THREE.AudioLoader();

    audioLoader.load( 'assets/sounds/music.mp3', buffer => {

      this.music.setBuffer( buffer );
      this.music.setLoop( true );
      this.music.setVolume( 0.5 );

      if ( this.musicOn ) {

        this.animate.audioIn( this );

      }

    });

    audioLoader.load( 'assets/sounds/click.mp3', buffer => {

      this.click.setBuffer( buffer );
      this.click.setLoop( false );
      this.click.setVolume( 0.5 );

    });

    this.button.addEventListener( 'click', () => {

      this.musicOn = !this.musicOn;

      if ( this.musicOn && !this.button.gameStarted ) {

        this.animate.audioIn( this );

      } else {

        this.animate.audioOut( this );

      }

      this.button.classList[ this.musicOn ? 'add' : 'remove' ]('is-active');

      localStorage.setItem( 'music', this.musicOn );

    }, false );

  }

}

export { Audio };
