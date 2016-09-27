'use strict';

window.addCollapseExpandAllButton = () => {

	// Buttons already added
	if ($('.collapse-expand-btn').length) {
		return;
	}


	const collapseExpandButton = $(`<a class="btn btn-sm BtnGroup-item tooltipped tooltipped-s collapse-expand-btn" aria-label="Collapse All Files"></a>`).html('Collapse All');
	collapseExpandButton.data('state', 'collapseAll');

	$('.pr-review-tools').prepend($(`<div class="diffbar-item"></div>`).append(collapseExpandButton));


	$(document).on('click', '.collapse-expand-btn', e => {
		e.preventDefault();

		var state = collapseExpandButton.data('state');

		//add/remove class to match state
		$(`div[id^='diff-']`).each((index, file) => {
			if (state === 'collapseAll') {
			// 	//collapse all
				if ($(file).hasClass('refined-github-minimized')) {
					return;
				} else {
					$(file).toggleClass('refined-github-minimized');
				}
			} else {
			// 	//expand all
				if (!($(file).hasClass('refined-github-minimized'))) {
					return;
				} else {
					$(file).toggleClass('refined-github-minimized');
				}
			}
		});

		//update labels
		if(state === 'collapseAll'){
			collapseExpandButton.attr("aria-label", "Expand All Files");
			collapseExpandButton.html('Expand All');
			collapseExpandButton.data("state", "expandAll");

		} else {
			collapseExpandButton.attr("aria-label", "Collapse All Files");
			collapseExpandButton.html('Collapse All');
			collapseExpandButton.data("state", "collapseAll");

		}
	});

};
