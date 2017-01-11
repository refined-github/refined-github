window.resizeSourcePane = (() => {
	function _resizePane() {
		const blobWrapper = $('.file > .blob-wrapper');
		if (blobWrapper[0].clientWidth >= blobWrapper[0].scrollWidth) { // do not resize if no horizontal scroll
			blobWrapper.css({
				'overflow-y': '',
				'max-height': ''
			});
			return;
		}

		const fileHeaderBottom = $('.file > .file-header')[0].getBoundingClientRect().bottom;
		let availHeight = window.innerHeight - fileHeaderBottom - 20;
		if (availHeight <= 100) {
			availHeight = 100;
		}
		blobWrapper.css({
			'overflow-y': 'auto',
			'max-height': availHeight + 'px'
		});
	}

	const setup = () => {
		_resizePane();
		$(window).on('resize.filepane', _resizePane);
	};

	const destroy = () => {
		$(window).off('resize.filepane');
	};

	return {
		setup,
		destroy
	};
})();
