class Game {

  constructor( container ) {

    this.world = new RUBIK.World( container );
    this.cube = new RUBIK.Cube( 3 );
    this.controls = new RUBIK.Controls( this.cube );

    this.world.addCube( this.cube );
    this.world.addControls( this.controls );

  }

  start() {


  }

}

export { Game };