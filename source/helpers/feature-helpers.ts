export const shortcutMap = new Map<string, string>();

export const getFeatureID = (url: string): FeatureID => url.split('/').pop()!.split('.')[0] as FeatureID;

type FeatureHelper = {
	/** If `import.meta.url` is passed as URL, this will be the feature ID */
	id: string;

	/** A class name that can be added as attribute */
	class: string;

	/** A class selector that can be used with querySelector */
	selector: string;
};

export function getIdentifiers(url: string): FeatureHelper {
	const id = getFeatureID(url);
	return {
		id,
		class: 'rgh-' + id,
		selector: '.rgh-' + id,
	};
}

function noop(): void {}

const httpLog = console.log.bind(console, '🌏');

export const log = {
	info: console.log,
	http: httpLog,
	setup({logging, logHTTP}: {logging: boolean; logHTTP: boolean}): void {
		log.info = logging ? console.log : noop;
		log.http = logHTTP ? httpLog : noop;
	},
};
