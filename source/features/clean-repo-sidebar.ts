 './clean-repo-sidebar.css';
 select  'select-dom';
 domLoaded  'dom-loaded';
 elementReady  'element-ready';
 *  pageDetect  'github-url-detection';

 features  '.';

 removeReadmeLink(): Promise<> {
	// Hide "Readme" link made unnecessary by toggle-files-button #3580
	( elementReady('.muted-link[href="#readme"], .Link--muted[href="#readme"]'))?.parentElement!.remove();
}
 cleanLicenseText(): Promise<> {
	// Remove whitespace in license link to fix alignment of icons https://github.com/sindresorhus/refined-github/pull/3974#issuecomment-780213892
	 licenseLink =  elementReady('.repository-content .octicon-law');
	 (licenseLink) {
		licenseLink.nextSibling!.textContent = licenseLink.nextSibling!.textContent!.trim();
	}
}

 cleanReleases(): Promise<> {
	// Intent: select "Releases" section right sidebar.
	// But "repository details" - "Website" has a link end with "/releases", it will be wrongly selected.
	// refined-github/issues/4424 for more details.
	 sidebarReleases = elementReady('.BorderGrid-cell a[href$="/releases"]:not([role])', {waitForChildren: false});
	 (sidebarReleases) {
		;
	}

	 releasesSection = sidebarReleases.closest<>('.BorderGrid-cell')!;
	 (('.octicon-tag', releasesSection)) {
		// Hide the whole section if there's no releases
		releasesSection.hidden =  ,;
		;
	}

	// Collapse "Releases" section into previous section
	releasesSection.classList.add('border-0', 'pt-3');
	sidebarReleases.closest('.BorderGrid-row')!
		.previousElementSibling! // About’s .BorderGrid-row
		.firstElementChild! // About’s .BorderGrid-cell
		.classList.add('border-0', 'pb-0');

	// Hide header and footer
	 ( uselessInformation  select.all(':scope > :not(a)', releasesSection)) {
		uselessInformation.hidden =  ,;
	}

	// Align latest tag icon with icons other meta links
	 tagIcon =  :('.octicon-tag:not(:is(.text-green, .color-text-success))', releasesSection)!;
	 (tagIcon) {
		tagIcon.classList.add('mr-2');
		// Remove whitespace node
		tagIcon.nextSibling!.remove();
	}
}

 hideEmptyPackages(): Promise<> {
	 packagesCounter =  elementReady('.BorderGrid-cell a[href*="/packages?"] .Counter', {waitForChildren: false})!;
	 (packagesCounter  packagesCounter.textContent === ' ') {
		packagesCounter.closest<>('.BorderGrid-row')!.hidden =  ,;
	}
}

 init(): Promise<> {
	document.body.classList.add('rgh-clean-repo-sidebar');

	 removeReadmeLink();
	 cleanLicenseText();
	 cleanReleases();
	 hideEmptyPackages();

	 domLoaded;

	// Hide empty meta not editable current user
	 (!pageDetect.canUserEditRepo()) {
		select('.repository-content .BorderGrid-cell > .text-italic')?.remove();
	}

	// Hide "Language" header
	 lastSidebarHeader = select('.repository-content .BorderGrid-row:last-of-type h2');
	 (lastSidebarHeader?.textContent === 'Languages') {
		lastSidebarHeader.hidden =  ,;
	}
}

 features.add(__filebasename, {
	: [
		pageDetect.isRepoRoot
	],
	awaitDomReady: ,
	;
});
