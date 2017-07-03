import select from 'select-dom';

export const getUsername = () => select('meta[name="user-login"]').getAttribute('content');

export const groupBy = (array, grouper) => array.reduce((map, item) => {
	const key = grouper(item);
	map[key] = map[key] || [];
	map[key].push(item);
	return map;
}, {});
