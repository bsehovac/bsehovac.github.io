import { Range } from './Range.js';

class Preferences {

  constructor( game ) {

    this.game = game;

  }

  init() {

    const getProgressInRange = ( value, start, end ) => {

      return Math.min( Math.max( (value - start) / (end - start), 0 ), 1 );
      
    }

    this.ranges = {

      speed: new Range( 'speed', {
        value: this.game.controls.flipSpeed,
        range: [ 400, 100 ], 
        onUpdate: value => {

          this.game.controls.flipSpeed = value;
          this.game.controls.flipBounce = getProgressInRange( value, 100, 400 ) * 2.5;

        },
        onComplete: () => this.game.storage.savePreferences(),
      } ),

      scramble: new Range( 'scramble', {
        value: this.game.scrambler.scrambleLength,
        range: [ 20, 30 ],
        step: 5,
        onUpdate: value => {

          this.game.scrambler.scrambleLength = value;

        },
        onComplete: () => this.game.storage.savePreferences()
      } ),

      fov: new Range( 'fov', {
        value: this.game.world.fov,
        range: [ 2, 45 ],
        onUpdate: value => {

          this.game.world.fov = value;
          this.game.world.resize();

        },
        onComplete: () => this.game.storage.savePreferences()
      } ),

      theme: new Range( 'theme', {
        value: { cube: 0, erno: 1, camo: 2, leaf: 3, rain: 4 }[ this.game.cube.theme ],
        range: [ 0, 4 ],
        step: 1,
        onUpdate: value => {

          const theme = [ 'cube', 'erno', 'camo', 'leaf', 'rain' ][ value ]
          this.game.cube.setTheme( theme );

        },
        onComplete: () => this.game.storage.savePreferences()
      } ),

    };
    
  }

}

export { Preferences };
