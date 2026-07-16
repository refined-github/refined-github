import type {Action} from 'svelte/action';

const portal: Action<HTMLElement, () => Element> = (node, getTarget) => {
	function move(): void {
		if (!node.isConnected) {
			throw new Error('Element must be attached to the document before the tooltip');
		}

		getTarget().append(node);
	}

	node.isConnected ? move() : queueMicrotask(move);

	return {
		destroy() {
			node.remove();
		},
	};
};

export default portal;
