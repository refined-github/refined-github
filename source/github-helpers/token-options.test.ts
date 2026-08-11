import {describe, expect, it} from 'vitest';

import {getTokenForUser, getTokenOptionName, getTokenOptions, removeUnusedOptions} from './token-options.js';

describe('getTokenOptionName', () => {
	it('normalizes usernames for case-insensitive lookup', () => {
		expect(getTokenOptionName('Some-User')).toBe('personalToken-some-user');
	});
});

describe('getTokenOptions', () => {
	it('returns only non-empty account tokens', () => {
		expect(getTokenOptions({
			personalToken: 'legacy',
			'personalToken-first': 'first-token',
			'personalToken-empty': '',
			logging: true,
		})).toEqual([
			['personalToken-first', 'first-token'],
		]);
	});
});

describe('getTokenForUser', () => {
	const options = {
		personalToken: 'legacy',
		'personalToken-first': 'first-token',
		'personalToken-second': 'second-token',
	};

	it('selects the token belonging to the logged-in user', () => {
		expect(getTokenForUser(options, 'second')).toBe('second-token');
	});

	it('matches usernames case-insensitively', () => {
		expect(getTokenForUser(
			{'personalToken-Some-User': 'token'},
			'SOME-USER',
		)).toBe('token');
	});

	it('uses the legacy token when no account token matches', () => {
		expect(getTokenForUser(options, 'third')).toBe('legacy');
	});

	it('does not use another account token on GitHub pages', () => {
		expect(getTokenForUser(
			{'personalToken-first': 'first-token'},
			'second',
		)).toBeUndefined();
	});

	it('uses an account token when no username is available', () => {
		expect(getTokenForUser(
			{'personalToken-first': 'first-token'},
		)).toBe('first-token');
	});
});

describe('removeUnusedOptions', () => {
	it('preserves account tokens while removing unknown options', () => {
		const options = {
			logging: true,
			removedFeature: true,
			'personalToken-user': 'token',
		};

		removeUnusedOptions(options, {logging: false});

		expect(options).toEqual({
			logging: true,
			'personalToken-user': 'token',
		});
	});
});
