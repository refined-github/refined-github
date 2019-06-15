import features from '../libs/features';
import namedColors from 'color-name-list';

function init(): void {
	addColors();
}
const colorNames: string = (namedColors as { name: string, hex: string }[]).map(color => color.name).join("|");
const regexNamed: RegExp = new RegExp("^(" + colorNames + ")$", "i");
// Ex: #123, #123456 or 0x123456 (unix style colors, used by three.js)
const regexHex: RegExp = /^(#|0x)([0-9A-F]{6,8}|[0-9A-F]{3,4})$/i;
// Ex: rgb(0,0,0) or rgba(0,0,0,0.2)
const regexRGB: RegExp = /^rgba?(\([^\)]+\))?/i;
const regexRGBA: RegExp = /rgba/i;
// Ex: hsl(0,0%,0%) or hsla(0,0%,0%,0.2);
const regexHSL: RegExp = /^hsla?(\([^\)]+\))?/i;

// Misc regex
const regexQuotes: RegExp = /['"]/g;
const regexUnix: RegExp = /^0x/;
const regexPercent: RegExp = /%%/g;

// Don't use a div, because GitHub-Dark adds a :hover background
// color definition on divs
const block: HTMLElement = document.createElement("span");
block.className = "rgh-color-block";

function addNode(el: Node, val: string): void {
	const node: Node = block.cloneNode();
	node.style.backgroundColor = val;
	// Don't add node if color is invalid
	if (node.style.backgroundColor !== "") {
		el.insertBefore(node, el.childNodes[0]);
	}
}

function getTextContent(el: Node): string | null {
	return el ? el.textContent : "";
}

function rgb(els: Array<Node> | null, el: Node, txt: string | null): string {
	// Color in a string contains everything
	if (el.classList.contains("pl-s")) {
		txt = txt.match(regexRGB)[0];
	} else {
		// Rgb(a) colors contained in multiple "pl-c1" spans
		let indx: number = regexRGBA.test(txt) ? 4 : 3;
		const tmp: Array<string> = [];
		while (indx) {
			tmp.push(getTextContent(els.shift()));
			indx--;
		}
		txt += "(" + tmp.join(",") + ")";
	}
	addNode(el, txt);
	return els;
}

function hsl(els: Array<Node>, el: Node, txt: string) {
	const tmp: RegExp = /a$/i.test(txt);
	if (el.classList.contains("pl-s")) {
		// Color in a string contains everything
		txt: string = txt.match(regexHSL)[0];
	} else {
		// Traverse this HTML... & els only contains the pl-c1 nodes
		// <span class="pl-c1">hsl</span>(<span class="pl-c1">1</span>,
		// <span class="pl-c1">1</span><span class="pl-k">%</span>,
		// <span class="pl-c1">1</span><span class="pl-k">%</span>);
		// using getTextContent in case of invalid css
		txt = txt + "(" + getTextContent(els.shift()) + "," +
			getTextContent(els.shift()) + "%," +
			// Hsla needs one more parameter
			getTextContent(els.shift()) + "%" +
			(tmp ? "," + getTextContent(els.shift()) : "") + ")";
	}
	// Sometimes (previews only?) the .pl-k span is nested inside
	// the .pl-c1 span, so we end up with "%%"
	addNode(el, txt.replace(regexPercent, "%"));
	return els;
}

// Loop with delay to allow user interaction
function* addBlock(els: Array<Node>) {
	let last: string = "";
	while (els.length) {
		let el: Node = els.shift();
		let txt: string = el.textContent;
		if (
			// No swatch for JavaScript Math.tan
			last === "Math" ||
			// Ignore nested pl-c1 (see https://git.io/fNF3N)
			el.parentNode && el.parentNode.classList.contains("pl-c1")
		) {
			// noop
		} else if (!el.querySelector(".rgh-color-block")) {
			if (el.classList.contains("pl-s")) {
				txt = txt.replace(regexQuotes, "");
			}
			if (regexHex.test(txt) || regexNamed.test(txt)) {
				addNode(el, txt.replace(regexUnix, "#"));
			} else if (regexRGB.test(txt)) {
				els = rgb(els, el, txt);
			} else if (regexHSL.test(txt)) {
				els = hsl(els, el, txt);
			}
		}
		last = txt;
		yield els;
	}
}

function addColors(): void {
	if (document.querySelector(".highlight")) {
		let status;
		// .pl-c1 targets css hex colors, "rgb" and "hsl"
		const els: Array<Node> = [...document.querySelectorAll(".pl-c1, .pl-s")];
		const iter: IterableIterator<Node> = addBlock(els);
		const loop: () => void = () => {
			for (let i = 0; i < 40; i++) {
				status = iter.next();
			}
			if (!status.done) {
				requestAnimationFrame(loop);
			}
		};
		loop();
	}
}
features.add({
	id: 'view-color',
	description: 'View various color codes',
	screenshot: '',
	include: [
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
