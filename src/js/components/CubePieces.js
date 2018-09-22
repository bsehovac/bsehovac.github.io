import { RoundedBoxGeometry } from './plugins/RoundedBoxGeometry.js';

function CubePieces( size, positions, colors ) {

	const pieces = [];
	const edges = [];

	const edgeScale = 0.85;
	const edgeRoundness = 0.1;
	const pieceRoundness = 0.1;
	const edgeDepth = 0.01;
	const pieceSize = 1 / size;

	const pieceMesh = new THREE.Mesh(
		new RoundedBoxGeometry( pieceSize, pieceSize, pieceSize, pieceSize * pieceRoundness, 3 ),
		new THREE.MeshStandardMaterial( {
			color: colors.piece,
			side: THREE.FrontSide,
			roughness: 1,
			metalness: 0.5,
		} )
	);

	const edgeGeometry = RoundedPlaneGeometry( - pieceSize / 2, - pieceSize / 2, pieceSize, pieceSize, pieceSize * edgeRoundness, edgeDepth );
	const edgeMaterial = new THREE.MeshStandardMaterial( {
		color: colors.piece,
		side: THREE.FrontSide,
		roughness: 1,
		metalness: 0.5,
	} );

	positions.forEach( ( position, index ) => {

		const piece = new THREE.Object3D();
		const pieceCube = pieceMesh.clone();
		const edges = [];

		piece.position.copy( position.clone().divideScalar( size ) );
		piece.add( pieceCube );
		piece.name = index;

		position.edges.forEach( position => {

			const edge = createEdge( position );
			piece.add( edge );
			edges.push( [ 'left', 'right', 'bottom', 'top', 'back', 'front' ][ position ] );

		} );

		piece.userData.edges = edges;
		piece.userData.cube = pieceCube;

		pieces.push( piece );

	} );

	return pieces;

	function createEdge( position ) {

		const distance = pieceSize / 2;
		const edge = new THREE.Mesh(
		  edgeGeometry,
		  edgeMaterial.clone()
		);

		edge.position.set(
		  distance * [ - 1, 1, 0, 0, 0, 0 ][ position ],
		  distance * [ 0, 0, - 1, 1, 0, 0 ][ position ],
		  distance * [ 0, 0, 0, 0, - 1, 1 ][ position ]
		);

		edge.rotation.set(
		  Math.PI / 2 * [ 0, 0, 1, - 1, 0, 0 ][ position ],
		  Math.PI / 2 * [ - 1, 1, 0, 0, 2, 0 ][ position ],
	  	0
		);

		edge.material.color.setHex( colors[ [ 'left', 'right', 'bottom', 'top', 'back', 'front' ][ position ] ] );
		edge.scale.set( edgeScale, edgeScale, edgeScale );

		return edge;

	}

	function RoundedPlaneGeometry( x, y, width, height, radius, depth ) {

		const shape = new THREE.Shape();

		shape.moveTo( x, y + radius );
		shape.lineTo( x, y + height - radius );
		shape.quadraticCurveTo( x, y + height, x + radius, y + height );
		shape.lineTo( x + width - radius, y + height );
		shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
		shape.lineTo( x + width, y + radius );
		shape.quadraticCurveTo( x + width, y, x + width - radius, y );
		shape.lineTo( x + radius, y );
		shape.quadraticCurveTo( x, y, x, y + radius );

		const geometry = new THREE.ExtrudeBufferGeometry( shape, { depth: depth, bevelEnabled: false, curveSegments: 3 } );

		return geometry;

	}

}

export { CubePieces };
