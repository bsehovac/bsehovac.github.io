(function(){

  var Window = window;
  var AddListener = 'addEventListener';
  var RemoveListener = 'removeEventListener';
  var MouseEvents = ['mousedown', 'mousemove', 'mouseup'];
  var TouchEvents = ['touchstart', 'touchmove', 'touchend'];

  var Style = 'style';
  var Transform = 'transform';
  var TransitionTimingFunction = 'transitionTimingFunction';
  var TransitionDuration = 'transitionDuration';
  var TransitionProperty = 'transitionProperty';

  var MinDistance = 5;
  var MinAngle = 55;
  var DecreaseOverscroll = 0.3;
  var AllowedElements = ['SELECT', 'INPUT', 'TEXTAREA', 'BUTTON'];

  var RefreshElements = [];
  var RefreshEnabled = false;

  this.ScrollSnap = function(Viewport, Options) {

    if (typeof Viewport === 'string' || Viewport instanceof String) {
      Viewport = document.querySelector(Viewport);
    } else if (typeof Viewport !== 'object') {
      return false;
    }

    var ScrollSnap = this;

    Options = (Options) ? Options : {};

    var OnStart     = SetOption(Options.start, false);
    var Duration    = SetOption(Options.duration, 350);
    var Easing      = SetOption(Options.easing, 'cubic-bezier(0,0,0.25,1)');
    var HolderClass = SetOption(Options.holderClass, 'holder');
    var ItemClass   = SetOption(Options.itemClass, 'item');
    var Overscroll  = SetOption(Options.overscroll, false);
    var AutoRefresh = SetOption(Options.autoRefresh, true);

    var Holder = Viewport.querySelector('.' + HolderClass);
    var Items  = Holder.querySelectorAll('.' + ItemClass);

    Holder[Style][TransitionTimingFunction] = Easing;
    Holder[Style][TransitionProperty] = Transform;
    Holder[Style][TransitionDuration] = '0ms';
    Holder[Style][Transform] = Translate3D(0);

    var CallBacks = [TouchStart, TouchMove, TouchEnd];

    TouchControls(Holder, MouseEvents, CallBacks);
    TouchControls(Holder, TouchEvents, CallBacks);

    if (AutoRefresh) EnableRefreshListener(ScrollSnap);

    var OnDragStart = function(e) {};
    var OnDragMove = function(e) {};
    var OnDragEnd = function(e) {};

    var DragStarted;
    var DragActive;
    var DragStart;
    var DragDelta;
    var DragDirection = 1;
    var DragPosition = 0;
    var DragPositionOld;
    var SlideCurrent = 0;
    var OffsetRight = 0;

    var Slides;
    var SlideWidth;
    var ViewportWidth;
    var ViewportSlides;
    var HolderWidth;
    var ResizeTimeout;

    if (OnStart) {
      OnStart = parseInt(OnStart, 10);
      SlideCurrent = (isNaN(OnStart)) ? 0 : OnStart;
      OnStart = false;
    }

    Resize();

    /*
    ███████ ████████  █████  ██████  ████████ 
    ██         ██    ██   ██ ██   ██    ██    
    ███████    ██    ███████ ██████     ██    
         ██    ██    ██   ██ ██   ██    ██    
    ███████    ██    ██   ██ ██   ██    ██    
    */

    function TouchStart(e, Touch) {
      if (DragStarted) return;
      DragActive = true;

      DragStart = TouchPosition(e);
      DragDelta = { x: 0, y: 0 };
      DragPositionOld = DragPosition;

      Holder[Style][TransitionDuration] = '0ms';

      if (!Touch) {
        DragStarted = true;
        OnDragStart();
      }

      if (!Touch && AllowedElements.indexOf(e.target.tagName) == -1) {
        e.preventDefault();
      }
    }

    /*
    ███    ███  ██████  ██    ██ ███████ 
    ████  ████ ██    ██ ██    ██ ██      
    ██ ████ ██ ██    ██ ██    ██ █████   
    ██  ██  ██ ██    ██  ██  ██  ██      
    ██      ██  ██████    ████   ███████ 
    */

    function TouchMove(e) {
      if (!DragActive) return;
      e.preventDefault();

      var DragCurrent = TouchPosition(e);

      if (DragStarted) {
        DragDelta.x = DragCurrent.x - DragStart.x;
        DragDelta.y = DragCurrent.y - DragStart.y;

        DragDirection = (DragDelta.x > 0) ? -1 : 1;

        var EndPoint = HolderWidth - ((!Overscroll) ? ViewportWidth : SlideWidth);
        var OverscrollStart = DragPosition > 0 && DragDirection < 0;
        var OverscrollEnd = DragPosition < -EndPoint && DragDirection > 0;
        if (OverscrollStart || OverscrollEnd) { DragDelta.x *= DecreaseOverscroll; }

        DragPosition += DragDelta.x;
        Holder[Style][Transform] = Translate3D(DragPosition);

        OnDragMove({
          direction: DragDirection,
          delta: DragDelta
        });

      } else {
        DragDelta.x += DragCurrent.x - DragStart.x;
        DragDelta.y += DragCurrent.y - DragStart.y;

        var Distance = TouchDistance(DragDelta);

        if (Distance.d > MinDistance && Distance.a > MinAngle) {
          DragStarted = true;
          DragDelta = { x: 0, y: 0 };

          OnDragStart();

        } else if (Distance.d > MinDistance && Distance.a < MinAngle) {
          DragStarted = false;
          DragActive = false;
        }

      }

      DragStart = DragCurrent;
    }

    /*
    ███████ ███    ██ ██████  
    ██      ████   ██ ██   ██ 
    █████   ██ ██  ██ ██   ██ 
    ██      ██  ██ ██ ██   ██ 
    ███████ ██   ████ ██████  
    */

    function TouchEnd(e) {
      if (!DragActive || !DragStarted) return;

      var SlideOld = SlideCurrent;
      var Intensity = (DragPosition - DragPositionOld) / SlideWidth;
      var IntensityHalf = Math.abs(Intensity) < 0.5;
      var Cancel1 = Intensity > 0 && DragDirection > 0 && IntensityHalf;
      var Cancel2 = Intensity < 0 && DragDirection < 0 && IntensityHalf;

      if (!Cancel1 && !Cancel2) {
        Intensity = -Math.round(Intensity);
        Intensity = (Intensity !== 0) ? Intensity : DragDirection;
        SlideCurrent += Intensity;
      }

      GoToPosition(SlideCurrent, Duration);

      DragStarted = false;
      DragActive = false;

      OnDragEnd({
        moved: SlideOld != SlideCurrent,
        old: SlideOld,
        new: SlideCurrent
      });
    }

    /*
     ██████   ██████  ████████  ██████  
    ██       ██    ██    ██    ██    ██ 
    ██   ███ ██    ██    ██    ██    ██ 
    ██    ██ ██    ██    ██    ██    ██ 
     ██████   ██████     ██     ██████  
    */

    function GoToPosition(Next, MoveDuration) {
      MoveDuration = SetOption(MoveDuration, Duration);
      Next = parseInt(Next, 10);
      SlideCurrent = (isNaN(Next)) ? SlideOld : Next;

      var MaxPoint = Slides - ((!Overscroll) ? ViewportSlides : 1);
      if (MaxPoint < 0) MaxPoint = 0;
      if (SlideCurrent < 0) SlideCurrent = 0;
      if (SlideCurrent > MaxPoint) SlideCurrent = MaxPoint;

      DragPosition = -Items[SlideCurrent].offsetLeft;

      Holder[Style][TransitionDuration] = Duration + 'ms';
      Holder[Style][Transform] = Translate3D(DragPosition);
    }

    /*
    ██████  ███████ ███████ ██ ███████ ███████ 
    ██   ██ ██      ██      ██    ███  ██      
    ██████  █████   ███████ ██   ███   █████   
    ██   ██ ██           ██ ██  ███    ██      
    ██   ██ ███████ ███████ ██ ███████ ███████ 
    */

    function Resize(){
      Slides = Items.length;
      SlideWidth = Items[0].offsetWidth;
      ViewportWidth = Viewport.offsetWidth;      
      ViewportSlides = Math.round(ViewportWidth / SlideWidth);
      if (ViewportSlides > 1 && typeof Items[1] != 'undefined') {
        SlideWidth = Items[1].offsetLeft;
        ViewportSlides = Math.round(ViewportWidth / SlideWidth);
      }
      HolderWidth = Holder.offsetWidth;
      DragPosition = -Items[SlideCurrent].offsetLeft;
      Holder[Style][TransitionDuration] = '0ms';
      Holder[Style][Transform] = Translate3D(DragPosition);
    }

    /*
     ██████  ██████  ███    ██ ████████ ██████   ██████  ██      ███████ 
    ██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██      ██      
    ██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██      ███████ 
    ██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██           ██ 
     ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████ ███████ 
    */

    ScrollSnap.slide = function() {
      return SlideCurrent;
    };

    ScrollSnap.length = function() {
      return Slides;
    };

    ScrollSnap.first = function() {
      return SlideCurrent == 0;
    };

    ScrollSnap.last = function() {
      return SlideCurrent == (Slides - 1);
    };

    ScrollSnap.next = function(Duration) {
      GoToPosition(SlideCurrent + 1, Duration);
    };

    ScrollSnap.prev = function(Duration) {
      GoToPosition(SlideCurrent - 1, Duration);
    };

    ScrollSnap.move = GoToPosition;

    ScrollSnap.start = function(Callback) {
      OnDragStart = Callback;
    };

    ScrollSnap.drag = function(Callback) {
      OnDragMove = Callback;
    };

    ScrollSnap.end = function(Callback) {
      OnDragEnd = Callback;
    };

    ScrollSnap.refresh = Resize;

  };

  /*
  ██████  ███████ ███████ ██████  ███████ ███████ ██   ██ 
  ██   ██ ██      ██      ██   ██ ██      ██      ██   ██ 
  ██████  █████   █████   ██████  █████   ███████ ███████ 
  ██   ██ ██      ██      ██   ██ ██           ██ ██   ██ 
  ██   ██ ███████ ██      ██   ██ ███████ ███████ ██   ██ 
  */

  function EnableRefreshListener(ScrollSnap) {
    RefreshElements.push(ScrollSnap);

    if (!RefreshEnabled) {
      RefreshEnabled = true;
      
      Window[AddListener]('resize', function() {
        for (var i = 0; i < RefreshElements.length; i++) {
          RefreshElements[i].refresh();
        }
      });
    }
  }

  /*
  ██   ██ ███████ ██      ██████  ███████ ██████  ███████ 
  ██   ██ ██      ██      ██   ██ ██      ██   ██ ██      
  ███████ █████   ██      ██████  █████   ██████  ███████ 
  ██   ██ ██      ██      ██      ██      ██   ██      ██ 
  ██   ██ ███████ ███████ ██      ███████ ██   ██ ███████ 
  */

  function TouchPosition(e) {
    e = event.changedTouches ? event.changedTouches[0] : e;
    return { x: e.pageX, y: e.pageY };
  }

  function TouchControls(el, events, callbacks) {
    var EventStart = events[0];
    var EventMove = events[1];
    var EventEnd = events[2];
    var CallbackStart = callbacks[0];
    var CallbackMove = callbacks[1];
    var CallbackEnd = callbacks[2];

    var Touch = (EventStart == 'touchstart') ? true : false;
    var Win = (Touch) ? el : Window;
    el[AddListener](EventStart, OnTouchStart, false);

    function OnTouchStart(e) {
      CallbackStart(e, Touch);
      Win[AddListener](EventMove, OnTouchMove, false);
      Win[AddListener](EventEnd, OnTouchEnd, false);
    }
    function OnTouchMove(e) {
      CallbackMove(e, Touch);
    }
    function OnTouchEnd(e) {
      CallbackEnd(e, Touch);
      Win[RemoveListener](EventMove, OnTouchMove, false);
      Win[RemoveListener](EventEnd, OnTouchEnd, false); 
    }
  }

  function TouchDistance(position) {
    var distance = Math.sqrt(position.x * position.x + position.y * position.y);
    var angle = 180 / (Math.PI / Math.acos(Math.abs(position.y) / distance));
    return { d: distance, a: angle };
  }

  function SetOption(inputValue, defaultValue) {
    return (typeof inputValue == 'undefined') ? defaultValue : inputValue;
  }

  function Translate3D(x) {
    return 'translate3d('+ x +'px, 0px, 0px)';
  }

})();
