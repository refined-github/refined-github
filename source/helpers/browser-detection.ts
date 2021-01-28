export default function isSafari(): boolean {
	return /Version\/[\d.]+.*Safari/.test(navigator?.userAgent);
}
