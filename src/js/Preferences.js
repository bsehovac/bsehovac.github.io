import { Range } from './Range.js';

class Preferences {

  constructor( game ) {

    this.game = game;

    this.load();

    this.elements = {

      speed: new Range( 'speed', {
        value: this.game.controls._flipSpeed,
        range: [ 300, 100 ],
        onComplete: value => {

          this.game.controls._flipSpeed = value;
          localStorage.setItem( 'flipSpeed', value );

          this.game.controls._flipBounce = ( ( value - 100 ) / 200 ) * 2;
          localStorage.setItem( 'flipBounce', this.game.controls._flipBounce );
          
        },
      } ),

      scramble: new Range( 'scramble', {
        value: this.game.scrambler.scrambleLength,
        range: [ 20, 30 ],
        step: 5,
        onComplete: value => {

          this.game.scrambler.scrambleLength = value;
          localStorage.setItem( 'scrambleLength', value );

        },
      } ),

      fov: new Range( 'fov', {
        value: this.game.world.fov,
        range: [ 2, 45 ],
        onUpdate: value => {

          this.game.world.fov = value;
          this.game.world.resize();

        },
        onComplete: value => {

          localStorage.setItem( 'fov', value );

        },
      } ),

      theme: new Range( 'theme', {
        value: 0,
        range: [ 0, 1 ],
        step: 1,
        onUpdate: value => {},
      } ),

    };

  }

  load() {

    const flipSpeed = localStorage.getItem( 'flipSpeed' );
    const flipBounce = localStorage.getItem( 'flipBounce' );
    const scrambleLength = localStorage.getItem( 'scrambleLength' );
    const fov = localStorage.getItem( 'fov' );
    // const theme = localStorage.getItem( 'theme' );

    if ( flipSpeed != null ) this.game.controls._flipSpeed = parseFloat( flipSpeed );
    if ( flipBounce != null ) this.game.controls._flipBounce = parseFloat( flipBounce );
    if ( scrambleLength != null ) this.game.scrambler.scrambleLength = parseInt( scrambleLength );

    if ( fov != null ) {

      this.game.world.fov = parseFloat( fov );
      this.game.world.resize();

    }

  }

}

export { Preferences };
