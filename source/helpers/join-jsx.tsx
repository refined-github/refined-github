import React from 'dom-chef';

export default function joinJsx(
	items: readonly JSX.Element[],
	separator: React.ReactNode,
): JSX.Element {
	return (
		<>
			{items.map((item, index) => (
				<>
					{index > 0 && separator}
					{item}
				</>
			))}
		</>
	);
}
