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


var viewport = document.querySelectorAll('.scrollsnap .viewport');
var scrollsnap = [];
for (var i = 0; i < viewport.length; i++) {
  scrollsnap[i] = new ScrollSnap(viewport[i], { start: 0 });
}