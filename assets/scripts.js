const options = {
  helix: {
    count: 50,
    turns: 2,
    thickness: 3.8,
    particles: 100,
    length: 200,
    speed: 0.4,
    radius: [ 2, 10 ],
    color: [ '#02f', '#8ff' ]
  },
  blurScale: 0.25,
  ticking: true,
}


const stage = ( () => {

  const container = document.querySelector( '.hero__helix' )

  const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } )
  renderer.domElement.classList.add( 'hero__helix-main' )
  container.appendChild( renderer.domElement )

  const blur = new THREE.WebGLRenderer( { antialias: false, alpha: true } )
  blur.domElement.classList.add( 'hero__helix-blur' )
  container.appendChild( blur.domElement )

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera( 45, 0, 1, 10000 )
  camera.position.set( 0, 0, 120 )
  camera.lookAt( scene.position )

  const helix = new THREE.Object3D()
  helix.position.y = 12
  scene.add( helix )

  const clock = new THREE.Clock( false )

  const resize = () => {

    const dpi = window.devicePixelRatio
    const w = container.offsetWidth
    const h = container.offsetHeight

    helixes.forEach( helix => {
      helix.material.linewidth = options.helix.thickness * ( h / 650 )
      helix.material.resolution.set( w, h )
    } )

    renderer.setSize( w, h )
    renderer.setPixelRatio( dpi )

    blur.setSize( w * options.blurScale, h * options.blurScale )
    blur.setPixelRatio( dpi )

    camera.aspect = w / h
    camera.updateProjectionMatrix()

    scene.rotation.z = - Math.PI / 5 //( w < h ) ? Math.PI / 6 : 0

  }

  let stats

  if ( window.location.href.includes('stats') ) {

    stats = new Stats()
    container.appendChild( stats.dom )

  }

  const animate = () => {

    requestAnimationFrame( animate )

    if ( options.ticking ) {

      const time = clock.getElapsedTime()

      helix.rotation.x = - time * options.helix.speed

      helixes.forEach( ( helix, i ) =>
        helix.rotation.x = Math.sin( time + i ) * 0.15
      )

    }

    renderer.render( scene, camera )
    blur.render( scene, camera )

    if ( stats ) stats.update()

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
    helix.position.x = - o.length / 2
    stage.addHelix( helix )

    return helix

  } )

  return helixes

} )()

stage.init()
