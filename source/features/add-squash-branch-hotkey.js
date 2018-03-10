import select from 'select-dom';

export default function () {
	const squashButton = select(`.btn-group-squash > button`);

	if (squashButton) {
		squashButton.setAttribute('data-hotkey', 'a s');
	}

  const confirmButton = select(`.btn-group-squash > button[name="do"]`);

  if (confirmButton) {
    confirmButton.setAttribute('data-hotkey', 'a s');
  }
}
