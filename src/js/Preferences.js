import { Range } from './Range.js';

class Preferences {

  constructor( game ) {

    this.game = game;
    this.theme = 'modern';

  }

  init() {

    const getProgressInRange = ( value, start, end ) => {

      return Math.min( Math.max( (value - start) / (end - start), 0 ), 1 );
      
    }

    this.ranges = {

      speed: new Range( 'speed', {
        value: this.game.controls.flipSpeed,
        range: [ 350, 100 ], 
        onUpdate: value => {

          this.game.controls.flipSpeed = value;
          this.game.controls.flipBounce = getProgressInRange( value, 100, 350 ) * 2.125;

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
        value: this.theme === 'default' ? 0 : 1,
        range: [ 0, 1 ],
        step: 1,
        onUpdate: value => {

          this.theme = value === 0 ? 'default' : 'original';

        },
        onComplete: () => this.game.storage.savePreferences()
      } ),

    };
    
  }

}

export { Preferences };
