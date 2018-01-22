var _snapscroll = new SnapScroll({ limitScroll: true });
var viewports = document.querySelectorAll('.viewport');

snapscrolls = [];
each(viewports, function(viewport, i) {
  snapscrolls[i] = _snapscroll.init(viewport);
});

function each(el, fn) {
  for (var i = 0; i < el.length; i++) {
    fn(el[i], i);
  }
}
