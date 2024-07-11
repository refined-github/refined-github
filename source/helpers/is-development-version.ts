const {version} = chrome.runtime.getManifest();

export default function isDevelopmentVersion(): boolean {
	return version === '0.0.0';
}
