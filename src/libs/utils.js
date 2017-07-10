import select from 'select-dom';

export const getUsername = () => select('meta[name="user-login"]').getAttribute('content');

export const groupBy = (array, grouper) => array.reduce((map, item) => {
	const key = grouper(item);
	map[key] = map[key] || [];
	map[key].push(item);
	return map;
}, {});

export const emptyElement = element => {
	// https://stackoverflow.com/a/3955238/288906
	while (element.firstChild) {
		element.firstChild.remove();
	}
};

export const observeEl = (el, listener, options = {childList: true}) => {
	if (typeof el === 'string') {
		el = select(el);
	}

	// Run first
	listener();

	// Run on updates
	return new MutationObserver(listener).observe(el, options);
};
