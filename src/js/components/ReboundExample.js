var tabs = [];
var endValue = 0;
var viewportWidth = 0;

var springSystem = new rebound.SpringSystem();
var mainSpring = springSystem.createSpring();

var lastX = 0;
var panVelocity = 0;
var isDragging = false;





startDragging = function(x) {
  lastX = x;
  isDragging = true;
  viewportWidth = $("#wrapper").innerWidth();
  mainSpring.setAtRest();
}

continueDragging = function(x) {
  panVelocity = x - lastX;
  lastX = x;
  
  continueTrackingWithDelta(panVelocity);
}

continueTrackingWithDelta = function(delta) {
  panVelocity = delta;

  var progress = progressForValueInRange(delta,0,-viewportWidth);
  
  var currentValue = mainSpring.getCurrentValue();
  
  // Rubberband when beyond the scroll boundaries
  if ((currentValue + progress) < 0 || (currentValue + progress) > tabs.length - 1)
    progress *= 0.5;
  
  mainSpring.setCurrentValue(currentValue + progress);
  mainSpring.setAtRest();
}

endTrackingInputMode = function(inputMode) {
  var currentPosition = mainSpring.getCurrentValue();
  var startPosition = endValue;

  var positionDelta = currentPosition - startPosition;
  var swipingTowardsCurrentPage = (positionDelta > 0 && panVelocity > 0) || (positionDelta < 0 && panVelocity < 0); 
  var passedVelocityTolerance = (Math.abs(panVelocity) > 3);
  var passedDistanceTolerance = (Math.abs(positionDelta) > 0.3);
  
  if (inputMode == "desktop-scroll") {
    passedDistanceTolerance = true;
  }
  
  var shouldAdvance = (passedDistanceTolerance || passedVelocityTolerance) && !swipingTowardsCurrentPage;
  var directionIsForward = (panVelocity <= 0);
  
  if (shouldAdvance) {
    var targetIndex;
    
    if (currentPosition == startPosition) { // Current position is integral i.e. no tracking
      targetIndex = directionIsForward ? currentPosition + 1 : currentPosition - 1;
    } else {
      targetIndex = directionIsForward ? Math.ceil(currentPosition) : Math.floor(currentPosition);
    }
    
    selectTabIndex(targetIndex, true);
  } else {
    selectTabIndex(startPosition, true);        
  }
  
  var normalizedVelocity = progressForValueInRange(panVelocity,0,-viewportWidth);
  mainSpring.setVelocity(normalizedVelocity * 30);
  panVelocity = 0;
  isDragging = false;
}

selectTabIndex = function(i, animated) {
  if (i < 0)
    i = 0;
  else if (i > tabs.length - 1)
    i = tabs.length - 1;

  if (animated) {
    viewportWidth = $("#wrapper").innerWidth();
    endValue = i;
    mainSpring.setEndValue(i);
  } else {
    mainSpring.setCurrentValue(i);
  }
}





// Utilities

progressForValueInRange = function(value, start, end) {
  return (value - start) / (end - start);
}