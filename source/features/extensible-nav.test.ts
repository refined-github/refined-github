import {expect, it} from 'vitest';

import {markNativeNavAsReplaced, shouldReplaceNativeNav} from './extensible-nav-helpers.js';

it('does not replace the same native nav twice', () => {
	const nativeNav = document.createElement('nav');

	expect(shouldReplaceNativeNav(nativeNav)).toBe(true);

	markNativeNavAsReplaced(nativeNav);

	expect(shouldReplaceNativeNav(nativeNav)).toBe(false);
	expect(nativeNav.classList.contains('rgh-extensible-nav-removed')).toBe(true);
});
