const options = {
  count: 200,
  turns: 2,
  speed: 0.4,
  radius: { min: 2, max: 10 },
  displacement: { min: -2, max: 2 },
  displacementSpeed: { min: 0.1, max: 1 },
  thickness: 0.95,
  particles: 1000,
  length: 200,
  color: {
    start: new THREE.Color( '#02f' ),
    end: new THREE.Color( '#4cf' )
  },
}

const stage = ( () => {

  const container = document.querySelector( '.hero__helix' )

  const canvas = document.createElement( 'canvas' )
  const ctx = canvas.getContext( '2d' )
  container.appendChild( canvas )

  const renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true } )
  // container.appendChild( renderer.domElement )

  const scene = new THREE.Scene()
  scene.rotation.z = Math.PI / 4

  const camera = new THREE.PerspectiveCamera( 75, 0, 1, 10000 )
  camera.position.set( 0, 0, -75 )
  camera.lookAt( scene.position )

  const helix = new THREE.Object3D()
  helix.position.y = 7
  scene.add( helix )

  const clock = new THREE.Clock()

  const resize = () => {

    const w = container.offsetWidth
    const h = container.offsetHeight
    const dpi = window.devicePixelRatio

    canvas.width = w * dpi
    canvas.height = h * dpi

    helixes.forEach( helix => {
      helix.material.uniforms.dpi.value = dpi
      helix.material.uniforms.scale.value = h / 650
    } )

    renderer.setSize( w, h )
    renderer.setPixelRatio( dpi )

    camera.aspect = w / h
    camera.updateProjectionMatrix()

  }

  const animate = () => {

    const elapsedTime = clock.getElapsedTime()

    helix.rotation.x = -elapsedTime * options.speed
    helixes.forEach( helix => helix.material.uniforms.elapsedTime.value = elapsedTime )

    renderer.render( scene, camera )

    requestAnimationFrame( animate )

    ctx.clearRect( 0, 0, canvas.width, canvas.height )

    ctx.save()
    ctx.filter = 'blur(48px)'
    ctx.globalCompositeOperation = 'lighter'
    ctx.drawImage( renderer.domElement, 0, 0 )
    ctx.restore()

    ctx.drawImage( renderer.domElement, 0, 0 )

  }

  window.dbg = renderer

  const addHelix = object => helix.add( object )

  window.addEventListener( 'resize', resize, false )

  return { resize, animate, addHelix }

} )()

const helixes = ( () => {

  const material = new THREE.ShaderMaterial( {

    uniforms: {
      elapsedTime:  { type: 'f',  value: 0 },
      thickness:    { type: 'f',  value: options.thickness },
      color:        { type: 'c',  value: new THREE.Color( 0x000000 ) },
      len:          { type: 'f',  value: options.length },
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

  const interpolateColor = interpolation => options.color.start.clone()
    .add( options.color.end.clone().sub( options.color.start ).multiplyScalar( interpolation ) )

  return Array.from( { length: options.count }, ( helix, h ) =>  {

    const interpolation = h / (options.count - 1)

    helix = new THREE.Points( new THREE.Geometry(), material.clone() )
    helix.position.x = - options.length / 2
    stage.addHelix( helix )

    helix.material.uniforms.color.value = interpolateColor( ( interpolation > 0.9 )
      ? interpolation - ( interpolation - 0.9 ) * 5
      : interpolation
    )

    helix.material.uniforms.speed.value = interpolate(
      options.displacementSpeed.min,
      options.displacementSpeed.max,
      Math.random()
    )

    helix.material.uniforms.displacement.value = new THREE.Vector2(
      interpolate( options.displacement.min, options.displacement.max, Math.random() ),
      interpolate( options.displacement.min, options.displacement.max, Math.random() )
    )

    const angleRandom = interpolate( -0.5, 0.5, Math.random() )
    const angle = Math.PI * 2 * options.turns + angleRandom

    const interpolationRadius = Math.abs(interpolation * 2 - 1)
    const radius = interpolate( options.radius.min, options.radius.max, interpolationRadius )

    const angleInterpolation = Math.PI * interpolation

    Array.from( { length: options.particles }, ( vertex, i ) =>  {

      const position = i / options.particles

      vertex = new THREE.Vector3(
        position * options.length,
        Math.cos( position * angle + angleInterpolation ) * radius,
        Math.sin( position * angle + angleInterpolation ) * radius
      )

      helix.geometry.vertices.push( vertex )

    } )

    return helix

  } )

} )()

stage.resize()
stage.animate()
