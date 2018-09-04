class SvgIcons {

	constructor( options ) {

		options = Object.assign( {
			tagName: 'icon',
			className: 'icon',
			icons: {},
			styles: true,
			observe: true,
			convert: false,
		}, options || {} );

		this.tagName = options.tagName;
		this.className = options.className;
		this.icons = options.icons;

		this.svgTag = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		this.svgTag.setAttribute( 'class', this.className );

		if ( options.styles ) this.addStyles();
		if ( options.convert ) this.convertAllIcons();

		if ( options.observe ) {

			const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
			this.observer = new MutationObserver( mutations => { this.convertAllIcons(); } );
			this.observer.observe( document.documentElement, { childList: true, subtree: true } );

		}

		return this;

	}

	convertAllIcons() {

		document.querySelectorAll( this.tagName ).forEach( icon => { this.convertIcon( icon ); } );

	}

	convertIcon( icon ) {

		const svgData = this.icons[ icon.attributes[0].localName ];

		if ( typeof svgData === 'undefined' ) return;

		const svg = this.svgTag.cloneNode( true );
		const viewBox = svgData.viewbox.split( ' ' );

		svg.setAttributeNS( null, 'viewBox', svgData.viewbox );
		svg.style.width = viewBox[2] / viewBox[3] + 'em';
		svg.style.height = '1em';
		svg.innerHTML = svgData.content;

		icon.parentNode.replaceChild( svg, icon );

	}

	addStyles() {

		const style = document.createElement( 'style' );
		style.innerHTML = `
			.${this.className} {
				display: inline-block;
				font-size: inherit;
				overflow: visible;
				vertical-align: -0.125em;
				preserveAspectRatio: none;
			}`;
		document.head.appendChild( style );

	}

}

export { SvgIcons };
