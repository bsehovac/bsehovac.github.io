const options = {
  helix: {
    count: 50,
    turns: 2,
    speed: 0.4,
    radius: [ 2, 10 ],
    displacement: [ -2, 2 ],
    displacementSpeed: [ 0.1, 1 ],
    thickness: 1.75,
    particles: 1200,
    length: 200,
    color: [ '#02f', '#4cf' ]
  },
  bloom: {
    exposure: 1,
    strength: 0.4,
    radius: 0.4,
    threshold: 0.25,
  },
  ssaa: 1,
  ticking: true,
  dev: false,
}

const stage = ( () => {

  const container = document.querySelector( '.hero__helix' )

  const renderer = new THREE.WebGLRenderer( { antialias: false, alpha: false } )
  renderer.toneMapping = THREE.ReinhardToneMapping
  container.appendChild( renderer.domElement )

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera( 45, 0, 1, 10000 )
  camera.position.set( 0, 0, 120 )
  camera.lookAt( scene.position )

  const helix = new THREE.Object3D()
  helix.position.y = 9
  scene.add( helix )

  const clock = new THREE.Clock()

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
      helix.material.uniforms.dpi.value = dpi
      helix.material.uniforms.scale.value = h / 650
    } )

    passes.bloom.setSize( w, h )
    composer.setSize( w * dpi, h * dpi )
    renderer.setSize( w, h )
    renderer.setPixelRatio( dpi )

    camera.aspect = w / h
    camera.updateProjectionMatrix()

    scene.rotation.z = - Math.PI / 5 //( w < h ) ? Math.PI / 6 : 0

  }

  let dev

  if ( options.dev ) {

    dev = {
      stats: new Stats(),
      gui: new dat.GUI(),
    }

    container.appendChild( dev.stats.dom )

    dev.gui.add( options, 'ssaa', 0, 5 ).step( 1 ).onChange( v =>
      passes.ssaa.sampleLevel = Number ( v ) )

    dev.gui.add( options.bloom, 'exposure', 0.1, 2 ).step( 0.01 ).onChange( v =>
      renderer.toneMappingExposure = Math.pow( v, 4.0 ) )

    dev.gui.add( options.bloom, 'strength', 0.0, 3.0 ).step( 0.01 ).onChange( v =>
      passes.bloom.strength = Number( v ) )

    dev.gui.add( options.bloom, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( v =>
      passes.bloom.radius = Number( v ) )

    dev.gui.add( options.bloom, 'threshold', 0.0, 1.0 ).step( 0.01 ).onChange( v =>
      passes.bloom.threshold = Number( v ) )

    dev.gui.add( options.helix, 'thickness', 0.0, 3.0 ).step( 0.01 ).onChange( v =>
      helixes.forEach( helix => helix.material.uniforms.thickness.value = v ) )

    dev.gui.add( options, 'ticking' )

    dev.gui.closed = true

  }

  const animate = () => {

    const elapsedTime = clock.getElapsedTime()

    if ( options.ticking ) {
      helix.rotation.x = -elapsedTime * options.helix.speed
      helixes.forEach( helix => helix.material.uniforms.elapsedTime.value = elapsedTime )
    }

    composer.render()

    requestAnimationFrame( animate )

    if ( dev ) dev.stats.update()

  }

  const addHelix = object => helix.add( object )

  window.addEventListener( 'resize', resize, false )

  return { resize, animate, addHelix }

} )()

const helixes = ( () => {

  options.helix.color[ 0 ] = new THREE.Color( options.helix.color[ 0 ] )
  options.helix.color[ 1 ] = new THREE.Color( options.helix.color[ 1 ] )

  const material = new THREE.ShaderMaterial( {

    transparent: true,
    depthTest: true,

    uniforms: {
      elapsedTime:  { type: 'f',  value: 0 },
      thickness:    { type: 'f',  value: options.helix.thickness },
      color:        { type: 'c',  value: new THREE.Color( 0x000000 ) },
      len:          { type: 'f',  value: options.helix.length },
      speed:        { type: 'f',  value: 0 },
      displacement: { type: 'v2', value: new THREE.Vector2( 0, 0 ) },
      dpi:          { type: 'f',  value: 1 },
      scale:        { type: 'f',  value: 1 },
    },

    vertexShader: `

      uniform float thickness;
      uniform float len;
      uniform float speed;
      uniform float elapsedTime;
      uniform float dpi;
      uniform float scale;
      uniform vec2 displacement;

      void main() {
        vec3 pos = position;

        // pos.x = mod(pos.x - elapsedTime * 0.5, len);
        pos.y += cos(elapsedTime * speed) * displacement.x;
        pos.z += sin(elapsedTime * speed) * displacement.y;

        vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = thickness / length( mvPosition.xyz ) * 200.0 * dpi * scale;
      }`,

    fragmentShader: `

      uniform vec3 color;

      void main() {
        gl_FragColor = vec4( color, 1.0 );
      }`,

  } )

  const interpolate = ( a, b, interpolation ) => a + ( b - a ) * interpolation

  const interpolateColor = interpolation => options.helix.color[ 0 ].clone()
    .add( options.helix.color[ 1 ].clone().sub( options.helix.color[ 0 ] ).multiplyScalar( interpolation ) )

  const helixes = Array.from( { length: options.helix.count }, ( helix, h ) =>  {

    const interpolation = h / (options.helix.count - 1)

    helix = new THREE.Points( new THREE.Geometry(), material.clone() )
    helix.position.x = - options.helix.length / 2
    stage.addHelix( helix )

    helix.material.uniforms.color.value = interpolateColor( ( interpolation > 0.9 )
      ? interpolation - ( interpolation - 0.9 ) * 5
      : interpolation
    )

    helix.material.uniforms.speed.value = interpolate(
      options.helix.displacementSpeed[ 0 ],
      options.helix.displacementSpeed[ 1 ],
      Math.random()
    )

    helix.material.uniforms.displacement.value = new THREE.Vector2(
      interpolate( options.helix.displacement[ 0 ], options.helix.displacement[ 1 ], Math.random() ),
      interpolate( options.helix.displacement[ 0 ], options.helix.displacement[ 1 ], Math.random() )
    )

    const angleRandom = interpolate( -0.5, 0.5, Math.random() )
    const angle = Math.PI * 2 * options.helix.turns + angleRandom

    const interpolationRadius = Math.abs(interpolation * 2 - 1)
    const radius = interpolate( options.helix.radius[ 0 ], options.helix.radius[ 1 ], interpolationRadius )

    const angleInterpolation = Math.PI * interpolation

    Array.from( { length: options.helix.particles }, ( vertex, i ) =>  {

      const position = i / options.helix.particles

      vertex = new THREE.Vector3(
        position * options.helix.length,
        Math.cos( position * angle + angleInterpolation ) * radius,
        Math.sin( position * angle + angleInterpolation ) * radius
      )

      helix.geometry.vertices.push( vertex )

    } )

    return helix

  } )

  return helixes

} )()

stage.resize()
stage.animate()
