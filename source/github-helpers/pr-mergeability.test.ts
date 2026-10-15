import {$$optional} from 'select-dom';
import {afterEach, assert, test} from 'vitest';

import {prMergeabilityBoxCaption} from './selectors.js';

afterEach(() => {
	document.body.replaceChildren();
});

test.each([
	'MergeBoxSectionHeader-module__wrapper--previous',
	'wrapper__OsSk1Y wrapperLayout__1MCZo3',
])('PR mergeability caption in %s', wrapperClass => {
	document.body.innerHTML = `
		<section aria-label="Reviews"><h3>Changes reviewed</h3><div class="fgColor-muted">1 approval</div></section>
		<section aria-label="Conflicts">
			<div class="${wrapperClass}">
				<h3>No conflicts with base branch</h3>
				<div class="fgColor-muted">Merging can be performed automatically.</div>
			</div>
		</section>
	`;

	const captions = $$optional(prMergeabilityBoxCaption);
	assert.equal(captions.length, 1);
	assert.equal(captions[0].textContent, 'Merging can be performed automatically.');
});
