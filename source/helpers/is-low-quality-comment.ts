const lowQualityWords = [
	'a',
	'an',
	'and',
	'any',
	'bump',
	'dito',
	'ditto',
	'following',
	'for',
	'here',
	'is',
	'issue',
	'issues',
	'me',
	'on',
	'please',
	'pls',
	'plz',
	'question',
	'same',
	'solution',
	'still',
	'there',
	'this',
	'too',
	'update',
	'updates',
];
const lowQualityWordsRegex = new RegExp(String.raw`\b(${lowQualityWords.join('|')})\b`, 'gi');

export default function isLowQualityComment(text: string): boolean {
	// Note: the unicode range targets skin color modifiers for the hand emojis
	return text
		.replaceAll(lowQualityWordsRegex, '')
		.replaceAll(/[\s,.!?👍👎👌🙏]+|[\u{1F3FB}-\u{1F3FF}]|[+-]\d+|⬆️/gu, '') === '';
}
