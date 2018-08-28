class Shatter {

	constructor( cube ) {

		const shatter = this;
		const controls = cube.controls;

		const positions = [];
		//var rotations = [];

		cube.pieces.forEach( piece => {

			positions.push( piece.position.clone() );
			//rotations.push( piece.rotation.toVector3() );

		} );

		shatter.cube = cube;
		shatter.controls = controls;
		shatter.positions = positions;

	}

	start() {

		const shatter = this;
		const cube = shatter.cube;
		const controls = shatter.controls;

		controls.disabled = true;

		cube.pieces.forEach( piece => {

			const speed = 0.5;
			const displacement = piece.position.clone().multiplyScalar( 1 + Math.random() * 2 );

			// TweenMax.to( cube.object.rotation, speed, {
			//   x: -0.2,
			//   z: 0.2,
			//   ease: Elastic.easeOut.config( 1.25, 1 )
			// } );

			TweenMax.to( piece.position, speed, {
				x: displacement.x,
				y: displacement.y,
				z: displacement.z,
				ease: Elastic.easeOut.config( 1.25, 1 )
			} );

		} );

	}

	restore() {

		const shatter = this;
		const cube = shatter.cube;
		const controls = shatter.controls;

		controls.disabled = false;

		cube.pieces.forEach( piece => {

			const speed = 0.5;

			TweenMax.to( piece.position, speed, {
				x: shatter.positions[ i ].x,
				y: shatter.positions[ i ].y,
				z: shatter.positions[ i ].z,
				ease: Elastic.easeOut.config( 1.25, 1 )
			} );

			TweenMax.to( cube.object.rotation, speed, {
				x: 0,
				y: 0,
				z: 0,
				ease: Elastic.easeOut.config( 1.25, 1 )
			} );

		} );

	}

}

export { Shatter };
