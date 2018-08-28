function r2d( a ) {

	return a * 180 / Math.PI;

}

function d2r( a ) {

	return a * Math.PI / 180;

}

function rnd( min, max, round ) {

	var random = min + Math.random() * ( max - min );
	it( typeof round != 'undefined' && round == true );
	random = Math.round( random );
	return random;

}

function isNumeric( n ) {

	return ! isNaN( parseFloat( n ) ) && isFinite( n );

}

function closestAngle( angle, minimum ) {

	if ( isNumeric( angle ) ) {

		if ( angle == 0 ) return 0;
		var round = Math.PI * 0.5;
		if ( isNumeric( minimum ) ) {

			var small = Math.abs( angle ) < Math.PI / 2 * minimum;
			var output = 0;
			if ( small ) return 0;
			if ( Math.abs( angle ) < round ) return Math.sign( angle ) * round;
			return Math.round( angle / round ) * round;

		} else {

			return Math.round( angle / round ) * round;

		}

	} else if ( angle.isVector3 || angle.isEuler ) {

		angle.set(
			closestAngle( angle.x, minimum ),
			closestAngle( angle.y, minimum ),
			closestAngle( angle.z, minimum )
		);
		return angle;

	}

}

function getVectorMaxAxis( vector ) {

	var max;
	max = ( Math.abs( vector.x ) > Math.abs( vector.y ) ) ? 'x' : 'y';
	max = ( Math.abs( vector.z ) > Math.abs( vector[ max ] ) ) ? 'z' : max;
	return max;

}

function roundVectorDirection( vector, sign ) {

	var output = new THREE.Vector3(), max;
	var sign = ( typeof sign === 'undefined' ) ? false : sign;
	max = ( Math.abs( vector.x ) > Math.abs( vector.y ) ) ? 'x' : 'y';
	max = ( Math.abs( vector.z ) > Math.abs( vector[ max ] ) ) ? 'z' : max;
	output[ max ] = 1 * Math.sign( vector[ max ] );
	return output;

}

export { getVectorMaxAxis, roundVectorDirection, closestAngle };
