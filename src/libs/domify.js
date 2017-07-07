export default html => {
	const fragment = document.createElement('template');
	fragment.innerHTML = html;

	// Return template for querying
	return fragment;
};
