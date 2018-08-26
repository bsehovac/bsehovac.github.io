function eachObject( object, callback ) {

	for ( var key in object )
		if ( object.hasOwnProperty( key ) )
			callback( key, object[ key ] );

}

function randomObjectKey( object ) {

	var result;
	var count = 0;
	for ( var key in object )
		if ( object.hasOwnProperty( key ) )
			if ( Math.random() < 1 / ++ count )
				result = key;
	return result;

}

function randomArrayValue( array ) {

	return array[ Math.floor( Math.random() * array.length ) ];

}

function extendObject( options, defaults ) {

	var extended = {}, key;

	for ( key in defaults )
		if ( defaults.hasOwnProperty( key ) )
			extended[ key ] = defaults[ key ];

	for ( key in options )
		if ( options.hasOwnProperty( key ) )
			extended[ key ] = options[ key ];

	return extended;

}

export { eachObject, randomArrayValue, randomObjectKey, extendObject };
