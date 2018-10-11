import { Range } from './Range.js';

class Preferences {

  constructor( game ) {

    this._game = game;

  }

  init() {

    this._ranges = {

      speed: new Range( 'speed', {
        value: this._game.controls._flipSpeed,
        range: [ 300, 100 ],
        onUpdate: value => {

          this._game.controls._flipSpeed = value;
          this._game.controls._flipBounce = ( ( value - 100 ) / 200 ) * 2;

        },
        onComplete: () => this._game.storage.savePreferences(),
      } ),

      scramble: new Range( 'scramble', {
        value: this._game.scrambler.scrambleLength,
        range: [ 20, 30 ],
        step: 5,
        onUpdate: value => {

          this._game.scrambler.scrambleLength = value;

        },
        onComplete: () => this._game.storage.savePreferences()
      } ),

      fov: new Range( 'fov', {
        value: this._game.world.fov,
        range: [ 2, 45 ],
        onUpdate: value => {

          this._game.world.fov = value;
          this._game.world.resize();

        },
        onComplete: () => this._game.storage.savePreferences()
      } ),

      theme: new Range( 'theme', {
        value: 0,
        range: [ 0, 1 ],
        step: 1,
        onUpdate: value => {},
        // onComplete: () => this._game.storage.savePreferences()
      } ),

    };
    
  }

}

export { Preferences };
