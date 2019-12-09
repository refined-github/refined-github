import path from 'path';
import webpack from 'webpack';

export default function (this: webpack.loader.LoaderContext, source: string): string {
	const iconName = path.basename(this.resourcePath, path.extname(this.resourcePath));
	const svgWithClass = source.replace(
		'<svg',
		`<svg class="octicon octicon-${iconName}"`
	);
	return `
	import React from 'dom-chef';
	export default () => ${svgWithClass}`;
}
