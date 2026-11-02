/* Public forms are design previews until their dashboard workflows are built. */
(() => {
  'use strict';
  const message = 'Preview only — submissions are not sent or saved yet.';
  document.addEventListener('submit', (event) => {
    if (!event.target.matches('form[data-preview-form]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const notice = event.target.querySelector('[data-preview-notice]');
    if (notice) {
      notice.textContent = message;
      notice.focus();
    }
  }, true);
  const initialize = () => {
    document.querySelectorAll('form[data-preview-form]').forEach((form) => {
      const notice = document.createElement('p');
      notice.dataset.previewNotice = '';
      notice.setAttribute('role', 'status');
      notice.tabIndex = -1;
      notice.textContent = message;
      notice.style.cssText = 'padding:12px 16px;border:1px solid #fed7aa;border-radius:8px;background:#fff7ed;color:#7c2d12;line-height:1.5';
      form.prepend(notice);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
