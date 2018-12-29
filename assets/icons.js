( icons => {
  const xmlns = 'http://www.w3.org/2000/svg'
  const svgTag = document.createElementNS(xmlns, 'svg')

  svgTag.setAttribute('class', 'icon')

  const convert = element => {
    const name = element.getAttribute( 'name' )
    const svgData = icons[ name ]
    if (typeof svgData === 'undefined') return

    const svg = svgTag.cloneNode( true )
    const viewbox = svgData.v.split(' ')
    const width = parseFloat( viewbox[2] ) / parseFloat( viewbox[3] )
    svg.setAttributeNS(null, 'viewBox', svgData.v)
    svg.style.cssText = 'height: 1em; width' + width + 'em;'

    svg.innerHTML = svgData.c
    element.parentNode.replaceChild(svg, element)
  }

  const observer = new MutationObserver( mutations => {
    document.querySelectorAll('icon').forEach( convert )
  }).observe(document.documentElement, {
    childList: true,
    subtree: true
  })

} )( {

  'skype': {
    v: '0 0 641941 641941',
    c: '<path fill="none" stroke="currentColor" stroke-width="24626.3" stroke-linecap="round" stroke-linejoin="round" d="M418712 226303c-13041,-29955 -53827,-44391 -95592,-43555 -50667,-1015 -99891,20447 -99891,64825 0,102728 195483,50480 195483,151736 0,44378 -49225,65840 -99891,64825 -41766,836 -82551,-13600 -95592,-43555m97742 -354598c142191,-1 257460,115270 257460,257461 0,15683 -1407,31038 -4093,45948 12343,22012 19391,47392 19391,74423 -1,84160 -68227,152387 -152387,152387 -27031,0 -52411,-7048 -74422,-19391 -14909,2685 -30266,4092 -45949,4092 -142191,1 -257461,-115268 -257461,-257459 0,-15685 1407,-31039 4093,-45949 -12344,-22010 -19391,-47393 -19391,-74423 0,-84160 68226,-152387 152387,-152388 27031,1 52412,7048 74423,19392 14910,-2686 30265,-4093 45949,-4093z"/>',
  },

  'viber': {
    v: '0 0 1368682 1368682',
    c: '<path fill="none" stroke="currentColor" stroke-width="52505.8" stroke-linecap="round" stroke-linejoin="round" d="M123793 596831c0,-416867 168051,-497578 560548,-497578 392498,0 560549,80711 560549,497578 0,416865 -168051,497578 -560549,497578 -20321,0 -40009,-232 -59134,-700l-238338 237695 0 -266631c-181692,-50623 -263076,-177906 -263076,-467942zm707917 354042c-220950,-91672 -356556,-205209 -461500,-418502 -16386,-33310 -30201,-67926 -44279,-102315 -12835,-31359 6075,-63758 25981,-87387 18681,-22173 42721,-39146 68755,-51655 20322,-9761 40367,-4133 55207,13092 32079,37235 61553,76377 85415,119540 14673,26549 10644,59003 -15948,77070 -8672,5894 -26862,20371 -32246,29132 -6616,10766 -6932,23471 -2671,35179 32794,90126 88074,160211 178787,197956 14515,6039 29095,13072 45816,11121 28009,-3271 37075,-33994 56701,-50043 19182,-15684 43697,-15890 64357,-2816 29532,18688 92279,62394 117663,84748 17335,15266 23304,35300 13544,56022 -17876,37948 -43877,69531 -81398,89675 -26215,14074 -46360,10727 -74184,-817zm-125718 -507463c74816,5401 126369,56955 131773,131770m-131773 -216139c122719,8863 207279,93422 216139,216139m-216139 -300506c170619,12322 288184,129887 300506,300506"/>',
  },

  'github': {
    v: '0 0 10361040 10361040',
    c: '<path fill="none" stroke="currentColor" stroke-width="397473" stroke-linecap="round" stroke-linejoin="round" d="M2141184 6993005c802728,37542 280490,1101066 2010635,947503m1028701 -7148672c2423823,0 4388684,1964862 4388684,4388684 0,2423823 -1964861,4388684 -4388684,4388684 -2423822,0 -4388684,-1964861 -4388684,-4388684 0,-2423822 1964862,-4388684 4388684,-4388684zm-1025711 8657576l0 -1760611c0,-204776 30962,-381008 142942,-555228 56305,-87598 125786,-165611 182977,-252938 6460,-9870 7452,-22369 2629,-33141 -4777,-10666 -14752,-18072 -26290,-19785 -789988,-117884 -1512374,-491936 -1806836,-1272581 -239253,-634247 -124148,-1434406 315659,-1955366 17727,-20987 34192,-60407 24998,-87974 -81303,-243399 -98790,-684739 -17832,-927312l61128 -183083 190999 27958c281738,41253 532018,196243 771135,341438 45910,27882 118485,79170 169037,94508 21963,6685 39930,4612 62029,-1367 309545,-83677 629260,-131134 950056,-135400l3020 -45 3050 45c321052,4146 640932,51678 950717,135520 22294,6040 39811,7572 61909,782 51183,-15759 122150,-65875 168616,-94073 239163,-145150 489488,-300291 771285,-341423l190880 -27882 61127 182977c80718,241657 63877,682681 -17080,925149 -9645,28904 5378,67933 24126,90122 439973,520915 554942,1321164 315704,1955411 -294447,780600 -1016803,1154607 -1806746,1272476 -11598,1728 -21543,9299 -26335,20010 -4807,10727 -3876,23151 2569,33006 56891,86861 126011,164394 182151,251436 112731,174775 143873,351563 143873,557150l0 1760191"/>',
  },

  'codepen': {
    v: '0 0 1082649 1082649',
    c: '<path fill="none" stroke="currentColor" stroke-width="41532.9" stroke-linecap="round" stroke-linejoin="round" d="M126836 382583l414488 -299842 414489 299842 0 317482 -414489 299843 -414488 -299843 0 -317482zm0 317482l414488 -299842 0 -317482m-414488 299842l414488 299845 0 317480m0 -317480l414489 -299845m-414489 17640l414489 299842"/>',
  },

} )
