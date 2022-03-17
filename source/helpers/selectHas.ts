// Adapted from https://stackoverflow.com/a/35271017/288906
const hasSelectorRegex = /:has\(((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)/;

export default function selectHas<ExpectedElement extends HTMLElement>(selectors: string | string[], baseElement: HTMLElement | Document = document): ExpectedElement | void {
	const count = [...String(selectors).matchAll(/has\(/g)].length;
	if (count !== 1) { // Only one :has allowed. KISS
		throw new Error(`Only one \`:has()\` required/allowed, found ${count}`);
	}

	const parts = String(selectors).split(hasSelectorRegex);

	const [baseSelector, hasSelector, finalSelector] = parts;
	if (/\s$/.test(baseSelector)) {
		throw new Error('No spaces before :has() supported');
	}

	if (/^[+~]/.test(hasSelector.trim())) {
		throw new Error('This polyfill only supports looking into the children of the base element');
	}

	for (const expectedChild of baseElement.querySelectorAll(hasSelector)) {
		const base = expectedChild.closest(baseSelector);
		if (base) {
			const finalElement = finalSelector.trim() ? base.querySelector(finalSelector) : base;
			if (finalElement) {
				return finalElement as ExpectedElement;
			}
		}
	}
}
