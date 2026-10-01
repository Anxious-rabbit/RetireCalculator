/* Native dialogs own the inert background and Escape handling. */
for (const trigger of document.querySelectorAll('[data-dialog-trigger]')) {
  const dialog = document.getElementById(trigger.dataset.dialogTrigger);
  if (!(dialog instanceof HTMLDialogElement)) continue;

  trigger.addEventListener('click', () => {
    if (dialog.open) return;
    document.documentElement.classList.add('dialog-open');
    dialog.showModal();
    dialog.querySelector('.dialog-body').scrollTop = 0;
  });
  dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('dialog-open');
    trigger.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
    const targets = [...dialog.querySelectorAll('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')]
      .filter(node => node.getClientRects().length);
    const first = targets[0], last = targets.at(-1);
    if ((event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });

  // Dismiss a deliberate backdrop click, not a drag that started in the content.
  const outside = event => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom;
  };
  let startedOutside = false;
  dialog.addEventListener('pointerdown', event => { startedOutside = outside(event); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && startedOutside && outside(event)) dialog.close();
    startedOutside = false;
  });
}
