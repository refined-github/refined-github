import select from 'select-dom';

// Ensure that confirm buttons (like Mark all as read) are always in focus
export default function () {
	window.addEventListener('facebox:reveal', () => {
		select('.facebox-content button').focus();
	});
}
