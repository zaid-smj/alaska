(() => {
  'use strict';
  const form = document.getElementById('catalog-filter-form');
  if (!form) return;
  const results = document.getElementById('catalog-results');
  const filters = document.getElementById('catalog-filters');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const adjustFilters = () => { filters.open = desktop.matches; };
  adjustFilters();
  desktop.addEventListener('change', adjustFilters);
  let filterRequest;
  let filterTimer;
  async function applyFilters() {
    filterRequest?.abort();
    filterRequest = new AbortController();
    const url = new URL(form.action);
    const data = new FormData(form);
    for (const [key, value] of data) if (value.trim()) url.searchParams.append(key, value);
    results.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(url, {signal: filterRequest.signal, headers: {'Accept': 'text/html'}});
      if (!response.ok) throw new Error('Search unavailable');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      const updated = page.getElementById('catalog-results');
      if (!updated) throw new Error('Search unavailable');
      results.replaceChildren(...updated.childNodes);
      history.replaceState(null, '', url);
      results.removeAttribute('aria-busy');
    } catch (error) {
      if (error.name !== 'AbortError') {
        results.removeAttribute('aria-busy');
        let notice = document.getElementById('catalog-error');
        if (!notice) { notice = document.createElement('p'); notice.id = 'catalog-error'; notice.setAttribute('role', 'alert'); results.prepend(notice); }
        notice.textContent = 'Search is temporarily unavailable. Please try again or use Apply filters.';
      }
    }
  }
  form.addEventListener('submit', (event) => { event.preventDefault(); clearTimeout(filterTimer); applyFilters(); });
  form.querySelector('[type=search]').addEventListener('input', () => { clearTimeout(filterTimer); filterRequest?.abort(); filterTimer = setTimeout(applyFilters, 250); });
  form.querySelectorAll('[type=checkbox]').forEach(input => input.addEventListener('change', () => { clearTimeout(filterTimer); applyFilters(); }));

  const dialog = document.getElementById('catalog-compare');
  const opener = document.getElementById('compare-open');
  const message = document.getElementById('compare-message');
  const tableArea = document.getElementById('compare-table');
  const selected = [null, null];
  const requests = [null, null];
  const timers = [null, null];
  const slots = [...dialog.querySelectorAll('[data-slot]')];
  const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
  function renderComparison() {
    tableArea.replaceChildren();
    slots.forEach((slot, index) => {
      const area = slot.querySelector('.catalog-selected');
      area.replaceChildren();
      const product = selected[index];
      if (!product) { area.textContent = 'No battery selected'; return; }
      if (product.image) { const img = element('img'); img.src = product.image; img.alt = product.name; area.append(img); }
      area.append(element('strong', product.name));
      const remove = element('button', 'Remove');
      remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${product.name} from comparison`);
      remove.addEventListener('click', () => { selected[index] = null; renderComparison(); search(index); });
      area.append(remove);
    });
    if (!selected.every(Boolean)) { message.textContent = 'Select two batteries to compare their specifications.'; return; }
    message.textContent = 'Comparing two batteries';
    const table = element('table'); table.className = 'catalog-spec-table';
    table.append(element('caption', `${selected[0].name} and ${selected[1].name}`));
    const head = element('thead'); const headings = element('tr');
    for (const title of ['Specification', selected[0].name, selected[1].name]) { const th = element('th', title); th.scope = 'col'; headings.append(th); }
    head.append(headings); table.append(head);
    const body = element('tbody');
    Object.keys(selected[0].specifications).forEach(label => {
      const row = element('tr'); const heading = element('th', label); heading.scope = 'row'; row.append(heading);
      selected.forEach(product => row.append(element('td', product.specifications[label] ?? '—')));
      body.append(row);
    });
    table.append(body); tableArea.append(table);
  }
  async function search(index) {
    requests[index]?.abort();
    requests[index] = new AbortController();
    const slot = slots[index]; const options = slot.querySelector('.catalog-options');
    const q = slot.querySelector('input').value.trim();
    const url = new URL('/products/compare-search', window.location.origin); url.searchParams.set('q', q);
    options.replaceChildren(element('p', 'Searching…'));
    try {
      const response = await fetch(url, {signal: requests[index].signal, headers: {'Accept': 'application/json'}});
      if (!response.ok) throw new Error('Search unavailable');
      const products = await response.json(); options.replaceChildren();
      if (!products.length) options.append(element('p', 'No matching batteries.'));
      for (const product of products) {
        const button = element('button', product.name); button.type = 'button';
        const duplicate = selected[1 - index]?.id === product.id;
        button.disabled = duplicate;
        if (duplicate) button.textContent += ' (selected on the other side)';
        button.addEventListener('click', () => {
          // Check again because the other slot may have changed after these results loaded.
          if (selected[1 - index]?.id === product.id) { message.textContent = 'Choose two different batteries.'; search(index); return; }
          selected[index] = product; slot.querySelector('input').value = product.name;
          options.replaceChildren(); renderComparison();
          if (selected.every(Boolean)) {
            requests.forEach(request => request?.abort());
            slots.forEach(otherSlot => otherSlot.querySelector('.catalog-options').replaceChildren());
          } else {
            search(1 - index);
          }
        });
        options.append(button);
      }
      if (products.length === 20) options.append(element('p', 'Showing the first 20 matches. Type more of the name to narrow your search.'));
    } catch (error) {
      if (error.name !== 'AbortError') options.replaceChildren(element('p', 'Unable to search. Please try again.'));
    }
  }
  opener.addEventListener('click', () => { dialog.showModal(); document.documentElement.style.overflow = 'hidden'; search(0); search(1); slots[0].querySelector('input').focus(); });
  document.getElementById('compare-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.documentElement.style.overflow = ''; requests.forEach(request => request?.abort()); timers.forEach(clearTimeout); opener.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  slots.forEach((slot, index) => slot.querySelector('input').addEventListener('input', () => { clearTimeout(timers[index]); requests[index]?.abort(); timers[index] = setTimeout(() => search(index), 200); }));
})();
