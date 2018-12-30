const options = {
  helix: {
    count: 50,
    turns: 2,
    thickness: 3.8,
    particles: 150,
    length: 200,
    speed: 0.4,
    radius: [ 2, 10 ],
    move: [ -1, 1 ],
    moveSpeed: [ 0.1, 0.5 ],
    color: [ '#02f', '#4cf' ]
  },
  bloom: {
    exposure: 1,
    strength: 0.4,
    radius: 0.8,
    threshold: 0.25,
  },
  ssaa: 1,
  postprocessing: true,
  ticking: true,
}


const stage = ( () => {

  const container = document.querySelector( '.hero__helix' )

  const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } )
  container.appendChild( renderer.domElement )

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera( 45, 0, 1, 10000 )
  camera.position.set( 0, 0, 120 )
  camera.lookAt( scene.position )

  const helix = new THREE.Object3D()
  helix.position.y = 12
  scene.add( helix )

  const clock = new THREE.Clock( false )

  const passes = {
    ssaa: new THREE.SSAARenderPass( scene, camera ),
    bloom: new THREE.UnrealBloomPass(
      new THREE.Vector2(),
      options.bloom.strength,
      options.bloom.radius,
      options.bloom.threshold
    ),
  }

  passes.ssaa.unbiased = false
  passes.ssaa.sampleLevel = options.ssaa
  passes.bloom.renderToScreen = true

  const composer = new THREE.EffectComposer( renderer )
  composer.addPass( passes.ssaa )
  composer.addPass( passes.bloom )

  const resize = () => {

    const dpi = window.devicePixelRatio
    const w = container.offsetWidth
    const h = container.offsetHeight

    helixes.forEach( helix => {
      helix.material.linewidth = options.helix.thickness * ( h / 650 )
      helix.material.resolution.set( w, h )
    } )

    passes.bloom.setSize( w, h )
    passes.ssaa.sampleLevel = dpi > 1 ? 0 : 1
    composer.setSize( w * dpi, h * dpi )
    renderer.setSize( w, h )
    renderer.setPixelRatio( dpi )

    camera.aspect = w / h
    camera.updateProjectionMatrix()

    scene.rotation.z = - Math.PI / 5 //( w < h ) ? Math.PI / 6 : 0

  }

  let dev

  if ( window.location.href.includes('dev') ) {

    dev = {
      stats: new Stats(),
      gui: new dat.GUI(),
    }

    dev.gui.closed = true

    container.appendChild( dev.stats.dom )

    dev.gui.add( options.bloom, 'strength', 0.0, 3.0 ).step( 0.01 ).onChange( v =>
      passes.bloom.strength = Number( v ) )

    dev.gui.add( options.bloom, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( v =>
      passes.bloom.radius = Number( v ) )

    dev.gui.add( options.bloom, 'threshold', 0.0, 1.0 ).step( 0.01 ).onChange( v =>
      passes.bloom.threshold = Number( v ) )

    dev.gui.add( options.helix, 'thickness', 1.0, 10.0 ).step( 0.01 ).onChange( resize )

    dev.gui.add( options, 'ticking' )

    dev.gui.add( options, 'postprocessing' )

  }

  let rotationSpeed = 5

  const animate = () => {

    if ( options.ticking ) {

      const time = clock.getElapsedTime()

      helix.rotation.x = - time * options.helix.speed

      helixes.forEach( ( helix, i ) => {

        helix.position.y = Math.cos(time * helix.userData.speed) * helix.userData.move.x
        helix.position.z = Math.sin(time * helix.userData.speed) * helix.userData.move.y

      } )

    }

    if ( options.postprocessing ) composer.render()
    else renderer.render( scene, camera )

    requestAnimationFrame( animate )

    if ( dev ) dev.stats.update()

  }

  const init = () => {

    resize()
    animate()
    clock.start()

  }

  const addHelix = object => helix.add( object )

  window.addEventListener( 'resize', resize, false )

  return { init, addHelix }

} )()


const helixes = ( () => {

  const o = options.helix

  o.color[ 0 ] = new THREE.Color( o.color[ 0 ] )
  o.color[ 1 ] = new THREE.Color( o.color[ 1 ] )

  const range = ( a, b, i ) => a + ( b - a ) * i

  const color = i => o.color[ 0 ].clone().add(
    o.color[ 1 ].clone().sub( o.color[ 0 ] ).multiplyScalar( i )
  )

  const helixes = Array.from( { length: o.count }, ( helix, i ) =>  {

    i = i / ( o.count - 1 )

    const angle = Math.PI * 2 * o.turns + range( -0.5, 0.5, Math.random() )
    const radius = range( o.radius[ 0 ], o.radius[ 1 ], Math.abs( i * 2 - 1) )
    const angleH = Math.PI * i
    const positions = []

    Array.from( { length: o.particles }, ( vertex, i ) =>  {

      i = i / o.particles

      positions.push(
        i * o.length,
        Math.cos( i * angle + angleH ) * radius,
        Math.sin( i * angle + angleH ) * radius
      )

    } )

    const geometry = new THREE.LineGeometry()
    geometry.setPositions( positions )

    const material = new THREE.LineMaterial( {
      color: color( ( i > 0.9 ) ? i - ( i - 0.9 ) * 5 : i )
    } )

    helix = new THREE.Line2( geometry, material )
    // helix.computeLineDistances()
    // helix.scale.set( 1, 1, 1 )
    helix.position.x = - o.length / 2
    stage.addHelix( helix )

    helix.userData.speed = range( o.moveSpeed[ 0 ], o.moveSpeed[ 1 ], Math.random() )

    helix.userData.move = new THREE.Vector2(
      range( o.move[ 0 ], o.move[ 1 ], Math.random() ),
      range( o.move[ 0 ], o.move[ 1 ], Math.random() )
    )

    return helix

  } )

  return helixes

} )()

stage.init()
