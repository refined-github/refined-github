import select from 'select-dom';

const prefix = document.head.style.MozOrient === '' ? 'moz' : 'webkit';
const selectAll = select.all;

// `...args` preserves arguments.length for select.all
select.all = (...args) => {
	args[0] = args[0].replace(/:any\(/g, `:-${prefix}-any(`);
	return selectAll(...args);
};

select.last = (...args) => {
	const results = select.all(...args);
	return results[results.length - 1];
};

// Add global for easier debugging
window.select = select;
