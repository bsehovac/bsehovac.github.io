const options = {
  count: 100,
  particles: 30,
  width: 1.25,
  length: 100,
  radius: 8,
  color: [ '#02f', '#8ff' ]
}

const stage = ( () => {

  const container = document.querySelector( '.hero__helix' )

  const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } )
  container.appendChild( renderer.domElement )

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera( 45, 0, 1, 10000 )
  camera.position.set( 0, 0, 80 )
  camera.lookAt( scene.position )

  const helix = new THREE.Object3D()
  helix.position.y = 9
  scene.add( helix )

  const resize = () => {

    const dpi = window.devicePixelRatio
    const w = container.offsetWidth
    const h = container.offsetHeight

    helixes.forEach( helix =>
      helix.material.uniforms.width.value = ( h / 650 ) * 200.0 * dpi * options.width
    )

    renderer.setSize( w, h )
    renderer.setPixelRatio( dpi )

    camera.aspect = w / h
    camera.updateProjectionMatrix()

    scene.rotation.z = - Math.PI / 5

  }

  const clock = new THREE.Clock()

  const stats = new Stats()
  container.appendChild( stats.dom )

  const animate = () => {

    requestAnimationFrame( animate )

    const time = clock.getElapsedTime()
    
    helixes.forEach( helix => helix.material.uniforms.time.value = time * 0.25 )
    
    renderer.render( scene, camera )

    stats.update()

  }

  const add = object => helix.add( object )

  const init = () => {

    resize()
    animate()

  }

  window.addEventListener( 'resize', resize, false )

  return { add, init }

} )()

const helixes = ( o => {

  const material = new THREE.ShaderMaterial( {

    transparent: true,
    depthTest: true,

    uniforms: {
      time:  0.0,
      width: 0.0,
      turns: 0.0,
      speed: 0.0,
      color: new THREE.Color(),
    },

    vertexShader: `

      uniform float width;
      uniform float time;
      uniform float turns;
      uniform float speed;

      const float pi = 3.14159265358;

      void main() {

        vec3 pos = position;

        float a = time + position.x * turns;
        pos.z = position.z * cos(a) - position.y * sin(a); // + cos(speed + time) * 0.5;
        pos.y = position.z * sin(a) + position.y * cos(a); // + cos(speed + time) * 0.5;

        vec4 mvpos = modelViewMatrix * vec4( pos.xyz, 1.0 );

        gl_Position = projectionMatrix * mvpos;
        gl_PointSize = width / length( mvpos.xyz );

      }`,

    fragmentShader: `

      uniform vec3 color;
      // uniform sampler2D texture;
      // varying vec2 vUv;

      void main() {

        // vec4 sprite = texture2D(texture, vUv);

        gl_FragColor = vec4( color, 1.0 );

      }`,

  } )



  const c1 = new THREE.Color( o.color[ 0 ] )
  const c2 = new THREE.Color( o.color[ 1 ] )

  const range = ( a, b, i ) => a + ( b - a ) * i

  const color = i => c1.clone()
    .add( c2.clone().sub( c1 ).multiplyScalar( i ) )

  const rndCircle = r => {
    const p = Math.random() * 2 * Math.PI;
    const t = Math.random() * r * r;
    return {
      x: Math.sqrt( t ) * Math.cos( p ),
      y: Math.sqrt( t ) * Math.sin( p )
    }
  }

  const helixes = Array.from( { length: o.count }, ( helix, h ) =>  {

    h = h / ( o.count - 1 )

    helix = new THREE.Points( new THREE.Geometry(), material.clone() )
    helix.position.x = - o.length / 2
    stage.add( helix )

    const turn = 

    helix.material.uniforms.turns.value = Math.PI / o.length * 3
    helix.material.uniforms.speed.value = Math.random() * 10
    helix.material.uniforms.color.value = color( h )

    const depth = range( - 2, 2, Math.random() )

    Array.from( { length: o.particles }, ( vertex, v ) =>  {

      v = v / o.particles

      vertex = new THREE.Vector3(
        Math.random() * o.length,
        h * 2 * o.radius - o.radius,
        depth )

      helix.geometry.vertices.push( vertex )

    } )

    return helix

  } )

  return helixes

} )( options )

stage.init()
