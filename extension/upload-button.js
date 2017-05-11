/* globals pageDetect, icons */

const isMac = /Mac OS X/.test(window.navigator.oscpu);

window.addUploadBtn = () => {
	if (pageDetect.hasCommentForm()) {
		$('.js-previewable-comment-form').each((index, element) => {
			const $element = $(element);
			if (!$element.hasClass('refined-github-has-upload-btn')) {
				const uploadBtn = `<label for="refined-github-upload-btn-${index}" class="toolbar-item tooltipped tooltipped-nw refined-github-upload-btn" aria-label="Upload a file">
						${icons.cloudUpload}
					</label>`;

				const $uploadBtn = $element
					.find('.comment-form-head .toolbar-commenting .toolbar-group:last-child')
					.append(uploadBtn)
					.find('.refined-github-upload-btn');

				const keydownHandler = event => {
					if (event.which === 85 && (isMac ? event.metaKey : event.ctrlKey)) {
						event.preventDefault();
						$uploadBtn.click();
					}
				};
				$element
					.find('.js-comment-field')
					.focus(() => $(document).on('keydown', keydownHandler))
					.blur(() => $(document).off('keydown', keydownHandler));

				$element.find('.js-write-bucket .drag-and-drop .default .js-manual-file-chooser').attr('id', `refined-github-upload-btn-${index}`);
				$element.addClass('refined-github-has-upload-btn');
			}
		});
	}
};
