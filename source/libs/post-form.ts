export default async function postForm(form: HTMLFormElement): Promise<Response> {
	const response = await fetch(form.action, {
		// `as` required until https://github.com/microsoft/TSJS-lib-generator/issues/741
		body: new URLSearchParams(new FormData(form) as URLSearchParams),
		method: 'POST'
	});

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	return response;
}
