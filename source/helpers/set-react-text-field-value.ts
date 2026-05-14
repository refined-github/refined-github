const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
// https://stackoverflow.com/a/46012210
export function setReactInputValue(target: HTMLInputElement, value: string): void {
	nativeInputValueSetter.call(target, value);
	target.dispatchEvent(new Event('input', {bubbles: true}));
}

export function setReactTextareaValue(target: HTMLTextAreaElement, value: string): void {
	target.value = value;
	target.dispatchEvent(new Event('input', {bubbles: true}));
}
