import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	// Ideally, we would run this immediately on page load, but there
	// seems to be a race condition. Delaying by 100ms makes it work
	// consistently.
	setTimeout(() => {
		select('.ellipsis-expander')!.click();
	}, 100);
}

void features.add({
	id: __filebasename,
	description: 'Shows latest commit description on page load.',
	screenshot: 'https://user-images.githubusercontent.com/1408859/85650947-ae013e00-b674-11ea-87a6-5b214130e9c5.png'
}, {
	include: [
		pageDetect.isRepoHome
	],
	init
});
