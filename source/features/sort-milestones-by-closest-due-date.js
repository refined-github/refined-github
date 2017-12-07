import select from 'select-dom';

export default function () {
	for (const a of select.all('a[href$="/milestones"], a[href*="/milestones?"]')) {
		const url = new URL(a.href);
		// Only if they aren't explicitly sorted differently
		if (!url.searchParams.get('direction') && !url.searchParams.get('sort')) {
			url.searchParams.set('direction', 'asc');
			url.searchParams.set('sort', 'due_date');
			a.href = url;
		}
	}
}
