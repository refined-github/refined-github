/** Tests a target string against a list of strings (full match) or regexes (can be mixed) */
export default function matchesAnyPattern(
	target: string,
	patterns: Array<string | RegExp | ((x: string) => boolean)>,
): boolean {
	return patterns.some(pattern => {
		if (typeof pattern === 'string') {
			return pattern === target;
		}

		if (typeof pattern === 'function') {
			return pattern(target);
		}

		return pattern.test(target);
	});
}
