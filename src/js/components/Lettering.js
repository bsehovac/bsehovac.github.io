const Lettering = element => {

  const text = element.innerHTML;

  element.innerHTML = '';

  text.split( '' ).forEach( letter => {

    const i = document.createElement( 'i' );

    i.innerHTML = letter;

    element.appendChild( i );

  } );

}

export { Lettering };