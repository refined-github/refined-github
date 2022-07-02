const {version} = browser.runtime.getManifest();

export default function isDevelopmentVersion(): boolean {
	return false;
	return version === '0.0.0';
}
