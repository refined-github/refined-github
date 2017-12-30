import select from 'select-dom';

export default function () {
	for (const issuesLink of select.all('a[href$="issues"]')) {
		issuesLink.search = '?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc';
	}

	for (const prLink of select.all('a[href$="pulls"]')) {
		prLink.search = '?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc';
	}
}
