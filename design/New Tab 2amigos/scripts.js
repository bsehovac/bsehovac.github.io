// var bookmarksHolder = document.querySelector('#bookmarks');

// chrome.bookmarks.getTree(function(tree) {
//   tree[0].children[0].children.forEach(function(item, i) {
//     if (item.title == 'New Tab Bookmarks') {
//       item.children.forEach(function(item, i) {
//         var bookmark = document.createElement('a');
//         bookmark.setAttribute('href', item.url);
//         bookmark.classList.add(item.title.toLowerCase().replace(' ', '-'))
//         bookmark.innerHTML = item.title;
//         bookmarksHolder.appendChild(bookmark);
//       });
//     }
//   });
// });