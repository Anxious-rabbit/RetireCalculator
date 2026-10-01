/* Development only. Never persist form values or silently discard edited input. */
(() => {
  const revision = document.currentScript.dataset.revision;
  let edited = false;
  let checking = false;
  let updateShown = false;
  document.addEventListener('input', () => { edited = true; }, true);
  document.addEventListener('change', () => { edited = true; }, true);

  async function check() {
    if (checking || updateShown || document.hidden) return;
    checking = true;
    try {
      const response = await fetch('/__preview_revision', { cache: 'no-store' });
      if (!response.ok) return;
      const next = await response.json();
      if (next.revision === revision) return;
      if (!edited) {
        location.reload();
        return;
      }
      updateShown = true;
      const notice = document.createElement('aside');
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'position:fixed;z-index:1000;inset:auto 16px 16px;max-width:440px;padding:12px 16px;background:#f4f2ee;color:#202123;border-radius:16px;font:14px/1.5 system-ui;box-shadow:0 4px 24px #0005';
      notice.append('Preview updated. Reload to see changes; entered values will reset. ');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Reload preview';
      button.style.cssText = 'display:block;margin-top:8px;padding:8px 16px;background:#202123;color:white';
      button.onclick = () => location.reload();
      notice.append(button);
      document.body.append(notice);
    } catch {
      // A stopped/restarting server must not interrupt the calculator.
    } finally {
      checking = false;
    }
  }
  setInterval(check, 2000);
  document.addEventListener('visibilitychange', check);
})();
