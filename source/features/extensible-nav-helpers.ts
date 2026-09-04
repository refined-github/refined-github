const replacedClass = 'rgh-extensible-nav-removed';

export function shouldReplaceNativeNav(nativeNav: HTMLElement): boolean {
	return !nativeNav.classList.contains(replacedClass);
}

export function markNativeNavAsReplaced(nativeNav: HTMLElement): void {
	nativeNav.classList.add(replacedClass);
}
