import regexJoin from 'regex-join';

// Note: the unicode range targets skin color modifiers for the hand emojis
const fillerRegex = /[\s,.!?👍👎👌🙏]+|[\u{1F3FB}-\u{1F3FF}]/gui;
const thanksRegex = /and|thanks?|thx|for|your?|job|work/gi;
const unhelpfulRegex = /[+-]\d+|\+|⬆️|ditt?o|me|too|t?here|on|same|this|issues?|please|pl[sz]|any|news|updates?|bump|question|solution|following/gui;

const thanksWithFillerRegex = regexJoin(fillerRegex, /|/, thanksRegex);
const lowQualityRegex = regexJoin(fillerRegex, /|/, thanksRegex, /|/, unhelpfulRegex);

export default function isLowQualityComment(text: string): boolean {
	if (thanksRegex.test(text) && text.replace(thanksWithFillerRegex, '') === '') {
		return false;
	}

	return text.replace(lowQualityRegex, '') === '';
}
