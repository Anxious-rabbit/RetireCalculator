/* Optional presentation preferences only. Never read or store calculator inputs. */
(() => {
  const root = document.documentElement;
  const storageKey = 'pension-reading-preferences';
  const appearanceValues = ['system', 'light', 'dark'];
  const sizeValues = ['default', 'large', 'extra-large'];
  let appearance = 'system';
  let textSize = 'default';
  let systemTheme;
  try { systemTheme = window.matchMedia('(prefers-color-scheme: dark)'); } catch { /* Light fallback. */ }
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey));
    if (saved && appearanceValues.includes(saved.appearance)) appearance = saved.appearance;
    if (saved && sizeValues.includes(saved.textSize)) textSize = saved.textSize;
  } catch { /* Storage is optional; reading and calculation remain available. */ }

  function applyAppearance() {
    root.dataset.theme = appearance === 'system' ? (systemTheme?.matches ? 'dark' : 'light') : appearance;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = root.dataset.theme === 'dark' ? '#1C211E' : '#F5F6F4';
  }
  function save() {
    try { window.localStorage.setItem(storageKey, JSON.stringify({ appearance, textSize })); } catch { /* Session-only settings. */ }
  }
  applyAppearance();
  root.dataset.textSize = textSize;
  systemTheme?.addEventListener?.('change', () => { if (appearance === 'system') applyAppearance(); });

  document.addEventListener('DOMContentLoaded', () => {
    const settings = document.getElementById('reading-settings');
    const appearanceControl = document.getElementById('appearance');
    const sizeControl = document.getElementById('text-size');
    appearanceControl.value = appearance;
    sizeControl.value = textSize;
    settings.hidden = false;
    appearanceControl.addEventListener('change', () => {
      if (!appearanceValues.includes(appearanceControl.value)) return;
      appearance = appearanceControl.value;
      applyAppearance();
      save();
    });
    sizeControl.addEventListener('change', () => {
      if (!sizeValues.includes(sizeControl.value)) return;
      // Keep the same content node at its viewport offset through text reflow.
      const paragraphs = [...document.querySelectorAll('main p, main h1, main h2, main h3, main dt')];
      const anchor = paragraphs.find(node => {
        const rect = node.getBoundingClientRect();
        return rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
      });
      const offset = anchor?.getBoundingClientRect().top;
      textSize = sizeControl.value;
      root.dataset.textSize = textSize;
      if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - offset, behavior: 'instant' });
      save();
    });
    settings.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        settings.open = false;
        settings.querySelector('summary').focus();
      }
    });
  });
})();
