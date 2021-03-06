import {render as renderPreact, ComponentChild} from 'preact';

function _render(
	vnode: ComponentChild,
	parent: Element,
	action: 'before' | 'after' | 'prepend' | 'append' | 'replaceWith' = 'append'
) {
	const tempRoot = new DocumentFragment();
	const rendered = renderPreact(vnode, tempRoot);
	parent[action](tempRoot);
	return rendered;
}

const render = {
	before: (vnode: ComponentChild, parent: Element) => _render(vnode, parent, 'before'),
	after: (vnode: ComponentChild, parent: Element) => _render(vnode, parent, 'after'),
	prepend: (vnode: ComponentChild, parent: Element) => _render(vnode, parent, 'prepend'),
	append: (vnode: ComponentChild, parent: Element) => _render(vnode, parent, 'append'),
	replaceWith: renderPreact,
}

export default render
