import {render as renderPreact, ComponentChild} from 'preact';

export default function render(vnode: ComponentChild): DocumentFragment {
	const tempRoot = new DocumentFragment();
	renderPreact(vnode, tempRoot);
	return tempRoot;
}
