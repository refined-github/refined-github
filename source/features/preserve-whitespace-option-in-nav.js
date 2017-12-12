import select from 'select-dom';

// When navigating with next/previous in review mode, preserve whitespace option.
export default function () {
	const navLinks = select.all('.commit > .BtnGroup.float-right > a.BtnGroup-item');
	if (navLinks.length === 0) {
		return;
	}

	const url = new URL(location.href);
	const hidingWhitespace = url.searchParams.get('w') === '1';

	if (hidingWhitespace) {
		for (const a of navLinks) {
			const linkUrl = new URL(a.href);
			linkUrl.searchParams.set('w', '1');
			a.href = linkUrl;
		}
	}
}
