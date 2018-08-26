<!DOCTYPE html>
<html>
<head>
  <title></title>
  <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
  <div id="view">
    <div id="game"></div>
    <div id="ui">
      <div id="time">0:00</div>
      <div class="button" id="start">Start</div>
      <div id="moves">0</div>
      <div id="undo">Undo</div>
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/95/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/2.0.1/TweenMax.min.js"></script>
  <script src="build/rubik.js?v=<?= time() ?>"></script>
  <script src="init.js"></script>
</body>
</html>

