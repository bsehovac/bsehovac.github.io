import { RoundedBoxGeometry } from './geometries/RoundedBoxGeometry.js';
import { RoundedPlaneGeometry } from './geometries/RoundedPlaneGeometry.js';

function CubePieces( size, colors ) {

	const pieces = [];
	const edges = [];

	const edgeScale = 0.88;
	const edgeRoundness = 0.1;
	const pieceRoundness = 0.085;
	const edgeDepth = 0.01;
	const pieceSize = 1 / size;

	const pieceMesh = new THREE.Mesh(
		new RoundedBoxGeometry( pieceSize, pieceSize, pieceSize, pieceSize * pieceRoundness, 3 ),
		new THREE.MeshBasicMaterial( { color: colors.piece } )
	);

	const helper = new THREE.Mesh(
		new THREE.PlaneGeometry( pieceSize, pieceSize, pieceSize ),
		new THREE.MeshBasicMaterial( { depthWrite: false, side: THREE.DoubleSide, transparent: true, opacity: 0 } )
	);

	const edgeGeometry = RoundedPlaneGeometry( - pieceSize / 2, - pieceSize / 2, pieceSize, pieceSize, pieceSize * edgeRoundness, edgeDepth );
	const edgeMaterial = new THREE.MeshLambertMaterial( { color: colors.piece, side: THREE.FrontSide } );

	for ( let xx = 0, place = 0; xx < size; xx ++ ) {

		for ( let yy = 0; yy < size; yy ++ ) {

	  for ( let zz = 0; zz < size; zz ++ ) {

				const x = - 0.5 + pieceSize / 2 + pieceSize * xx;
				const y = - 0.5 + pieceSize / 2 + pieceSize * yy;
				const z = - 0.5 + pieceSize / 2 + pieceSize * zz;

				const piece = new THREE.Object3D();
				const pieceCube = pieceMesh.clone();
				let edge;

				piece.position.set( x, y, z );
				piece.add( pieceCube );

				piece.place = place;
				place ++;

				if ( xx == 0 || xx == size - 1 ) {

		  edge = createEdge( ( xx == 0 ) ? 0 : 1 ); // 0 - left, 1 - right
		  piece.add( edge[ 0 ], edge[ 1 ] );

				}
				if ( yy == 0 || yy == size - 1 ) {

		  edge = createEdge( ( yy == 0 ) ? 2 : 3 ); // 2 - bottom, 3 - top
		  piece.add( edge[ 0 ], edge[ 1 ] );

				}
				if ( zz == 0 || zz == size - 1 ) {

		  edge = createEdge( ( zz == 0 ) ? 4 : 5 ); // 4 - back, 5 - front
		  piece.add( edge[ 0 ], edge[ 1 ] );

				}

				pieces.push( piece );

	  }

		}

	}

	function createEdge( position ) {

		const edge = new THREE.Mesh(
	  edgeGeometry,
	  edgeMaterial.clone()
		);
		const distance = pieceSize / 2;

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

		const edgeHelper = helper.clone();
		edgeHelper.position.copy( edge.position );
		edgeHelper.rotation.copy( edge.rotation );
		edges.push( edgeHelper );

		return [ edge, edgeHelper ];

	}

	this.pieces = pieces;
	this.edges = edges;

}

export { CubePieces };
