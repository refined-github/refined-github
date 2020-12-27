import React from "dom-chef";
import select from 'select-dom';
import elementReady from 'element-ready';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';


function sleep(s : number) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

interface FilterSettings
{
	HideUnresolved : boolean,
	HideResolved : boolean,
	hideNormalComment : boolean,
	HideLabels : boolean,
	HideCommits : boolean,
	AutoLoadHidden: boolean,
};

let CurrentSettings : FilterSettings = 
{
	HideResolved: true,
	HideUnresolved: false,
	hideNormalComment: false,
	HideLabels: false,
	HideCommits: false,
	AutoLoadHidden: false
};

const hideUnresolvedSelectorId = "hide-unresolved";
const hideResolvedSelectorId = "hide-resolved";
const hideNormalCommentsSelectorId = "hide-normal-comments";
const hideLabelsSelectorId = "hide-labels";
const hideCommitsSelectorId = "hide-commits";
const autoLoadHiddenSelectorId = "auto-load-hidden";

const timelineFiltersSelectorId = "timeline-filters";
const detailsSelector = `#${timelineFiltersSelectorId} details`
const notiticationsSelector = ".discussion-sidebar-item.sidebar-notifications"
const timelineItemSelector = ".js-timeline-item";

function stringifySettings(settings : FilterSettings)
{
	return (
		<p className="reason text-small text-gray">
			{settings.HideUnresolved ? "Hide": "Show"} unresolved comments. <br/>
			{settings.HideResolved ? "Hide": "Show"} resolved comments. <br/>
			{settings.hideNormalComment ? "Hide": "Show"} normal comments. <br/>
			{settings.HideLabels ? "Hide": "Show"} label informations. <br/>
			{settings.HideCommits ? "Hide": "Show"} commits. <br/>
			auto loading {settings.AutoLoadHidden ? "enabled": "disabled"}
		</p>
	)
}

function applyDisplay(el: HTMLElement, isHidden: boolean)
{
	if(isHidden)
	{
		el.style.display = "none";
	}
	else
	{
		el.style.display = "";
	}
}

function saveSettings()
{
	CurrentSettings.HideUnresolved = (select("#" + hideUnresolvedSelectorId) as HTMLInputElement)!.checked;
	CurrentSettings.HideResolved = (select("#" + hideResolvedSelectorId) as HTMLInputElement)!.checked;
	CurrentSettings.HideCommits = (select("#" + hideCommitsSelectorId) as HTMLInputElement)!.checked;
	CurrentSettings.hideNormalComment = (select("#" + hideNormalCommentsSelectorId) as HTMLInputElement)!.checked;
	CurrentSettings.HideLabels = (select("#" + hideLabelsSelectorId) as HTMLInputElement)!.checked;
	CurrentSettings.AutoLoadHidden = (select("#" + autoLoadHiddenSelectorId) as HTMLInputElement)!.checked;

	// close window
	select(detailsSelector)!.removeAttribute("open");

	// Display filter settings summary
	const timelineFilter = select(`#${timelineFiltersSelectorId}`)!;
	select("p.reason", timelineFilter)!.replaceWith(stringifySettings(CurrentSettings));

	// reapply settings to all timeline items
	reapplySettings();
}

function reapplySettings()
{
	select
		.all(timelineItemSelector)
		.forEach(el => processTimelineItem(el as HTMLElement));
}

function restoreSettings()
{
	(select("#" + hideUnresolvedSelectorId) as HTMLInputElement)!.checked = CurrentSettings.HideUnresolved;
	(select("#" + hideResolvedSelectorId) as HTMLInputElement)!.checked = CurrentSettings.HideResolved;
	(select("#" + hideCommitsSelectorId) as HTMLInputElement)!.checked = CurrentSettings.HideCommits;
	(select("#" + hideNormalCommentsSelectorId) as HTMLInputElement)!.checked = CurrentSettings.hideNormalComment;
	(select("#" + hideLabelsSelectorId) as HTMLInputElement)!.checked = CurrentSettings.HideLabels;
	(select("#" + autoLoadHiddenSelectorId) as HTMLInputElement)!.checked = CurrentSettings.AutoLoadHidden;
}

function createItem(form: JSX.Element, id : string, title: string, summary: string, isSelected: boolean, hasTopBorder: boolean)
{
	const el = (
		<label className={"d-block p-3 " + (hasTopBorder?"border-top":"")}>
            <div className="form-checkbox my-0">
              <input id={id} type="checkbox" name="id" value="unsubscribe" checked={isSelected}/> {title}
              <p className="note">
                {summary}
              </p>
            </div>
          </label>
	);

	form.append(el);
}

