export default function isLowQualityComment(text: string): boolean {
	// Note: the unicode range targets skin color modifiers for the hand emojis
	return text.replace(/[\s,.!?👍👎👌🙏]+|[\u{1F3FB}-\u{1F3FF}]|[+-]\d+|⬆️|ditt?o|me|too|here|there|on|same|this|issue?s?|please|pl[sz]|any|updates?|question|solution|th[ae]nks?|thnx|you|followin?g/gui, '') === '';
}
