export default async function oneEvent(target: Element, type: string): Promise<Event> {
	return new Promise(resolve => {
		target.addEventListener(type, resolve, {once: true});
	});
}
