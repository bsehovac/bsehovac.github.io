(function() {

  var duration = 0;
  var easing = 1;
  var holderClass = 2;
  var itemClass = 3;
  var autoRefresh = 4;
  var viewports = 5;
  var holders = 6;
  var holderItems = 7;
  var holderPositions = 8;
  var holderCurrents = 9;
  var dragStart = 10;
  var dragMove = 11;
  var dragEnd = 12;
  var refresh = 13;
  var callbackStart = 14;
  var callbackEnd = 15;
  var limitScroll = 16;
  var refreshTimeout = 17;

  var style = 'style';
  var transform = 'transform';
  var transitionDuration = 'transitionDuration';
  var transitionTimingFunction = 'transitionTimingFunction';
  var transitionProperty = 'transitionProperty';
  var prototype = 'prototype';

  this.SnapScroll = function(options) {

    var snapscroll = this;
    options = (options) ? options : {};

    snapscroll[duration]       = setOption(options.duration, 350);
    snapscroll[easing]         = setOption(options.easing, 'ease');
    snapscroll[holderClass]    = setOption(options.holderClass, 'holder');
    snapscroll[itemClass]      = setOption(options.itemClass, 'item');
    snapscroll[autoRefresh]    = setOption(options.refreshResize, true);
    snapscroll[refreshTimeout] = setOption(options.refreshTimeout, 0);
    snapscroll[limitScroll]    = setOption(options.limitScroll, false);

    snapscroll[viewports]       = [];
    snapscroll[holders]         = [];
    snapscroll[holderItems]     = [];
    snapscroll[holderPositions] = [];
    snapscroll[holderCurrents]  = [];
    snapscroll[callbackStart]   = [];
    snapscroll[callbackEnd]     = [];

    var minDistance = 5;
    var minAngle = 55;
    var endLimit = 0.3;

    var dragActive = false;
    var dragStarted = false;
    var dragActiveSlider;
    var mouseStart = {};
    var mouseCurrent = {};
    var mouseDelta = {};
    var mouseDeltaTotal = {};
    var slideDirection;
    var slideWidth;
    var slideStart;
    var slidesLength;
    var slidesWidth;
    var holderWidth;
    var viewportWidth;
    var viewportSlides;
    var resizeTimeout;
    var touchType;

    snapscroll[dragStart] = function(e, index, touch) {
      if (dragStarted) return;
      dragActive = true;
      touchType = touch;
      dragActiveSlider = index;
      mouseStart = getPos(e);
      mouseDeltaTotal = { x: 0, y: 0 };
      slideWidth = snapscroll[holderItems][dragActiveSlider][1].offsetWidth;
      slidesLength = snapscroll[holderItems][dragActiveSlider].length;
      slidesWidth = ((slidesLength - 1) * slideWidth);
      holderWidth = snapscroll[holders][dragActiveSlider].offsetWidth;
      viewportWidth = snapscroll[viewports][dragActiveSlider].offsetWidth;
      viewportSlides = Math.round(viewportWidth / slideWidth);
      snapscroll[holders][dragActiveSlider][style][transitionDuration] = '0ms';
      slideStart = snapscroll[holderPositions][dragActiveSlider];
      var tagName = e.target.tagName;
      var allowed = tagName !== 'SELECT' && tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'BUTTON';
      if (touchType === 'mouse' && allowed) {
        e.preventDefault();
      }
    };

    snapscroll[dragMove] = function(e) {
      if (!dragActive) return false;
      if (touchType == 'mouse') dragStarted = true;
      mouseCurrent = getPos(e);
      mouseDelta.x = mouseCurrent.x - mouseStart.x;
      mouseDelta.y = mouseCurrent.y - mouseStart.y;
      if (mouseDelta.x === 0 && mouseDelta.y === 0) return;
      mouseStart = mouseCurrent;
      if (dragStarted) {
        e.preventDefault();
        slideDirection = (mouseDelta.x > 0) ? -1 : 1;
        var firstDragSmooth = snapscroll[holderPositions][dragActiveSlider] > 0 && slideDirection < 0;
        var lastDragSmooth = snapscroll[holderPositions][dragActiveSlider] < -(holderWidth - ((snapscroll[limitScroll]) ? viewportWidth : slideWidth))  && slideDirection > 0;
        if (firstDragSmooth || lastDragSmooth) { mouseDelta.x *= endLimit; }
        snapscroll[holderPositions][dragActiveSlider] += mouseDelta.x;
        snapscroll[holders][dragActiveSlider][style][transform] = 'translateX('+ snapscroll[holderPositions][dragActiveSlider] +'px)';
      } else {
        e.preventDefault();
        mouseDeltaTotal.x += mouseDelta.x;
        mouseDeltaTotal.y += mouseDelta.y;
        var distance = Math.sqrt(mouseDeltaTotal.x * mouseDeltaTotal.x + mouseDeltaTotal.y*mouseDeltaTotal.y);
        var angle = 180 / (Math.PI / Math.acos(Math.abs(mouseDeltaTotal.y) / distance));
        if (distance > minDistance && angle > minAngle) {
          dragStarted = true;
          snapscroll[callbackStart][dragActiveSlider]();
        } else if (distance > minDistance && angle < minAngle) {
          dragStarted = false;
          dragActive = false;
        }
      }
    };

    snapscroll[dragEnd] = function(e) {
      if (!dragActive) return false;
      var intensity = (snapscroll[holderPositions][dragActiveSlider] - slideStart)/slideWidth;
      var intensityHalf = Math.abs(intensity) < 0.5;
      var backward1 = intensity > 0 && slideDirection > 0 && intensityHalf;
      var backward2 = intensity < 0 && slideDirection < 0 && intensityHalf;
      var slidePosition = snapscroll[holderCurrents][dragActiveSlider];
      if (!backward1 && !backward2) {
        intensity *= -1;
        intensity = Math.round(intensity);
        intensity = (intensity !== 0) ? intensity : slideDirection;
        slidePosition += intensity;
      }

      var maxPoint = slidesLength - ((snapscroll[limitScroll]) ? viewportSlides : 1);
      if (slidePosition < 0) slidePosition = 0;
      if (slidePosition > maxPoint) slidePosition = maxPoint;

      var slideOffset = -snapscroll[holderItems][dragActiveSlider][slidePosition].offsetLeft;

      // fix easing duration
      //Math.abs(snapscroll[holderPositions][dragActiveSlider] - slideOffset)/slideWidth/2+0.5;

      snapscroll[holderCurrents][dragActiveSlider] = slidePosition;
      snapscroll[holderPositions][dragActiveSlider] = slideOffset;
      snapscroll[holders][dragActiveSlider][style][transitionDuration] = snapscroll[duration] + 'ms';
      snapscroll[holders][dragActiveSlider][style][transform] = 'translateX('+ slideOffset +'px)';
      snapscroll[callbackEnd][dragActiveSlider]();
      dragStarted = false;
      dragActive = false;
    };

    snapscroll[refresh] = function(index) {
      var holder = snapscroll[holders][index];
      var position = -snapscroll[holderItems][index][snapscroll[holderCurrents][index]].offsetLeft;
      snapscroll[holderPositions][index] = position;
      holder[style][transitionDuration] = '0ms';
      holder[style][transform] = 'translateX('+ position +'px)';
    };

    document.addEventListener('touchmove', snapscroll[dragMove], { passive: false });
    document.addEventListener('mousemove', snapscroll[dragMove]);
    document.addEventListener('touchend', snapscroll[dragEnd]);
    document.addEventListener('mouseup', snapscroll[dragEnd]);

    if (snapscroll[autoRefresh]) {

      window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
          for (var i = 0; i < snapscroll[holders].length; i++) {
            snapscroll[refresh](i);
          }
        }, snapscroll[refreshTimeout]);
      }, false);
    }

  };

  this.SnapScroll[prototype].init = function(viewport) {

    var snapscroll = this;

    var holder = viewport.querySelector('.' + snapscroll[holderClass]);
    var items  = holder.querySelectorAll('.' + snapscroll[itemClass]);
    var index  = snapscroll[holders].length;

    holder.addEventListener('touchstart', function(e) { snapscroll[dragStart](e, index, 'touch'); });
    holder.addEventListener('mousedown', function(e) { snapscroll[dragStart](e, index, 'mouse'); });

    holder.setAttribute('snapscroll', index);
    holder[style][transitionTimingFunction] = snapscroll[easing];
    holder[style][transitionProperty] = 'transform';
    holder[style][transform] = 'translateX(0px)';
    holder[style][transitionDuration] = '0ms';

    snapscroll[viewports].push(viewport);
    snapscroll[holders].push(holder);
    snapscroll[holderItems].push(items);
    snapscroll[holderPositions].push(0);
    snapscroll[holderCurrents].push(0);

    snapscroll[callbackStart].push(function(){});
    snapscroll[callbackEnd].push(function(){});

    var controls = new SnapScrollControls(snapscroll, index);
    return controls;
  };

  function SnapScrollControls(snapscroll, index) {
    this.s = snapscroll;
    this.i = index;
  }

  SnapScrollControls[prototype].start = function(callback) {
    var snapscroll = this.s;
    var index = this.i;
    snapscroll[callbackStart][index] = callback;
  };

  SnapScrollControls[prototype].end = function(callback) {
    var snapscroll = this.s;
    var index = this.i;
    snapscroll[callbackEnd][index] = callback;
  };

  SnapScrollControls[prototype].refresh = function() {
    var snapscroll = this.s;
    var index = this.i;
    snapscroll[refresh](index);
  };

  SnapScrollControls[prototype].current = function() {
    var snapscroll = this.s;
    var index = this.i;
    return snapscroll[holderCurrents][index];
  };

  SnapScrollControls[prototype].length = function() {
    var snapscroll = this.s;
    var index = this.i;
    return snapscroll[holderItems][index].length;
  };

  SnapScrollControls[prototype].first = function() {
    return this.current() === 0;
  };

  SnapScrollControls[prototype].last = function() {
    return this.current() == (this.length() - 1);
  };

  SnapScrollControls[prototype].next = function(transitionDuration) {
    this.move(this.current() + 1, transitionDuration);
  };

  SnapScrollControls[prototype].prev = function(transitionDuration) {
    this.move(this.current() - 1, transitionDuration);
  };

  SnapScrollControls[prototype].move = function(i, transitionDuration) {
    var snapscroll = this.s;
    var index = this.i;
    transitionDuration = setOption(transitionDuration, snapscroll[duration]);

    var holder = snapscroll[holders][index];
    var items = snapscroll[holderItems][index];
    var length = this.length();
    var next = parseInt(i, 10);

    if (next > length - 1) next = length - 1;
    if (next < 0) next = 0;

    var position = -next * items[0].offsetWidth;
    snapscroll[holderPositions][index] = position;
    snapscroll[holderCurrents][index] = next;

    holder[style][transitionDuration] = transitionDuration + 'ms';
    holder[style][transform] = 'translateX('+ position +'px)';
  };

  function setOption(inputValue, defaultValue) {
    return (typeof inputValue == 'undefined') ? defaultValue : inputValue;
  }

  function getPos(e) {
    e = event.changedTouches ? event.changedTouches[0] : e;
    return { x: e.pageX, y: e.pageY };
  }

})();
