type Tobject = Record<string, unknown>;

class ReactProps {
	[key: string]: unknown;

	constructor(props: Tobject) {
		Object.assign(this, props);
	}

	findPropByName(expression: string | RegExp): unknown {
		// eslint-disable-next-line unicorn/prevent-abbreviations
		return Object.entries(this).find(([propName]) => {
			if (typeof expression === 'string') {
				return propName === expression;
			}

			return expression.test(propName);
		})?.[1];
	}

	findPropByValue(expression: string | RegExp): unknown {
		// eslint-disable-next-line unicorn/prevent-abbreviations
		return Object.values(this).find(propValue => {
			if (propValue === null || propValue === undefined) {
				return false;
			}

			let stringifiedValue;
			if (typeof propValue === 'object') {
				try {
					stringifiedValue = JSON.stringify(propValue);
				} catch {
					return false;
				}
			} else {
				// We've checked if it's an object
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				stringifiedValue = propValue.toString();
			}

			if (typeof expression === 'string') {
				return stringifiedValue === expression;
			}

			return expression.test(stringifiedValue);
		});
	}

	// eslint-disable-next-line unicorn/prevent-abbreviations
	findProp(callback: (propName: string, propValue: unknown) => boolean): unknown {
		// eslint-disable-next-line unicorn/prevent-abbreviations
		return Object.entries(this).find(([propName, propValue]) => callback(propName, propValue))?.[1];
	}
}

export default function getReactProps(targetElement: HTMLElement): ReactProps | undefined {
	const parent = targetElement.parentElement;
	if (!parent) {
		return;
	}

	const parentProps = getReactPropsEntryValue(parent);
	if (!parentProps) {
		return;
	}

	const parentChildren = parentProps.children as React.ReactNode | React.ReactNode[];
	if (!parentChildren) {
		return;
	}

	if (!Array.isArray(parentChildren)) {
		if (isReactElement(parentChildren)) {
			return new ReactProps(parentChildren.props);
		}

		return;
	}

	let targetElementIndex = 0;
	for (const childElement of parent.children) {
		if (childElement === targetElement) {
			break;
		}

		targetElementIndex += 1;
	}

	const targetReactNode = parentChildren.filter(Boolean)[targetElementIndex];
	if (isReactElement(targetReactNode)) {
		return new ReactProps(targetReactNode.props);
	}

	// "Not all code paths return a value.ts(7030)" error if removed
	// eslint-disable-next-line no-useless-return
	return;
}

function getReactPropsEntryValue(element: HTMLElement): Tobject | undefined {
	return Object.entries(element).find(([key]) => key.includes('reactProps'))?.[1];
}

function isReactElement(node: React.ReactNode): node is React.ReactElement {
	return (
		!(
			!node
			|| typeof node !== 'object'
			|| !('props' in node)
		)
	);
}
