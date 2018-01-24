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
