import { Range } from './Range.js';

class Preferences {

  constructor( game ) {

    this.game = game;

  }

  init() {

    this.ranges = {

      speed: new Range( 'speed', {
        value: this.game.controls.flipSpeed,
        range: [ 300, 100 ],
        onUpdate: value => {

          this.game.controls.flipSpeed = value;
          this.game.controls.flipBounce = ( ( value - 100 ) / 200 ) * 2;

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
        value: 0,
        range: [ 0, 1 ],
        step: 1,
        onUpdate: value => {},
        // onComplete: () => this.game.storage.savePreferences()
      } ),

    };
    
  }

}

export { Preferences };
