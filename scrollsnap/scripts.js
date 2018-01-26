/*var _snapscroll = new SnapScroll({ limitScroll: true, easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)' });
var viewports = document.querySelectorAll('.viewport');

snapscrolls = [];
each(viewports, function(viewport, i) {
  snapscrolls[i] = _snapscroll.init(viewport);
});

function each(el, fn) {
  for (var i = 0; i < el.length; i++) {
    fn(el[i], i);
  }
}*/

/*var dbg = document.querySelector('#debug');
var t0 = performance.now();
var t1 = performance.now();
dbg.innerHTML = (t1 - t0) + ' ms.';*/

var scrollsnap = [];
var viewport = document.querySelectorAll('.viewport');

for (var i = 0; i < viewport.length; i++) {
  scrollsnap[i] = new ScrollSnap(viewport[i], { Overscroll: false });
}