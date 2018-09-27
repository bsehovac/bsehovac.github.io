import { Draggable } from './Draggable.js';

class Range {

  constructor( name, options ) {

    options = Object.assign( {
      range: [ 0, 1 ],
      value: 0,
      step: 0,
      list: { values: [], labels: [] },
      onUpdate: () => {},
      onComplete: () => {},
    }, options || {} );

    this.element = document.querySelector( '.range[type="' + name + '"]' );
    this.track = this.element.querySelector( '.range__track' );
    this.handle = this.element.querySelector( '.range__handle' );

    this.value = options.value;
    this.min = options.range[0];
    this.max = options.range[1];
    this.step = options.step;

    this.onUpdate = options.onUpdate;
    this.onComplete = options.onComplete;

    this.value = this.round( this.limitValue( this.value ) );
    this.setHandlePosition();

    this.initDraggable();
    this.createList( options.list );

  }

  createList( list ) {

    if ( list.values.length < 1 ) return;

    const listElement = this.element.querySelector( '.range__list' );

    list.values.forEach( ( position, index ) => {

      const itemElement = document.createElement( 'div' );
      itemElement.classList.add( 'range__list-item' );
      itemElement.style.left = position + '%';

      const itemLabel = document.createElement( 'div' );
      itemLabel.classList.add( 'range__list-label' );
      itemLabel.innerHTML = list.labels[ index ];

      itemElement.appendChild( itemLabel );
      listElement.appendChild( itemElement );

    } );

  }

  initDraggable() {

    const oldPosition = null;

    let current;

    this.draggable = new Draggable( this.handle, { calcDelta: true } );

    this.draggable.onDragStart = position => {

      current = this.positionFromValue( this.value );
      this.handle.style.left = current + 'px';
      this.element.classList.add( 'is-active' );

    }

    this.draggable.onDragMove = position => {

      current = this.limitPosition( current + position.delta.x );
      this.value = this.round( this.valueFromPosition( current ) );
      this.setHandlePosition();
      
      this.onUpdate( this.value );

    }

    this.draggable.onDragEnd = position => {

      this.element.classList.remove( 'is-active' );
      this.onComplete( this.value );

    }

  }

  round( value ) {

    if ( this.step < 1 ) return value;

    return Math.round( ( value - this.min ) / this.step ) * this.step + this.min;

  }

  limitValue( value ) {

    return Math.min( Math.max( value, this.min ), this.max );

  }

  limitPosition( position ) {

    return Math.min( Math.max( position, 0 ), this.track.offsetWidth );

  }

  percentsFromValue( value ) {

    return ( value - this.min ) / ( this.max - this.min );

  }

  valueFromPosition( position ) {

    return this.min + ( this.max - this.min ) * ( position / this.track.offsetWidth );

  }

  positionFromValue( value ) {

    return this.percentsFromValue( value ) * this.track.offsetWidth;

  }

  setHandlePosition() {

    this.handle.style.left = this.percentsFromValue( this.value ) * 100 + '%';

  }

}

export { Range };
