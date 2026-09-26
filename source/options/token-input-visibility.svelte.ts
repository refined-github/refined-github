// Each `<TokenInput>` claims the next index on creation, in DOM order
let nextSlot = 0;

export const tokenInputVisibility = $state({revealed: 0});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- `compileModule` can't parse TS syntax yet, this file must stay plain JS
export function claimTokenInputSlot() {
	return nextSlot++;
}
