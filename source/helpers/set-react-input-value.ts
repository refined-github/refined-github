// https://stackoverflow.com/a/46012210

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

export default function setReactInputValue(target: HTMLInputElement, value: string): void {
	nativeInputValueSetter.call(target, value);
	target.dispatchEvent(new Event('input', {bubbles: true}));
}
