const lowQualityWords = [
	'ditto',
	'dito',
	'me',
	'too',
	'there',
	'here',
	'on',
	'same',
	'this',
	'issue',
	'issues',
	'please',
	'pls',
	'plz',
	'any',
	'update',
	'updates',
	'bump',
	'question',
	'solution',
	'following',
];
const lowQualityWordsRegex = new RegExp(`\\b(${lowQualityWords.join('|')})\\b`, 'gi');

export default function isLowQualityComment(text: string): boolean {
	// Note: the unicode range targets skin color modifiers for the hand emojis
	return text
		.replaceAll(lowQualityWordsRegex, '')
		.replaceAll(/[\s,.!?👍👎👌🙏]+|[\u{1F3FB}-\u{1F3FF}]|[+-]\d+|⬆️/gu, '') === '';
}
