import type {Action} from 'svelte/action';

const portal: Action<HTMLElement, () => Element> = (node, getTarget) => {
	let destroyed = false;

	async function move(): Promise<void> {
		if (!node.isConnected) {
			// Some features attach their element to the DOM asynchronously (e.g. after a fetch),
			// so the node might not be connected yet by the time this microtask runs.
			// Give it one more frame before giving up.
			await new Promise(resolve => {
				requestAnimationFrame(resolve);
			});
		}

		if (destroyed) {
			return;
		}

		if (!node.isConnected) {
			// This is a requirement for `tool-tip`
			// https://github.com/refined-github/refined-github/pull/9668
			throw new Error('The element was not added to the document in time');
		}

		getTarget().append(node);
	}

	if (node.isConnected) {
		void move();
	} else {
		queueMicrotask(() => {
			void move();
		});
	}

	return {
		destroy() {
			destroyed = true;
			node.remove();
		},
	};
};

export default portal;
