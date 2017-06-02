const cdForm = document.querySelector('#custom-domain');
const cdInput = document.querySelector('#custom-domain-origin');

if (!chrome.permissions) {
	cdForm.disabled = true;
	cdForm.querySelector('p').textContent = 'Your browser doesn’t support the required Permission API.';
}

cdForm.addEventListener('submit', event => {
	event.preventDefault();

	const origin = new URL(cdInput.value).origin;

	if (origin) {
		chrome.permissions.request({
			origins: [
				`${origin}/*`
			]
		}, granted => {
			if (granted) {
				cdForm.reset();
			}
		});
	}
});
