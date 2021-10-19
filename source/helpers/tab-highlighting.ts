export function highlightTab(tabElement: Element): void {
	tabElement.classList.add('selected');
	tabElement.setAttribute('aria-current', 'page');
}

export function unhighlightTab(tabElement: Element): void {
	tabElement.classList.remove('selected');
	tabElement.removeAttribute('aria-current');
}
