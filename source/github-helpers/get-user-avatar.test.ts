import {assert, test} from 'vitest';

import getUserAvatar from './get-user-avatar.js';

test('getUserAvatar – regular user/org uses .png URL', () => {
	assert.equal(getUserAvatar('fregante', 16), '/fregante.png?size=32');
	assert.equal(getUserAvatar('microsoft', 16), '/microsoft.png?size=32');
	assert.equal(getUserAvatar('github', 16), '/github.png?size=32');
});

test('getUserAvatar – bot uses old avatars.githubusercontent.com URL', () => {
	assert.equal(getUserAvatar('dependabot[bot]', 16), 'https://avatars.githubusercontent.com/dependabot?size=32');
	assert.equal(getUserAvatar('github-actions[bot]', 16), 'https://avatars.githubusercontent.com/github-actions?size=32');
});

test('getUserAvatar – Copilot special case uses avatars.githubusercontent.com URL', () => {
	assert.equal(getUserAvatar('Copilot', 16), 'https://avatars.githubusercontent.com/in/1143301?size=32');
	assert.equal(getUserAvatar('copilot-swe-agent', 16), 'https://avatars.githubusercontent.com/in/1143301?size=32');
	assert.equal(getUserAvatar('copilot-coding-agent-docs', 16), 'https://avatars.githubusercontent.com/in/1143301?size=32');
});

test('getUserAvatar – invalid username throws', () => {
	assert.throws(() => getUserAvatar('user name', 16));
	assert.throws(() => getUserAvatar('user@name', 16));
});
