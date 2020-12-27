export default function isUselessComment(text: string): boolean {
	// Find useless comments (note: the unicode range targets skin color modifiers for the hand emojis)
	return text.replace(/[\s,.!?👍👎👌🙏]+|[\u{1F3FB}-\u{1F3FF}]|[+-]\d+|⬆️|ditto|me too|same here|please update|thanks?( you)?/gui, '') === '';
}
