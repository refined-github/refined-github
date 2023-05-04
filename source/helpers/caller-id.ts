import hashString from './hash-string.js';

/**
Get unique ID by using the line:column of the call (or its parents) as seed. Every call from the same place will return the same ID, as long as the index is set to the parents that matters to you.

@param ancestor Which call in the stack should be used as key. 0 means the exact line where getCallerID is called. Defaults to 1 because it's usually used inside a helper.
*/
export default function getCallerID(ancestor = 1): string {
	/* +1 because the first line comes from this function */
	return hashString(getStackLine(new Error('Get stack').stack!, ancestor + 1));
}

export function getStackLine(stack: string, line: number): string {
	return stack
		// Remove non-stacktrace line from array (missing in Firefox) #6032
		.replace('Error: Get stack\n', '')!
		.split('\n')
		.at(line) ?? warn(stack, line);
}

function warn(stack: string, line: number): string {
	console.warn('The stack doesn’t have the line', {line, stack});
	return Math.random().toString(16);
}
