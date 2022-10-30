import './convert-image-markdown-to-img-tag.css';
import React from 'dom-chef';
import {ImageIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import { isInteger } from 'ts-extras';


function convertToImgTag({delegateTarget: square}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
  const markdownRegExp = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/gm;
	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #5303 */
	const field = square.form!.querySelector('textarea.js-comment-field')!;
  const width = parseInt(square.form!.querySelector('input.rgh-cimtit-value')!.value);

  if(!isInteger(width) || width <= 0) return;

  let result = field.value;
  let match = markdownRegExp.exec(result);

  while(match != null) {
    let original = match[0];
    let url = match.groups?.filename;
    let imgTag = `<img src="${url}" width=${width} />`;
    result = result.replace(original, imgTag);
    match = markdownRegExp.exec(result);
  }

	field.focus();
	textFieldEdit.set(field, result);
}

function addButtons(signal: AbortSignal): void {
	observe('md-task-list', anchor => {
		anchor.after(
			<details className="details-reset details-overlay flex-auto toolbar-item btn-octicon mx-1 select-menu select-menu-modal-right hx_rsm">
				<summary
					className="text-center menu-target p-2 p-md-1 hx_rsm-trigger"
					role="button"
					aria-label="Convert image markdown to img tag"
					aria-haspopup="menu"
				>
					<div
						className="tooltipped tooltipped-sw"
						aria-label="Convert image markdown to img tag"
					>
						<ImageIcon/>
					</div>
				</summary>
				<details-menu className="select-menu-modal position-absolute left-0 hx_rsm-modal rgh-panel-input" role="menu">
          <div className='select-menu-header d-flex'>
            <div className='select-menu-title flex-auto'>{'Convert image markdown to img tag'}</div>
          </div>
          <div className='select-menu-filters d-none d-md-flex p-2'>
            <input autoFocus={true} required={true} placeholder="px" className="form-control required title js-session-resumable js-quick-submit input-lg input-block input-contrast rgh-cimtit-value" type="number"  />
            <div className='d-flex flex-items-center flex-auto mx-1' />
            <button
                type="button"
                role="menuitem"
                className='btn-primary btn rgh-cimtit-btn'
              >
              {'Convert'}
            </button>
          </div>
				</details-menu>
			</details>,
		);
	}, {signal});
}

function init(signal: AbortSignal): void {
	addButtons(signal);
	delegate(document, '.rgh-cimtit-btn', 'click', convertToImgTag, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});
