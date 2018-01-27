Prism.highlightAll(false);

var title = document.querySelector('h1');
var titleText = title.innerHTML;
var titleChar = 0;
title.innerHTML = '';

var titleTyping = setInterval(function() {
  title.innerHTML += titleText.charAt(titleChar);
  titleChar++;
  if (titleChar == titleText.length) clearTimeout(titleTyping);
}, 100);

(function() {
  var scrollsnap = new ScrollSnap('#demo-1 .scrollsnap');
})();

(function() {
  var scrollsnap = new ScrollSnap('#demo-2 .scrollsnap');
  var dots = document.querySelectorAll('#demo-2 .dot');
  scrollsnap.end(function(e){
    dots[e.old].classList.remove('active');
    dots[e.new].classList.add('active');
  });
})();

(function() {
  var scrollsnap = new ScrollSnap('#demo-3 .scrollsnap');
  var items = document.querySelectorAll('#demo-3 .item');
  scrollsnap.end(function(e){
    items[e.old].classList.remove('active');
    items[e.new].classList.add('active');
  });
})();


/*var viewport = document.querySelectorAll('.scrollsnap .viewport');
var scrollsnap = [];
for (var i = 0; i < viewport.length; i++) {
  scrollsnap[i] = new ScrollSnap(viewport[i], { start: 0 });
}*/