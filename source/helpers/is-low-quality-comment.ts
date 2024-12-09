const lowQualityWords = [
	'any',
	'bump',
	'dito',
	'ditto',
	'following',
	'here',
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
	'there',
	'this',
	'too',
	'update',
	'updates',
];
const lowQualityWordsRegex = new RegExp(`\\b(${lowQualityWords.join('|')})\\b`, 'gi');

export default function isLowQualityComment(text: string): boolean {
	// Note: the unicode range targets skin color modifiers for the hand emojis
	return text
		.replaceAll(lowQualityWordsRegex, '')
		.replaceAll(/[\s,.!?👍👎👌🙏]+|[\u{1F3FB}-\u{1F3FF}]|[+-]\d+|⬆️/gu, '') === '';
}
