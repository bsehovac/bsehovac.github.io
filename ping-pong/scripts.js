(function () {
	'use strict';

	const Animation = ( () => {

	  const animationEngine = ( () => {

	    let uniqueID = 0;

	    class AnimationEngine {

	      constructor() {

	        this.ids = [];
	        this.animations = {};
	        this.update = this.update.bind( this );
	        this.raf = 0;
	        this.time = 0;

	      }

	      update() {

	        const now = performance.now();
	        const delta = now - this.time;
	        this.time = now;

	        let i = this.ids.length;

	        this.raf = i ? requestAnimationFrame( this.update ) : 0;

	        while ( i-- )
	          this.animations[ this.ids[ i ] ] && this.animations[ this.ids[ i ] ].update( delta );

	      }

	      add( animation ) {

	        if ( animation.id ) return

	        animation.id = uniqueID ++;

	        this.ids.push( animation.id );
	        this.animations[ animation.id ] = animation;

	        if ( this.raf !== 0 ) return

	        this.time = performance.now();
	        this.raf = requestAnimationFrame( this.update );

	      }

	      remove( animation ) {

	        const index = this.ids.indexOf( animation.id );

	        if ( index < 0 ) return

	        animation.id = null;

	        this.ids.splice( index, 1 );
	        delete this.animations[ animation.id ];
	        animation = null;

	      }

	    }

	    return new AnimationEngine()

	  } )();

	  class Animation {

	    constructor( start ) {

	      if ( start === true ) this.start();

	    }

	    start() {

	      animationEngine.add( this );

	    }

	    stop() {

	      animationEngine.remove( this );

	    }

	    update( delta ) {}

	  }

	  return Animation

	} )();

	class Table {

	  constructor( colors ) {

	    this.colors = colors;

	  }

	  resize( unit ) {

	    this.drawable = ( () => {

	      const width = unit * 0.85;
	      const height = unit * 1.14;
	      const lineWidth = unit * 0.007;

	      const bounds = {
	        x: unit * 0.075 + lineWidth / 2,
	        y: unit * 0.18 + lineWidth / 2,
	        w: width - lineWidth,
	        h: height - lineWidth,
	        lineWidth: lineWidth,
	      };

	      const split = {
	        x0: bounds.x + bounds.w / 2,
	        y0: bounds.y + lineWidth / 2,
	        x1: bounds.x + bounds.w / 2,
	        y1: bounds.y + bounds.h - lineWidth,
	        lineWidth: lineWidth,
	      };

	      const netWidth = unit * 0.012;

	      const net = {
	        x0: bounds.x - unit * 0.025,
	        y0: bounds.y + bounds.h / 2,
	        x1: bounds.x + bounds.w + unit * 0.025,
	        y1: bounds.y + bounds.h / 2,
	        lineWidth: netWidth
	      };

	      const netShadow = {
	        x: bounds.x - lineWidth / 2,
	        y: bounds.y + bounds.h / 2,
	        w: bounds.w + lineWidth,
	        h: unit * 0.08,
	      };

	      return { bounds, split, net, netShadow }

	    } )();

	  }

	  draw( ctx ) {

	    // Table

	    const bounds = this.drawable.bounds;

	    ctx.beginPath();

	    ctx.rect( bounds.x, bounds.y, bounds.w, bounds.h );

	    ctx.fillStyle = this.colors.table;
	    ctx.fill();

	    ctx.lineCap = 'square';
	    ctx.lineJoin = 'square';
	    ctx.lineWidth = bounds.lineWidth;
	    ctx.strokeStyle = this.colors.lines;
	    ctx.stroke();

	    // Split

	    const split = this.drawable.split;

	    ctx.beginPath();

	    ctx.moveTo( split.x0, split.y0 );
	    ctx.lineTo( split.x1, split.y1 );

	    ctx.lineCap = 'square';
	    ctx.lineJoin = 'square';
	    ctx.lineWidth = bounds.lineWidth;
	    ctx.strokeStyle = this.colors.net;
	    ctx.stroke();

	    // Net Shadow

	    const shadow = this.drawable.netShadow;

	    ctx.beginPath();

	    ctx.rect( shadow.x, shadow.y, shadow.w, shadow.h );

	    ctx.globalAlpha = 0.3;
	    ctx.fillStyle = this.colors.shadow;
	    ctx.fill();
	    ctx.globalAlpha = 1;

	    // Net

	    const net = this.drawable.net;

	    ctx.beginPath();

	    ctx.moveTo( net.x0, net.y0 );
	    ctx.lineTo( net.x1, net.y1 );

	    ctx.lineCap = 'round';
	    ctx.lineJoin = 'round';
	    ctx.lineWidth = net.lineWidth;
	    ctx.strokeStyle = this.colors.net;
	    ctx.stroke();

	  }

	  getBounds() {

	    const bounds = this.drawable.bounds;

	    return {
	      x0: bounds.x,
	      x1: bounds.x + bounds.w,
	    }

	  }

	}

	class Vector2 {

	  constructor( x, y ) {
	    this.x = x || 0;
	    this.y = y || 0;
	  }

	  set( x, y ) {
	    this.x = x;
	    this.y = y;
	    return this
	  }

	  clone() {
	    return new Vector2( this.x, this.y )
	  }

	  copy( v ) {
	    this.x = v.x;
	    this.y = v.y;
	    return this
	  }

	  add( v ) {
	    this.x += v.x;
	    this.y += v.y;
	    return this
	  }

	  sub( v ) {
	    this.x -= v.x;
	    this.y -= v.y;
	    return this
	  }

	  multiply( v ) {
	    this.x *= v.x;
	    this.y *= v.y;
	  }

	  multiplyScalar( n ) {
	    this.x *= n;
	    this.y *= n;
	    return this
	  }

	  rotate( a ) {
	    const cos = Math.cos( a );
	    const sin = Math.sin( a );
	    const x = this.x;
	    const y = this.y;
	    this.x = x * cos - y * sin;
	    this.y = x * sin + y * cos;
	    return this
	  }

	  angle() {
	    return Math.atan2( this.y, this.x )
	  }

	  magnitude() {
	    return Math.sqrt( ( this.x * this.x + this.y * this.y ) )
	  }

	}

	const LinesIntersection = ( x1, y1, x2, y2, x3, y3, x4, y4 ) => {

	  const denom = ( ( y4 - y3 ) * ( x2 - x1 ) ) - ( ( x4 - x3 ) * ( y2 - y1 ) );
	  const numeA = ( ( x4 - x3 ) * ( y1 - y3 ) ) - ( ( y4 - y3 ) * ( x1 - x3 ) );
	  const numeB = ( ( x2 - x1 ) * ( y1 - y3 ) ) - ( ( y2 - y1 ) * ( x1 - x3 ) );

	  if ( denom == 0 ) return false

	  const uA = numeA / denom;
	  const uB = numeB / denom;

	  if ( uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1 )
	    return new Vector2( 
	      x1 + ( uA * ( x2 - x1 ) ),
	      y1 + ( uA * ( y2 - y1 ) )
	    )

	  return false

	};

	class Ball {

	  constructor( game, colors ) {

	    this.canvas = document.createElement( 'canvas' );
	    this.ctx = this.canvas.getContext( '2d' );

	    this.accelaration = 1.025;
	    this.trailLength = 5;

	    this.game = game;
	    this.colors = colors;

	    this.trail = [];
	    this.trailZ = [];

	  }

	  resize( unit, bounds ) {

	    this.inbound = true;
	    this.fieldPos = 0;
	    this.jump = new Vector2();

	    this.serve = false;

	    this.radius = unit * 0.02;
	    this.velocity = unit * 0.02;
	    this.jumpValue = unit * 0.05;

	    this.bounds = {
	      x0: bounds.x0 + this.radius,
	      x1: bounds.x1 - this.radius,
	      y0: bounds.y0 + this.radius,
	      y1: bounds.y1 - this.radius,
	      e0: bounds.e0 - this.radius * 2,
	      e1: bounds.e1 + this.radius * 2,
	      xc: bounds.x0 + ( bounds.x1 - bounds.x0 ) * 0.5,
	      yc: bounds.y0 + ( bounds.y1 - bounds.y0 ) * 0.5,
	      h: bounds.y1 - bounds.y0 - this.radius * 2,
	    };

	    this.canvas.width = this.game.canvas.width;
	    this.canvas.height = this.game.canvas.height + this.jumpValue * 2;

	    this.pos = new Vector2( this.bounds.xc, this.bounds.y1 );

	  }

	  draw( gamectx, type ) {

	    const ctx = this.ctx;

	    ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );

	    ctx.lineCap = 'round';
	    ctx.lineJoin = 'round';
	    ctx.lineWidth = this.radius * 2;
	    ctx.strokeStyle = ( type == 'shadow' ) ? this.colors.shadow : this.colors.ball;

	    ctx.beginPath();
	    ctx.moveTo( this.pos.x, this.pos.y );

	    let lastTrail = this.pos;
	    const fieldPos = Math.floor( this.fieldPos );

	    if ( fieldPos > 0 && this.trail.length > 0 ) {

	      const trails = this.trail.slice( this.trail.length - fieldPos ).reverse();

	      trails.forEach( ( trail, index ) => {

	        if ( index == trails.length - 1 ) {

	          const decimal = this.fieldPos - Math.floor( this.fieldPos );
	          const prev = index >= 1 ? trails[ index - 1 ] : this.pos;

	          trail.x = trail.x + ( prev.x - trail.x ) * ( 1 - decimal );
	          trail.y = trail.y + ( prev.y - trail.y ) * ( 1 - decimal );

	        }

	        ctx.lineTo( trail.x, trail.y );
	        lastTrail = trail;

	      } );

	    }

	    ctx.lineTo( lastTrail.x, lastTrail.y );
	    ctx.stroke();

	    // draw ball canvas on main canvas

	    const jump = ( type == 'shadow' ) ? new Vector2() : this.jump;
	    gamectx.globalAlpha = ( type == 'shadow' ) ? 0.3 : 1;
	    gamectx.drawImage( this.canvas, jump.x, jump.y );
	    gamectx.globalAlpha = 1;

	  }

	  update() {

	    if ( ! this.serve ) return

	    this.trail.push( this.pos.clone() );
	    if ( this.trail.length > this.trailLength ) this.trail.shift();

	    this.pos.add( this.speed );

	    const wallHitY = this.pos.y < this.bounds.y0
	      ? 'y0' : this.pos.y > this.bounds.y1
	      ? 'y1' : false;

	    if ( wallHitY ) {

	      const paddle = wallHitY == 'y0' ? 'pong' : 'ping';

	      if ( this.inbound && this.game.getPaddle( paddle ).checkBallHit( this ) ) {

	        // set ball position at paddle hit point

	        const intersect = LinesIntersection(
	          this.pos.x - this.speed.x, this.pos.y - this.speed.y,
	          this.pos.x, this.pos.y,
	          this.bounds.x0 - 1000, this.bounds[ wallHitY ],
	          this.bounds.x1 + 1000, this.bounds[ wallHitY ],
	        );

	        this.pos.copy( intersect );

	        // calculate new ball speed and direction by position of hit on paddle

	        const angle = this.game.getPaddle( paddle ).getBallHitAngle( this );
	        this.speed.set( 0, this.speed.magnitude() ).multiplyScalar( this.accelaration );
	        this.speed.rotate( paddle == 'ping' ? Math.PI + angle : - angle );

	        if ( paddle == 'ping' ) this.setPongTarget();
	        this.game.getPaddle( paddle ).drawBounce( this );

	      } else {

	        this.inbound = false;

	        const outsideField = this.pos.y < this.bounds.e0
	          ? 'top' : this.pos.y > this.bounds.e1
	          ? 'bottom' : false;

	        if ( outsideField ) {

	          const outsideTop = outsideField == 'top';

	          this.serve = false;
	          this.inbound = true;

	          this.pos.set( this.bounds.xc, this.bounds[ outsideTop ? 'y1' : 'y0' ] );
	          this.speed.set( 0, this.velocity * ( outsideTop ? 1 : -1 ) );
	          this.game.getPaddle( outsideTop ? 'ping' : 'pong' ).increaseScore();

	        }

	      }

	    }

	    this.checkWallHit();

	    // get field position for trail length calculation and ball jump
	    // in range: 0 on paddle bounds, 1 on net

	    const current = Math.cos( ( ( ( this.pos.y - this.bounds.y0 ) / this.bounds.h ) * 2 - 1 ) * Math.PI / 2 );

	    this.fieldPos = Math.max( 0, Math.min( 1, 1 - Math.pow( 1 - current, 2 ) ) ) * this.trailLength;
	    this.jump = new Vector2( 0, - Math.abs( current ) * this.jumpValue  );

	  }

	  checkWallHit() {

	    const wallHit = this.pos.x < this.bounds.x0 ? 'x0' : this.pos.x > this.bounds.x1 ? 'x1' : false;

	    if ( wallHit ) {

	      const intersect = LinesIntersection(
	        this.pos.x - this.speed.x, this.pos.y - this.speed.y,
	        this.pos.x, this.pos.y,
	        this.bounds[ wallHit ], this.bounds.y0 - 1000,
	        this.bounds[ wallHit ], this.bounds.y1 + 1000,
	      );

	      this.speed.multiply( new Vector2( -1, 1 ) );
	      if ( intersect ) this.pos.copy( intersect );

	    }

	  }

	  setPongTarget() {

	    const ghost = new BallGhost( this );
	    const exitPoint = ghost.getExitPoint();

	    this.game.getPaddle( 'pong' ).setTargetPosition( exitPoint.x );

	  }

	  startServe() {

	    if ( this.serve ) return

	    this.serve = true;

	    const paddle = this.pos.y > this.bounds.yc ? 'ping' : 'pong';

	    this.speed = new Vector2( 0, this.velocity * ( paddle == 'ping' ? -1 : 1 ) );
	    this.speed.rotate( this.game.getPaddle( paddle ).getBallHitAngle( this ) );

	    if ( paddle == 'ping' ) this.setPongTarget();

	  }

	  getServe() {

	    return this.serve

	  }

	}

	class BallGhost {

	  constructor( ball ) {

	    this.pos = ball.pos.clone();
	    this.speed = ball.speed.clone();
	    this.bounds = ball.bounds;
	    this.checkWallHit = ball.checkWallHit;

	  }

	  getExitPoint() {

	    let exitPoint = null;

	    while ( exitPoint == null ) {

	      this.pos.add( this.speed );

	      this.checkWallHit();

	      if ( this.pos.y < this.bounds.y0 ) exitPoint = this.pos;

	    }

	    return exitPoint

	  }

	}

	class Spring extends Animation {

	  constructor( options = {} ) {

	    super( false );

	    options = Object.assign( {
	      config: {},
	      rest: {},
	      onUpdate: ( () => {} ),
	    }, options );

	    this.config = Object.assign( {
	      stiffness: 30,
	      damping: 1.5,
	      mass: 0.1,
	    }, options.config );

	    this.rest = Object.assign( {
	      delta: 0.001,
	      velocity: 0.01,
	    }, options.rest );

	    this.onUpdate = options.onUpdate;

	    this.position = 0;
	    this.target = 0;
	    this.velocity = 0;

	    this.update = this.update.bind( this );

	  }

	  update( delta ) {

	    delta /= 1000;

	    const spring = ( this.position - this.target ) * -this.config.stiffness;
	    const damper = this.velocity * -this.config.damping;
	    const accelaration = ( spring + damper ) / this.config.mass;

	    this.velocity += accelaration * delta;
	    this.position += this.velocity * delta;

	    this.onUpdate( this.position );

	    const positionThreshold = this.round( this.position, this.rest.delta ) == this.round( this.target, this.rest.delta );
	    const velocityThreshold = this.round( this.velocity, this.rest.velocity ) == 0;

	    if ( positionThreshold && velocityThreshold ) {

	      this.position = this.target;

	      super.stop();
	      this.onUpdate( this.position );

	    }

	  }

	  round( value, precision, check = false ) {

	    return Math.round( value / precision ) * precision

	  }

	  setConfig( config = {} ) {

	    this.config = Object.assign( this.config, config );

	    return this

	  }

	  setRest( rest = {} ) {

	    this.rest = Object.assign( this.rest, rest );

	    return this

	  }

	  setPosition( v ) {

	    this.position = v;
	    super.start();

	    return this

	  }

	  setTarget( v ) {

	    this.target = v;
	    super.start();

	    return this

	  }

	  onUpdate( callback ) {

	    this.onUpdate = callback;

	    return this

	  }

	}

	class Paddle {

	  constructor( colors ) {

	    this.ballBounceAngle = Math.PI / 5;
	    this.colors = colors;
	    this.score = 0;

	    this.pos = new Vector2();
	    this.spring = new Spring( { onUpdate: p => this.pos.x = p } );

	  }

	  resize( unit, type ) {

	    this.type = type;

	    this.w = unit * 0.2;
	    this.h = unit * 0.035;

	    this.pos.x = unit * 0.5;
	    this.pos.y = unit * ( type == 'cpu' ? 0.15 : 1.35 );

	    // Stiffness of the spring. Higher values will create more sudden movement.
	    // Damping, strength of opposing force. If set to 0, spring will oscillate indefinitely.
	    // Mass of the moving object. Higher values will result in more lethargic movement.

	    this.spring.setConfig(
	      type == 'cpu' ? {
	        stiffness: 15,
	        damping: 2.5,
	        mass: 0.1,
	      } : {
	        stiffness: 15,
	        damping: 2.5,
	        mass: 0.1,
	      }
	    );

	    this.spring.type = type;

	    this.spring.setPosition( this.pos.x ).setTarget( this.pos.x );

	    this.speed = 0;
	    this.max = unit * 0.02;
	    this.acc = this.max / 5;

	    this.limit = {
	      min: 0 + this.w / 2,
	      max: unit - this.w / 2,
	    };

	    this.drawable = ( () => {

	      const paddle = {
	        w: this.w / 2 - this.h / 2
	      };

	      const edgeDistance = unit * 0.03; 
	      const topX = unit * 0.931 - edgeDistance;
	      const topY = unit * 0.268 + edgeDistance;
	      const botX = unit * 0.084 + edgeDistance;
	      const botY = unit * 1.312 - edgeDistance;

	      const score = {
	        x: ( type == 'cpu' ? topX : botX ),
	        y: ( type == 'cpu' ? topY : botY ),
	        textAlign: ( type == 'cpu' ? 'right' : 'left' ),
	        font: ( unit * 0.13 ) + 'px Score',
	      };

	      return { paddle, score }

	    } )();

	  }

	  draw( ctx, type ) {

	    if ( type == 'score' ) {

	      const score = this.drawable.score;

	      ctx.beginPath();

	      ctx.font = score.font; //
	      ctx.textAlign = score.textAlign;
	      ctx.fillStyle = this.colors.lines;
	      ctx.fillText( this.scoreString(), score.x, score.y );

	    } else {

	      const paddle = this.drawable.paddle;

	      ctx.beginPath();

	      const x0 = this.pos.x - paddle.w;
	      const x1 = this.pos.x + paddle.w;

	      ctx.moveTo( x0, this.pos.y );
	      ctx.lineTo( x1, this.pos.y );

	      ctx.lineCap = 'round';
	      ctx.lineJoin = 'round';
	      ctx.lineWidth = this.h;
	      ctx.strokeStyle = this.colors.paddle;
	      ctx.stroke();

	    }

	  }

	  scoreString() {
	    
	    let s = String( this.score );
	    while ( s.length < 2 ) s = '0' + s;
	    return s.replace( /0/g, 'o' )

	  }

	  setTargetPosition( x ) {

	    x = Math.min( Math.max( x, this.limit.min ), this.limit.max );

	    if ( this.type == 'cpu' )
	      x += this.randomRange( - this.w * 0.5, this.w * 0.5, Math.random() );

	    if ( this.type == 'cpu' ) console.log( 'set cpu' );

	    this.spring.setTarget( x );

	  }

	  increaseScore() {

	    this.score ++;

	  }

	  getBounds() {

	    return this.pos.y + ( this.type == 'cpu' ? this.h / 2 : - this.h / 2 )

	  }

	  randomRange( a, b, i ) {

	    return a + ( b - a ) * i

	  }

	  checkBallHit( ball ) {

	    const paddle = this.drawable.paddle;

	    const x0 = this.pos.x - paddle.w - ball.radius;
	    const x1 = this.pos.x + paddle.w + ball.radius;

	    return ball.pos.x > x0 && ball.pos.x < x1

	  }

	  getBallHitAngle( ball ) {

	    const ratio = Math.max( -1, Math.min( 1, ( ball.pos.x - this.pos.x ) / ( this.w / 2 ) ) );

	    return ratio * this.ballBounceAngle

	  }

	  drawBounce( ball ) {

	    // TODO

	  }

	}

	var Stats = function () {

	  var mode = 0;

	  var container = document.createElement( 'div' );
	  container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
	  container.addEventListener( 'click', function ( event ) {

	    event.preventDefault();
	    showPanel( ++ mode % container.children.length );

	  }, false );

	  //

	  function addPanel( panel ) {

	    container.appendChild( panel.dom );
	    return panel;

	  }

	  function showPanel( id ) {

	    for ( var i = 0; i < container.children.length; i ++ ) {

	      container.children[ i ].style.display = i === id ? 'block' : 'none';

	    }

	    mode = id;

	  }

	  //

	  var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	  var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
	  var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );

	  if ( self.performance && self.performance.memory ) {

	    var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );

	  }

	  showPanel( 0 );

	  return {

	    REVISION: 16,

	    dom: container,

	    addPanel: addPanel,
	    showPanel: showPanel,

	    begin: function () {

	      beginTime = ( performance || Date ).now();

	    },

	    end: function () {

	      frames ++;

	      var time = ( performance || Date ).now();

	      msPanel.update( time - beginTime, 200 );

	      if ( time > prevTime + 1000 ) {

	        fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

	        prevTime = time;
	        frames = 0;

	        if ( memPanel ) {

	          var memory = performance.memory;
	          memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );

	        }

	      }

	      return time;

	    },

	    update: function () {

	      beginTime = this.end();

	    },

	    // Backwards Compatibility

	    domElement: container,
	    setMode: showPanel

	  };

	};

	Stats.Panel = function ( name, fg, bg ) {

	  var min = Infinity, max = 0, round = Math.round;
	  var PR = round( window.devicePixelRatio || 1 );

	  var WIDTH = 80 * PR, HEIGHT = 48 * PR,
	      TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
	      GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
	      GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

	  var canvas = document.createElement( 'canvas' );
	  canvas.width = WIDTH;
	  canvas.height = HEIGHT;
	  canvas.style.cssText = 'width:80px;height:48px';

	  var context = canvas.getContext( '2d' );
	  context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
	  context.textBaseline = 'top';

	  context.fillStyle = bg;
	  context.fillRect( 0, 0, WIDTH, HEIGHT );

	  context.fillStyle = fg;
	  context.fillText( name, TEXT_X, TEXT_Y );
	  context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	  context.fillStyle = bg;
	  context.globalAlpha = 0.9;
	  context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	  return {

	    dom: canvas,

	    update: function ( value, maxValue ) {

	      min = Math.min( min, value );
	      max = Math.max( max, value );

	      context.fillStyle = bg;
	      context.globalAlpha = 1;
	      context.fillRect( 0, 0, WIDTH, GRAPH_Y );
	      context.fillStyle = fg;
	      context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

	      context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

	      context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

	      context.fillStyle = bg;
	      context.globalAlpha = 0.9;
	      context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );

	    }

	  };

	};

	class Game extends Animation {

	  constructor( options ) {

	    super( false );

	    options = options || {};

	    this.colors = options.colors || {
	      floor:  '#458b59', // #4b7355
	      table:  '#14b369',
	      lines:  '#ffffff',
	      net:    '#ffffff',
	      shadow: '#373435',
	      ball:   '#d9e035',
	      paddle: '#ffffff',
	    };

	    this.canvas = document.createElement( 'canvas' );
	    this.canvas.style.cssText =
	      'display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%;';
	    this.ctx = this.canvas.getContext( '2d' );

	    document.body.appendChild( this.canvas );

	    this.stats = ( window.location.href.includes( 'stats' ) ) ? new Stats() : false;
	    if ( this.stats ) document.body.appendChild( this.stats.dom );

	    this.table = new Table( this.colors );
	    this.ball = new Ball( this, this.colors );
	    this.ping = new Paddle( this.colors );
	    this.pong = new Paddle( this.colors );

	    this.ping.setSpeed = this.pong.setSpeed = options.paddleSpeed || 0.5;

	    this.resize();
	    super.start();

	    window.addEventListener( 'touchmove', () => {} );
	    document.addEventListener( 'touchmove',  e => e.preventDefault(), { passive: false } );

	    window.addEventListener( 'resize', () => this.resize(), false );
	    window.addEventListener( 'mousemove', e => this.control( e ), false );
	    window.addEventListener( 'touchmove', e => this.control( e ), false );

	    window.addEventListener( 'click', () => this.startServe(), false );
	    window.addEventListener( 'touchstart', () => this.startServe(), false );

	  }

	  resize() {

	    const aspect = 2 / 3;

	    const dpi = window.devicePixelRatio;
	    const width = this.canvas.offsetWidth;
	    const height = this.canvas.offsetHeight;

	    this.canvas.width = width * dpi;
	    this.canvas.height = height * dpi;

	    const unit = ( width / height > aspect )
	      ? height * dpi * aspect
	      : width * dpi;

	    // Game position

	    this.position = {
	      x: ( this.canvas.width - unit ) / 2,
	      y: ( this.canvas.height - ( unit / aspect ) ) / 2,
	      w: unit,
	      h: unit / aspect,
	    };

	    // Resize components

	    this.table.resize( unit );
	    this.ping.resize( unit, 'player' );
	    this.pong.resize( unit, 'cpu' );

	    this.ball.resize( unit, {
	      ...this.table.getBounds(),
	      y0: this.pong.getBounds(),
	      y1: this.ping.getBounds(),
	      e0: this.position.y,
	      e1: this.position.y + this.position.h,
	    } );

	  }

	  control( e ) {

	    if ( e.type == 'touchmove' && e.touches.length > 1 ) return

	    const event = e.touches ? ( e.touches[ 0 ] || e.changedTouches[ 0 ] ) : e;

	    this.ping.setTargetPosition( event.pageX - this.position.x );

	  }

	  startServe() {

	    this.ball.startServe();

	  }

	  update( delta ) {

	    if ( this.stats ) this.stats.update();

	    // Update

	    this.ball.update();

	    // Draw

	    const ctx = this.ctx;

	    // Draw background

	    ctx.beginPath();

	    ctx.rect( 0, 0, this.canvas.width, this.canvas.height );

	    ctx.fillStyle = this.colors.floor;
	    ctx.fill();

	    // Translate to stage

	    ctx.save();
	    ctx.translate( this.position.x, this.position.y );

	    this.table.draw( ctx );
	    this.ping.draw( ctx, 'score' );
	    this.pong.draw( ctx, 'score' );
	    this.ball.draw( ctx, 'shadow' );
	    this.ping.draw( ctx, 'paddle' );
	    this.pong.draw( ctx, 'paddle' );
	    this.ball.draw( ctx, 'ball' );

	    // Restore translation

	    ctx.restore();

	  }

	  getPaddle( name ) {

	    return name == 'ping' ? this.ping : this.pong

	  }

	}

	const game = new Game( {
	  // colors: {
	  //   floor:  '#fff',
	  //   table:  '#fff',
	  //   lines:  '#f5f5f5',
	  //   net:    '#f5f5f5',
	  //   shadow: '#f5f5f5',
	  //   ball:   '#eee',
	  //   paddle: '#f5f5f5',
	  // }
	} );

	window.game = game;

}());
