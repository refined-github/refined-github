export const shortcutMap = new Map<string, string>();

export const getFeatureId = (url: string): FeatureId => url.split('/').pop()!.split('.')[0] as FeatureId;

type FeatureHelper = {
	/** If `import.meta.url` is passed as URL, this will be the feature ID */
	id: string;

	/** A class name that can be added as attribute */
	class: string;

	/** A class selector that can be used with querySelector */
	selector: string;
};

export function getIdentifiers(url: string): FeatureHelper {
	const id = getFeatureId(url);
	return {
		id,
		class: 'rgh-' + id,
		selector: '.rgh-' + id,
	};
}

function noop(): void {/* empty */}

const httpLog = console.log.bind(console, '🌏');

export const log = {
	info: console.log,
	http: httpLog,
	setup({logging, logHttp}: {logging: boolean; logHttp: boolean;}): void {
		log.info = logging ? console.log : noop;
		log.http = logHttp ? httpLog : noop;
	},
};

let _isInitialLoad = true;

export function isInitialLoad(): boolean {
	return _isInitialLoad;
}

export function markAjaxedLoad(): void {
	_isInitialLoad = false;
}

export function listenToAjaxedLoad(): void {
	document.addEventListener('soft-nav:start', markAjaxedLoad, {once: true});
	document.addEventListener('pjax:start', markAjaxedLoad, {once: true});
}
