export default function isLowQualityComment(text: string): boolean {
	// Note: the unicode range targets skin color modifiers for the hand emojis
	return text.replaceAll(/[\s,.!?👍👎👌🙏]+|[\u{1F3FB}-\u{1F3FF}]|[+-]\d+|⬆️|ditt?o|me|too|t?here|on|same|this|issues?|please|pl[sz]|any|updates?|bump|question|solution|following/gui, '') === '';
}
