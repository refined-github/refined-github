import {h} from 'dom-chef'
import select from 'select-dom'
import minimatch from 'minimatch'

const settingsKey = 'prViewSettings'

let settings, diffFiles

const diffArray = (first, second) => {
	return first.filter(i => second.indexOf(i) < 0)
}

const loadSettings = () => {
	return new Promise(resolve => {
		browser.storage.local.get(settingsKey).then((loadedSettings) => {
			if (!loadedSettings[settingsKey] || !Object.keys(loadedSettings[settingsKey]).length) {
				loadedSettings[settingsKey] = { sortRules: [], collapseRules: [] }
			}

			settings = loadedSettings[settingsKey]
			resolve()
		})
	})
}

const saveRules = (ruleType, ruleValue) => {
	settings[ruleType] = ruleValue
	browser.storage.local.set({ [settingsKey]: settings })
}

const parseAndUpdateRules = (ruleType, event) => {
	const rules = event.target.value.split(/\r\n|\n|\r/g)

	switch(true) {
		case ruleType === 'sortRules':
			updateSortedDiffs(rules)
			break
		case ruleType === 'collapseRules':
			updateCollapsedDiffs(rules)
			break
	}

	saveRules(ruleType, rules)
}

const updateSortedDiffs = (rules) => {
	var sortedDiffs = []

	rules.forEach(function(rule) {
		return diffFiles.filter(function(diffFile) {
			if (minimatch(diffFile.dataset.path, rule)) {
				sortedDiffs.push(diffFile)
			}
		})
	})

	// This should be improved
	const diffsContainer = select('.js-diff-progressive-container')
	diffsContainer.innerHTML = ""

	sortedDiffs.concat(diffArray(diffFiles, sortedDiffs)).forEach((diff) => {
		diffsContainer.appendChild(diff)
	})
}

const updateCollapsedDiffs = (rules) => {
	diffFiles.forEach((diffFile) => {
		if (rules.some(rule => minimatch(diffFile.dataset.path, rule))) {
			diffFile.classList.add('open', 'Details--on')
		}
	})
}

const modalMarkup = (
	<div class="diffbar-item select-menu js-menu-container js-select-menu js-transitionable">
		<button type="button" class="btn-link muted-link select-menu-button js-menu-target" aria-expanded="false" aria-haspopup="true" data-hotkey="v">
			<strong>View options&nbsp;</strong>
		</button>
		<div class="select-menu-modal-holder">
			<div class="select-menu-modal js-menu-content rgh-pr-view-menu-modal" aria-expanded="false">
				<div class="select-menu-header">
					<svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12">
						<path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"></path>
					</svg>
					<span class="select-menu-title">Diff view options</span>
				</div>
				<div class="select-menu-list js-navigation-container js-active-navigation-container" role="menu">
					<div class="select-menu-divider rgh-pr-view-glob-info">
						<p>Use globbing syntax to match files, paths, and extensions. E.g.:</p>
						<code>
							home/index.html<br />
							images/*.&#123;png,gif,jpg&#125;<br />
							app/models/**/*
						</code>
					</div>
					<div class="select-menu-divider">Sort diffs in the following order</div>
					<div class="select-menu-filters">
						<div class="select-menu-text-filter">
							<textarea id="rgh-pr-view-sort-textarea" class="form-control rgh-pr-view-texarea" placeholder="Sort files, one rule per line" aria-label="Sort files, one rule per line"></textarea>
						</div>
					</div>
					<div class="select-menu-divider">Automatically collapse the following diffs</div>
					<div class="select-menu-filters">
						<div class="select-menu-text-filter">
							<textarea id="rgh-pr-view-collapse-textarea" class="form-control rgh-pr-view-texarea" placeholder="Collapse files, one rule per line" aria-label="Collapse files, one rule per line"></textarea>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
)

export default () => {
	select('.diffbar').prepend(modalMarkup)

	diffFiles = (() => {
		const files = select.all('.file.Details')

		files.forEach((file) => {
			file.dataset.path = file.querySelector('.file-header').dataset.path
		})

		return files
	})()

	const sortTextarea = select('#rgh-pr-view-sort-textarea')
	const collapseTextarea = select('#rgh-pr-view-collapse-textarea')

	sortTextarea.addEventListener('blur', parseAndUpdateRules.bind(this, 'sortRules'))
	collapseTextarea.addEventListener('blur', parseAndUpdateRules.bind(this, 'collapseRules'))

	loadSettings().then(() => {
		sortTextarea.value = settings.sortRules.join("\r\n")
		updateSortedDiffs(settings.sortRules)

		collapseTextarea.value = settings.collapseRules.join("\r\n")
		updateCollapsedDiffs(settings.collapseRules)
	})
}
