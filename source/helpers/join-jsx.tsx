import React from 'dom-chef';

export default function joinJsx(
	separator: React.ReactNode,
	items: readonly JSX.Element[],
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
