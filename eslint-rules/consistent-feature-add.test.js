import {run} from 'eslint-vitest-rule-tester';

import rule from './consistent-feature-add.js';

run({
	name: 'consistent-feature-add',
	rule,
	valid: [
		`features.add(import.meta.url, {
	include: [
		isRepo,
	],
	init,
});`,
		`features.add(import.meta.url, {
	shortcuts: {a: 'b'},
	asLongAs: [
		a,
	],
	include: [
		b,
		c,
	],
	exclude: [
		d,
	],
	awaitDomReady: true,
	init,
});`,
		'features.add(import.meta.url, {init});',
		'other.add(import.meta.url, {init, include: [a]});',
	],
	invalid: [
		{
			code: `features.add(import.meta.url, {
	include: [a],
	init,
});`,
			output: `features.add(import.meta.url, {
	include: [
		a,
	],
	init,
});`,
			errors: 1,
		},
		{
			code: `features.add(import.meta.url, {
	include: [a, b],
	init,
});`,
			output: `features.add(import.meta.url, {
	include: [
		a,
		b,
	],
	init,
});`,
			errors: 1,
		},
		{
			code: `features.add(import.meta.url, {
	init,
	include: [
		a,
	],
});`,
			output: `features.add(import.meta.url, {
	include: [
		a,
	],
	init,
});`,
			errors: 1,
		},
		{
			code: `features.add(import.meta.url, {
	// Comment
	exclude: [
		b,
	],
	include: [
		a,
	],
	init,
});`,
			output: `features.add(import.meta.url, {
	include: [
		a,
	],
	// Comment
	exclude: [
		b,
	],
	init,
});`,
			errors: 1,
		},
		{
			code: `features.add(import.meta.url, {
	awaitDomReady: true, // Trailing
	init,
	include: [
		a,
	],
});`,
			output: `features.add(import.meta.url, {
	include: [
		a,
	],
	awaitDomReady: true, // Trailing
	init,
});`,
			errors: 1,
		},
	],
});
