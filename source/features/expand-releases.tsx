import select from 'select-dom';

import features from '.';

function init(): void {
	const releasesLinks = select.all('a:is([href$="/releases"])');
	for (const link of releasesLinks) {
		link.href = link.href += `?expanded=true`
	}
}

void features.add(__filebasename, {
	init,
});
