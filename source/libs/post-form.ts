export default async function postForm(form: HTMLFormElement): Promise<Response> {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open('POST', form.action);
		// request.responseType = 'json';
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.onerror = reject;
		request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				return resolve(request.response);
			}

			reject(new Error(request.statusText));
		};
		// `as` required until https://github.com/microsoft/TSJS-lib-generator/issues/741

		request.send(new URLSearchParams(new FormData(form) as URLSearchParams).toString());
	});
}
