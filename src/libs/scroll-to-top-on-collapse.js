export default () => {
	console.log('hihi')
	const btns = document.querySelectorAll('.file-actions > .js-details-target')
	const prToolbar = document.querySelector('.pr-toolbar')
	const toolbarHeight = prToolbar.getBoundingClientRect().height

	btns.forEach((b) => {
		// get the diff container for this button
		const parent = b.parentElement.parentElement.parentElement

		b.addEventListener('click', () => {
			// https://stackoverflow.com/a/11396681/3736051
			const bodyOffset = document.body.getBoundingClientRect().top
			const parentOffset = parent.getBoundingClientRect().top
			const parentY = parentOffset - bodyOffset - toolbarHeight

			if (window.scrollY > parentY) {
				window.scrollTo(0, parentY) // add a little buffer so it looks nicer
			}
		})
	})
}
