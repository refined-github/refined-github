import select from 'select-dom';

export default function () {
	const squashButton = select(`.btn-group-squash > button`);

	if (squashButton) {
		squashButton.dataset.hotkey = 'a s';
	}

  const confirmButton = select(`.btn-group-squash > button[name="do"]`);

  if (confirmButton) {
    confirmButton.dataset.hotkey = 'a s';
  }
}
