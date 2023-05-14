import {ParseSelector} from 'typed-query-selector/parser.js';

const _isHasSelectorSupported = globalThis.CSS?.supports('selector(:has(a))');
export const isHasSelectorSupported = (): boolean => _isHasSelectorSupported;

// Adapted from https://stackoverflow.com/a/35271017/288906
const hasSelectorRegex = /:has\(((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)/;

export default function selectHas<Selector extends string, ExpectedElement extends HTMLElement = ParseSelector<Selector, HTMLElement>>(selectors: Selector | Selector[], baseElement: ParentNode = document): ExpectedElement | void {
	const count = [...String(selectors).matchAll(/has\(/g)].length;
	if (count !== 1) { // Only one :has allowed. KISS
		throw new Error(`Only one \`:has()\` required/allowed, found ${count}`);
	}

	const parts = String(selectors).split(hasSelectorRegex);

	const [baseSelector, hasSelector, finalSelector] = parts;
	if (['', '*'].includes(baseSelector.trim())) {
		throw new Error('* is super inefficient in :has()');
	}

	if (/\s$/.test(baseSelector)) {
		throw new Error('No spaces before :has() supported');
	}

	if (/^[+~]/.test(hasSelector.trim())) {
		throw new Error('This polyfill only supports looking into the children of the base element');
	}

	for (const base of baseElement.querySelectorAll<ExpectedElement>(baseSelector)) {
		if (base.querySelector(':scope ' + hasSelector)) {
			if (!finalSelector.trim()) {
				return base;
			}

			const finalElement = base.querySelector<ExpectedElement>(finalSelector);
			if (finalElement) {
				return finalElement;
			}
		}
	}
}
