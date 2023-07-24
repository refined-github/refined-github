const supportedLabels = /^(bug|bug-?fix|confirmed-bug|type[:/]bug|kind[:/]bug|(:[\w-]+:|\p{Emoji})bug)$/iu;
export default function isBugLabel(label: string): boolean {
	return supportedLabels.test(label.replaceAll(/\s/g, ''));
}
