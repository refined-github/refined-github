import {URL} from 'url';
import test from 'ava';
import {shortenUrl} from '../src/libs/shorten-links';
import Window from './fixtures/window';

global.URL = URL;
global.window = new Window('https://github.com/sindresorhus/refined-github/pull/473');
global.location = window.location;

function urlMatcherMacro(t, shouldMatch = []) {
	for (const [originalUrl, expectedShortenedUrl] of shouldMatch) {
		t.is(shortenUrl(originalUrl), expectedShortenedUrl);
	}
}

test('shortenUrl', urlMatcherMacro, new Map([
	[
		'https://github.com/sindresorhus/refined-github/',
		'sindresorhus/refined-github'
	],
	[
		'https://github.com/sindresorhus/refined-github/tree/v0.12',
		'<code>v0.12</code>'
	],
	[
		'https://github.com/sindresorhus/refined-github/tree/d71718db6aa4feb8dc10edbad1134472468e971a',
		'<code>d71718d</code>'
	],
	[
		'https://github.com/nodejs/node/',
		'nodejs/node'
	],
	[
		'https://github.com/nodejs/node/tree/v0.12',
		'nodejs/node@<code>v0.12</code>'
	],
	[
		'https://github.com/nodejs/node/tree/d71718db6aa4feb8dc10edbad1134472468e971a',
		'nodejs/node@<code>d71718d</code>'
	],
	[
		'https://github.com/sindresorhus/refined-github/tree/master/doc',
		'/doc@<code>master</code>'
	],
	[
		'https://github.com/sindresorhus/refined-github/tree/v0.12/doc',
		'/doc@<code>v0.12</code>'
	],
	[
		'https://github.com/sindresorhus/refined-github/tree/d71718db6aa4feb8dc10edbad1134472468e971a/doc',
		'/doc@<code>d71718d</code>'
	],
	[
		'https://github.com/nodejs/node/tree/master/doc',
		'nodejs/node/doc@<code>master</code>'
	],
	[
		'https://github.com/nodejs/node/tree/v0.12/doc',
		'nodejs/node/doc@<code>v0.12</code>'
	],
	[
		'https://github.com/nodejs/node/tree/d71718db6aa4feb8dc10edbad1134472468e971a/doc',
		'nodejs/node/doc@<code>d71718d</code>'
	],
	[
		'https://github.com/sindresorhus/refined-github/blob/master/.gitignore',
		'/.gitignore@<code>master</code>'
	],
	[
		'https://github.com/sindresorhus/refined-github/blob/v0.12/.gitignore',
		'/.gitignore@<code>v0.12</code>'
	],
	[
		'https://github.com/sindresorhus/refined-github/blob/cc8fc46/.gitignore',
		'/.gitignore@<code>cc8fc46</code>'
	],
	[
		'https://github.com/nodejs/node/blob/master/.gitignore',
		'nodejs/node/.gitignore@<code>master</code>'
	],
	[
		'https://github.com/nodejs/node/blob/v0.12/.gitignore',
		'nodejs/node/.gitignore@<code>v0.12</code>'
	],
	[
		'https://github.com/nodejs/node/blob/cc8fc46/.gitignore',
		'nodejs/node/.gitignore@<code>cc8fc46</code>'
	],
	[
		'https://github.com/sindresorhus/refined-github/blame/master/.gitignore',
		'/.gitignore@<code>master</code> (blame)'
	],
	[
		'https://github.com/sindresorhus/refined-github/blame/v0.12/.gitignore',
		'/.gitignore@<code>v0.12</code> (blame)'
	],
	[
		'https://github.com/sindresorhus/refined-github/blame/cc8fc46/.gitignore',
		'/.gitignore@<code>cc8fc46</code> (blame)'
	],
	[
		'https://github.com/nodejs/node/blame/master/.gitignore',
		'nodejs/node/.gitignore@<code>master</code> (blame)'
	],
	[
		'https://github.com/nodejs/node/blame/v0.12/.gitignore',
		'nodejs/node/.gitignore@<code>v0.12</code> (blame)'
	],
	[
		'https://github.com/nodejs/node/blame/cc8fc46/.gitignore',
		'nodejs/node/.gitignore@<code>cc8fc46</code> (blame)'
	],
	[
		'https://github.com/sindresorhus/refined-github/commits/master/.gitignore',
		'/.gitignore@<code>master</code> (commits)'
	],
	[
		'https://github.com/sindresorhus/refined-github/commits/v0.12/.gitignore',
		'/.gitignore@<code>v0.12</code> (commits)'
	],
	[
		'https://github.com/sindresorhus/refined-github/commits/cc8fc46/.gitignore',
		'/.gitignore@<code>cc8fc46</code> (commits)'
	],
	[
		'https://github.com/nodejs/node/commits/master/.gitignore',
		'nodejs/node/.gitignore@<code>master</code> (commits)'
	],
	[
		'https://github.com/nodejs/node/commits/v0.12/.gitignore',
		'nodejs/node/.gitignore@<code>v0.12</code> (commits)'
	],
	[
		'https://github.com/nodejs/node/commits/cc8fc46/.gitignore',
		'nodejs/node/.gitignore@<code>cc8fc46</code> (commits)'
	],
	[
		'https://github.com/sindresorhus/refined-github/commit/cc8fc46.diff',
		'<code>cc8fc46</code>.diff'
	],
	[
		'https://github.com/sindresorhus/refined-github/commit/cc8fc46.patch',
		'<code>cc8fc46</code>.patch'
	],
	[
		'https://github.com/nodejs/node/commit/cc8fc46.diff',
		'nodejs/node@<code>cc8fc46</code>.diff'
	],
	[
		'https://github.com/nodejs/node/commit/cc8fc46.patch',
		'nodejs/node@<code>cc8fc46</code>.patch'
	],
	[
		'https://github.com/sindresorhus/refined-github/releases/tag/v0.12.0',
		'<code>v0.12.0</code> (release)'
	],
	[
		'https://github.com/nodejs/node/releases/tag/v0.12.0',
		'nodejs/node@<code>v0.12.0</code> (release)'
	],
	[
		'https://github.com/sindresorhus/refined-github/milestone/25',
		'sindresorhus/refined-github/milestone/25'
	],
	[
		'https://github.com/nodejs/node/milestone/25',
		'nodejs/node/milestone/25'
	],
	[
		'https://github.com/sindresorhus/refined-github/labels/npm',
		'npm (label)'
	],
	[
		'https://github.com/nodejs/node/labels/npm',
		'nodejs/node/npm (label)'
	],
	[
		'https://github.com/sindresorhus/refined-github/archive/6.4.1.zip',
		'<code>6.4.1</code>.zip'
	],
	[
		'https://github.com/sindresorhus/refined-github/releases/download/6.4.1/now-macos',
		'<code>6.4.1</code> now-macos (download)'
	],
	[
		'https://github.com/zeit/now-cli/archive/6.4.1.zip',
		'zeit/now-cli@<code>6.4.1</code>.zip'
	],
	[
		'https://github.com/zeit/now-cli/releases/download/6.4.1/now-macos',
		'zeit/now-cli@<code>6.4.1</code> now-macos (download)'
	],
	[
		'https://github.com/sindresorhus/refined-github/wiki',
		'sindresorhus/refined-github/wiki'
	],
	[
		'https://github.com/sindresorhus/refined-github/pulse',
		'sindresorhus/refined-github/pulse'
	],
	[
		'https://github.com/sindresorhus/refined-github/labels',
		'sindresorhus/refined-github/labels'
	],
	[
		'https://github.com/sindresorhus/refined-github/network',
		'sindresorhus/refined-github/network'
	],
	[
		'https://github.com/sindresorhus/refined-github/projects',
		'sindresorhus/refined-github/projects'
	],
	[
		'https://github.com/sindresorhus/refined-github/releases',
		'sindresorhus/refined-github/releases'
	],
	[
		'https://github.com/sindresorhus/refined-github/milestones',
		'sindresorhus/refined-github/milestones'
	],
	[
		'https://github.com/sindresorhus/refined-github/contributors',
		'sindresorhus/refined-github/contributors'
	],
	[
		'https://github.com/nodejs/node/wiki',
		'nodejs/node/wiki'
	],
	[
		'https://github.com/nodejs/node/pulse',
		'nodejs/node/pulse'
	],
	[
		'https://github.com/nodejs/node/labels',
		'nodejs/node/labels'
	],
	[
		'https://github.com/nodejs/node/network',
		'nodejs/node/network'
	],
	[
		'https://github.com/nodejs/node/projects',
		'nodejs/node/projects'
	],
	[
		'https://github.com/nodejs/node/releases',
		'nodejs/node/releases'
	],
	[
		'https://github.com/nodejs/node/milestones',
		'nodejs/node/milestones'
	],
	[
		'https://github.com/nodejs/node/contributors',
		'nodejs/node/contributors'
	],
	[
		'https://github.com/nodejs/node/graphs/commit-activity',
		'nodejs/node/graphs/commit-activity'
	],
	[
		'https://rawgit.com/sindresorhus/refined-github/master/.gitignore',
		'/.gitignore@<code>master</code> (raw)'
	],
	[
		'https://cdn.rawgit.com/sindresorhus/refined-github/v0.12/.gitignore',
		'/.gitignore@<code>v0.12</code> (raw)'
	],
	[
		'https://cdn.rawgit.com/sindresorhus/refined-github/d71718db/.gitignore',
		'/.gitignore@<code>d71718db</code> (raw)'
	],
	[
		'https://raw.githubusercontent.com/sindresorhus/refined-github/master/.gitignore',
		'/.gitignore@<code>master</code> (raw)'
	],
	[
		'https://raw.githubusercontent.com/sindresorhus/refined-github/v0.12/.gitignore',
		'/.gitignore@<code>v0.12</code> (raw)'
	],
	[
		'https://raw.githubusercontent.com/sindresorhus/refined-github/d71718db/.gitignore',
		'/.gitignore@<code>d71718db</code> (raw)'
	],
	[
		'https://rawgit.com/nodejs/node/master/.gitignore',
		'nodejs/node/.gitignore@<code>master</code> (raw)'
	],
	[
		'https://cdn.rawgit.com/nodejs/node/v0.12/.gitignore',
		'nodejs/node/.gitignore@<code>v0.12</code> (raw)'
	],
	[
		'https://cdn.rawgit.com/nodejs/node/d71718db/.gitignore',
		'nodejs/node/.gitignore@<code>d71718db</code> (raw)'
	],
	[
		'https://raw.githubusercontent.com/nodejs/node/master/.gitignore',
		'nodejs/node/.gitignore@<code>master</code> (raw)'
	],
	[
		'https://raw.githubusercontent.com/nodejs/node/v0.12/.gitignore',
		'nodejs/node/.gitignore@<code>v0.12</code> (raw)'
	],
	[
		'https://raw.githubusercontent.com/nodejs/node/d71718db/.gitignore',
		'nodejs/node/.gitignore@<code>d71718db</code> (raw)'
	],
	[
		'https://github.com/sindresorhus',
		'@sindresorhus'
	],
	[
		'https://github.com/nodejs',
		'@nodejs'
	],
	[
		'https://github.com/pulls',
		'github.com/pulls'
	],
	[
		'https://github.com/issues',
		'github.com/issues'
	],
	[
		'https://github.com/trending',
		'github.com/trending'
	],
	[
		'https://github.com/features',
		'github.com/features'
	],
	[
		'https://github.com/marketplace',
		'github.com/marketplace'
	],
	[
		'https://github.com/trending/developers',
		'github.com/trending/developers'
	],
	[
		'https://github.com/settings/profile',
		'github.com/settings/profile'
	],
	[
		'https://www.npmjs.com/',
		'npmjs.com'
	],
	[
		'https://www.npmjs.com/package/node',
		'npmjs.com/package/node'
	],
	[
		'https://example.com/nodejs/node/blob/cc8fc46/.gitignore',
		'example.com/nodejs/node/blob/cc8fc46/.gitignore'
	]
]));
