export default function isUselessComment(text: string): boolean {
	// Note: the unicode range targets skin color modifiers for the hand emojis
	return text.replace(/[\s,.!?👍👎👌🙏]+|[\u{1F3FB}-\u{1F3FF}]|[+-]\d+|⬆️|ditt?o|me too|same here|same|please update|thanks?( you)?|followin?g/gui, '') === '';
}