async function addTimelineItemsFilter(): Promise<void> {
	const notifications = await elementReady(notiticationsSelector);
	if (!notifications) {
		return;
	}

	// Copy existing element and adapt its content
	const timelineFilter = notifications.cloneNode(true);
	timelineFilter.id = 'timeline-filters';

	select("form.thread-subscribe-form", timelineFilter)!.remove();
	const summary = select("summary", timelineFilter)!;
	summary!.setAttribute("aria-label", "Customize timeline filters");
	select("div.text-bold", summary)!.textContent = "Filters";
	// TODO: Maybe something here?
	select("p.reason", timelineFilter)!.replaceWith(stringifySettings(CurrentSettings));

	createDetailsDialog(timelineFilter);
}

function createDetailsDialog(timelineFilter : Element)
{
	const detailsDialog = select("details-dialog", timelineFilter)!;
	const notifications = select(notiticationsSelector)!;

	detailsDialog.setAttribute("src", "");

	detailsDialog.setAttribute("aria-label", "Timeline filter settings");

	select("div.Box-header h3", detailsDialog)!.textContent = "Timeline filter settings";
	select("div.Box-header button", detailsDialog)!.addEventListener('click', restoreSettings);

	let form = <div></div>

	createItem(form, hideUnresolvedSelectorId, "Hide unresolved comments", "", CurrentSettings.HideUnresolved, false);
	createItem(form, hideResolvedSelectorId, "Hide resolved comments", "", CurrentSettings.HideResolved, true);
	createItem(form, hideLabelsSelectorId, "Hide label assignments", "", CurrentSettings.HideLabels, true);
	createItem(form, hideNormalCommentsSelectorId, "Hide normal comments", "Hides comments that does not contain unresolved/resolved state.", CurrentSettings.hideNormalComment, true);
	createItem(form, hideCommitsSelectorId, "Hide commits", "", CurrentSettings.HideCommits, true);
	createItem(form, autoLoadHiddenSelectorId, "Load hidden", "Automatically loads hidden timeline items.", CurrentSettings.AutoLoadHidden, true);

	let actionButtons = (
		<div className="Box-footer form-actions">
          <button type="submit" className="btn btn-primary" data-disable-with="Saving…" onClick={() => saveSettings()}>Save</button>
          <button type="reset" className="btn" data-close-dialog="" onClick={() => restoreSettings()}>Cancel</button>
        </div>
	);

	form.append(actionButtons);

	// This works on github enterprise - for is already preloaded
	select("form", detailsDialog)?.remove();
	// This works on normal github - form would be loaded with this thing.
	select("include-fragment", detailsDialog)?.remove();

	detailsDialog.append(form);
	notifications.after(timelineFilter);
}

async function init () {
	await addTimelineItemsFilter();

	observe(timelineItemSelector, {
		add(el) {
			const htmlElement = el as HTMLElement;
			processTimelineItem(htmlElement);
		}
	})

	observe(".ajax-pagination-btn:not([disabled])", {
		async add(el) {
			if(CurrentSettings.AutoLoadHidden) {
				// TODO :Comment this
				await sleep(1);
				select(".text-gray", el.parentElement as Element)!.click();
			}
		}
	})
}

function processTimelineItem(item : HTMLElement)
{
	const labelBadge = select(".TimelineItem .TimelineItem-badge .octicon-tag", item);
	if(labelBadge)
	{
		applyDisplay(item, CurrentSettings.HideLabels);
		return;
	}

	const pr = select(".js-comment[id^=pullrequestreview]", item);

	if(pr)
	{
		let hasVisibleElement = false;

		for(let threadContainer of select.all(".js-resolvable-timeline-thread-container", item))
		{
			const commentContainer = select(".inline-comment-form-container", threadContainer);
			
			if(threadContainer.getAttribute("data-resolved") === "true")
			{
				applyDisplay(threadContainer, CurrentSettings.HideResolved);
			}
			// There is 1 special case here when github shows you a comment that was added to previous comment thread but it does not show whether it is resolved or not resolved comment.
			// It's kinda tricky to know what to do with this so it is marked as normal comment for meantime.
			// We are just checking here if user is able to comment inside that timeline thread, if not then it means we have this special situation that was just described.
			else if(commentContainer === null)
			{
				applyDisplay(threadContainer, CurrentSettings.hideNormalComment)
			}
			else
			{
				applyDisplay(threadContainer, CurrentSettings.HideUnresolved);
			}

			// We need to hide whole thread group if we have hidden all comments inside.
			hasVisibleElement = hasVisibleElement || threadContainer.style.display === "";
		}

		applyDisplay(item, !hasVisibleElement);
		return;
	}

	const commitGroup = select(".js-commit-group", item);
	const normalComment = select(".js-comment-container", item);
	if(commitGroup)
	{
		applyDisplay(item, CurrentSettings.HideCommits);
		return;
	}
	else if(normalComment)
	{
		applyDisplay(item, CurrentSettings.hideNormalComment);
		return;
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	init
});