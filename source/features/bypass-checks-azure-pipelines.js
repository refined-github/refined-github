import select from 'select-dom';
import domify from '../libs/domify';

export default async function () {
	// If anything errors, RGH will display the error next to the feature name
	await Promise.all(select.all('[href="/apps/azure-pipelines"]').map(bypass));
}

async function bypass(check) {
	const details = select('.status-actions', check.parentNode);

	const response = await fetch(details.href);

	if (!response.ok) {
		return;
	}

	const dom = domify(await response.text());

	// On status checks page for Azure Pipelines,
	// there is a link at the bottom that says 'View more details'.
	// This contains a direct link to the Azure Pipelines page.
	const directLink = select('[href*="visualstudio.com"].text-small', dom)
		|| select('[href^="https://dev.azure.com"].text-small', dom);
	details.href = directLink.href;
}
