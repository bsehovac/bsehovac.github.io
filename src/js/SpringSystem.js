let SpringSystem = ( () => {

  class Spring {

    constructor( system, id, options ) {

      options = Object.assign( {
        config: {},
        onUpdate: ( () => {} ),
        onComplete: ( () => {} ),
      }, options || {} );

      this._system = system;
      this._id = id;

      this._config = {
        stiffness: -30, // kg / s^2
        damping: -0.97, // kg / s
        mass: 0.1,      // kg
        velocityThreshold: 0.01,
        positionThreshold: 0.1,
      };

      this.setConfig( options.config );
      this.onUpdate( options.onUpdate );
      this.onComplete( options.onComplete );

      this._current = 0;
      this._target = 0;
      this._velocity = 0;

      this._update = this._update.bind( this );

    }

    _update( delta ) {

      const spring = ( this._current - this._target ) * this._config.stiffness;
      const damper = this._velocity * this._config.damping;
      const accelaration = ( spring + damper ) / this._config.mass;

      this._velocity += accelaration * ( delta / 1000 );
      this._current += this._velocity * ( delta / 1000 );

      this._onUpdate( this._current );

      const velocityThreshold = Math.abs( this._velocity ) < this._config.velocityThreshold;
      const positionThreshold = Math.abs( this._current - this._target ) < this._config.positionThreshold;

      if ( velocityThreshold && positionThreshold ) {

        this._stop();
        this._onUpdate( Math.round( this._current ) );
        this._onComplete( Math.round( this._current ) );

      }

    }

    _start() {

      this._system._addSpring( this );

      return this;

    }

    _stop() {

      this._system._removeSpring( this );

      return this;

    }

    setConfig( config ) {

      this._config = Object.assign( this._config, config || {} );

      return this;

    }

    setCurrent( v ) {

      this._current = v;
      this._start();

      return this;

    }

    setTarget( v ) {

      this._target = v;
      this._start();

      return this;

    }

    onUpdate( callback ) {

      this._onUpdate = callback;

      return this;

    }

    onComplete( callback ) {

      this._onComplete = callback;

      return this;

    }

  }

  class SpringSystem {

    constructor() {

      this._uniq = 0;
      this._ids = [];
      this._springs = {};
      this._update = this._update.bind( this );
      this._raf = 0;
      this._time = 0;

    }

    _update() {

      const now = performance.now();
      const delta = now - this._time
      this._time = now;

      let i = this._ids.length;

      this._raf = i ? requestAnimationFrame( this._update ) : 0;

      while ( i-- )
        this._springs[ this._ids[ i ] ] && this._springs[ this._ids[ i ] ]._update( delta );

    }

    _addSpring( spring ) {

      if ( this._ids.indexOf( spring._id ) < 0 ) {

        this._ids.push( spring._id );
        this._springs[ spring._id ] = spring;

      }

      if ( this._raf !== 0 ) return;

      this._time = performance.now();
      this._raf = requestAnimationFrame( this._update );

    }

    _removeSpring( spring ) {

      const index = this._ids.indexOf( spring._id );

      if ( index < 0 ) return;

      this._ids.splice( index, 1 );
      delete this._springs[ spring._id ];
      spring = null;

    }

    createSpring( options ) {

      options = Object.assign( {
        config: {},
        onUpdate: ( () => {} ),
        onComplete: ( () => {} ),
      }, options || {} );

      const spring = new Spring( this, this._uniq++, options );

      return spring;

    }

  }

  return SpringSystem;

} )();

const circle = document.createElement( 'div' );
circle.style.cssText = `
  position: fixed;
  left: 50vw;
  top: 50vh;
  width: 80px;
  height: 80px;
  border-radius: 40px;
  margin-top: -40px;
  margin-left: -40px;
  z-index: 9999;
  background: #0af;
`;
document.body.appendChild( circle );

const system = new SpringSystem()
const spring = system.createSpring( {
  config: { stiffness: -50, damping: -1.25 },
  onUpdate: current => circle.style.transform = `scale(${ 1 - current / 5 })`,
  onComplete: current => console.log( 'complete', circle.style.transform ),
} );

circle.onmousedown = event => spring.setTarget( 1 );
circle.onmouseup = event => spring.setTarget( 0 );