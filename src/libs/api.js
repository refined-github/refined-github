export default endpoint => {
	const api = location.hostname === 'github.com' ? 'https://api.github.com/' : `${location.origin}/api/`;
	return fetch(api + endpoint).then(res => res.json());
};
