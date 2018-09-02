const Icons = ( () => {

  const win = window;
  const doc = win.document;
  const iconClass = 'icon';
  const xmlns = 'http://www.w3.org/2000/svg';
  const svgTag = doc.createElementNS(xmlns, 'svg');

  svgTag.setAttribute('class', iconClass);

  const svgSupportInnerHTML = typeof svgTag.innerHTML !== 'undefined';
  const mutationObserverSupport = 'MutationObserver' in win;

  const svgIconReady = ( mutationObserverSupport )
    ? ( selector, callback ) => {
      const MutationObserver = win.MutationObserver || win.WebKitMutationObserver;
      const observer = new MutationObserver( mutations => {
        doc.querySelectorAll( 'i.' + selector ).forEach( element => {
          callback( element );
        } );
      } ).observe( doc.documentElement, {
        childList: true,
        subtree: true
      } );
    } : ( selector, callback ) => {
      doc.addEventListener( 'DOMContentLoaded', e => {
        doc.getElementsByClassName( 'i.' + selector ).forEach( element => {
          callback( elements );
        } );
      } );
    };

  svgIconReady( iconClass, icon => {
    var iconName = (icon.className.split(iconClass +' '+ iconClass +'--'))[1],
        svgData = icons[iconName];

    if (typeof svgData === 'undefined') return;

    var svg = svgTag.cloneNode(true);
    svg.setAttributeNS(null, 'viewBox', svgData.v);

    if (svgSupportInnerHTML) {
      svg.innerHTML = svgData.c;
    } else {
      // IE Support
      var dXML = new DOMParser();
      dXML.async = false;
      var sXML = '<svg xmlns="'+ xmlns +'">' + svgData.c + '</svg>';
      var svgDocElement = dXML.parseFromString(sXML, 'text/xml').documentElement;
      var childNode = svgDocElement.firstChild;
      while (childNode) {
        svg.appendChild(svg.ownerDocument.importNode(childNode, true));
        childNode = childNode.nextSibling;
      }
    }

    icon.parentNode.replaceChild(svg, icon);
  } );

  const icons = {};

  icons['music'] = {
    v: '0 0 26712 21370',
    c: '<g fill="currentColor"><path d="M11966 392l-4951 4950 -5680 0c-738,0 -1336,598 -1336,1336l0 8014c0,737 598,1336 1336,1336l5680 0 4951 4950c836,836 2280,249 2280,-944l0 -18696c0,-1194 -1445,-1780 -2280,-944z"/><path d="M18823 6407c-644,-352 -1457,-120 -1815,526 -356,646 -120,1458 526,1815 718,394 1165,1137 1165,1937 0,800 -446,1543 -1164,1937 -646,357 -882,1169 -526,1815 358,649 1171,879 1815,526 1571,-865 2547,-2504 2547,-4278 0,-1774 -976,-3413 -2548,-4277l0 0z"/><path d="M26712 10685c0,-3535 -1784,-6786 -4773,-8695 -623,-397 -1449,-213 -1843,415 -395,628 -210,1459 412,1857 2212,1413 3533,3814 3533,6423 0,2609 -1321,5010 -3533,6423 -623,397 -807,1228 -412,1856 362,577 1175,843 1843,415 2989,-1909 4773,-5159 4773,-8695z"/></g>',
  };

  icons['settings'] = {
    v: '0 0 512 512',
    c: '<path fill="currentColor" d="M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z" class=""></path>',
  }

  icons['home'] = {
    v: '0 0 576 512',
    c: '<path fill="currentColor" d="M488 312.7V456c0 13.3-10.7 24-24 24H348c-6.6 0-12-5.4-12-12V356c0-6.6-5.4-12-12-12h-72c-6.6 0-12 5.4-12 12v112c0 6.6-5.4 12-12 12H112c-13.3 0-24-10.7-24-24V312.7c0-3.6 1.6-7 4.4-9.3l188-154.8c4.4-3.6 10.8-3.6 15.3 0l188 154.8c2.7 2.3 4.3 5.7 4.3 9.3zm83.6-60.9L488 182.9V44.4c0-6.6-5.4-12-12-12h-56c-6.6 0-12 5.4-12 12V117l-89.5-73.7c-17.7-14.6-43.3-14.6-61 0L4.4 251.8c-5.1 4.2-5.8 11.8-1.6 16.9l25.5 31c4.2 5.1 11.8 5.8 16.9 1.6l235.2-193.7c4.4-3.6 10.8-3.6 15.3 0l235.2 193.7c5.1 4.2 12.7 3.5 16.9-1.6l25.5-31c4.2-5.2 3.4-12.7-1.7-16.9z" class=""></path>',
  }

} )();

export { Icons };
