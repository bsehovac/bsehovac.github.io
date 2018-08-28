function roundAngle( angle, minimum ) {

  const round = Math.PI / 2;

  if ( angle == 0 ) return 0;

  if ( minimum !== false ) {

    if ( Math.abs( angle ) < round * minimum ) return 0;

    if ( Math.abs( angle ) < round ) return Math.sign( angle ) * round;

  }

  return Math.round( angle / round ) * round;

}

function roundVectorAngle( angle, minimum ) {

  angle.set(
    roundAngle( angle.x, minimum ),
    roundAngle( angle.y, minimum ),
    roundAngle( angle.z, minimum )
  );

  return angle;

}

export { roundAngle, roundVectorAngle };