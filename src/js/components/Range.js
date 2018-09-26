import { Draggable } from './Draggable.js';

class Range {

  constructor( options ) {

    this.element = document.querySelector( options.element );
    this.handle = this.element.querySelector( options.handle );

    this.onUpdate = options.onUpdate;

    this.value = options.value * 1;
    this.min = options.values[0];
    this.max = options.values[1];
    this.step = options.step || 0;

    this.value = this.limit( this.value, this.min, this.max );
    this.handle.style.left = ( ( this.value - this.min ) / ( this.max - this.min ) * this.element.offsetWidth ) + 'px';

    this.initDraggable();

  }

  initDraggable() {

    const oldPosition = null;

    this.draggable = new Draggable( this.handle, { calcDelta: true } );

    this.draggable.onDragStart = position => {

      this.element.classList.add( 'is-active' );

    }

    this.draggable.onDragMove = position => {

      let left = this.handle.offsetLeft + this.handle.offsetWidth / 2;
      left += position.delta.x;
      left = this.limit( left, 0, this.element.offsetWidth );

      this.handle.style.left = left + 'px';
      
      this.value = this.min + ( this.max - this.min ) * ( left / this.element.offsetWidth );
      this.value = Math.round( this.limit( this.value, this.min, this.max ) );

      this.onUpdate( this.value );

    }

    this.draggable.onDragEnd = position => {

      this.element.classList.remove( 'is-active' );

    }

  }

  limit( value, min, max ) {

    return Math.min( Math.max( value, min ), max );

  }

}

export { Range };
