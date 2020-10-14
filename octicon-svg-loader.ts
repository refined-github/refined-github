import path from 'path';
import webpack from 'webpack';

// @ts-expect-error due to https://github.com/webpack/webpack/issues/11630
export default function svgLoader(this: webpack.loader.LoaderContext, source: string): string {
	const iconName = path.basename(this.resourcePath, path.extname(this.resourcePath));
	const svgWithClass = source.replace(
		'<svg',
		`<svg class="octicon octicon-${iconName}"`
	);
	return `
	import doma from 'doma';
	export default () => doma.one(\`${svgWithClass.replace('\'', '\\\'')}\`)`;
}
