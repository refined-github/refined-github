// No point version is the same as zero; betas and such are -1
const clean = n => n === undefined ? '0' : String(n).replace(/^\D+/, '') || '-1';

// Sort numbers naturally, excluding letters
const compareSubVersion = (a, b) => clean(a).localeCompare(clean(b), 'en', {
	numeric: true
});

// Sort versions, discarding any letters
export default (a, b) => {
	a = a.split(/[.-]/);
	b = b.split(/[.-]/);
	for (let i = 0; i < a.length || i < b.length; i++) {
		const sort = compareSubVersion(a[i], b[i]);
		if (sort !== 0) {
			return sort;
		}
	}
	return 0;
};
