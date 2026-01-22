// Frontend logic: search-as-you-type, suggestion dropdown, fetch and render table
const searchBox = document.getElementById('searchBox');
const suggestionsEl = document.getElementById('suggestions');
const resultsBody = document.getElementById('resultsBody');
const statsEl = document.getElementById('stats');
const limitSelect = document.getElementById('limitSelect');
const paginationEl = document.getElementById('pagination');

let currentQuery = '';
let page = 1;
let limit = parseInt(limitSelect.value);

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

async function fetchFiles(query = '', pageNum = 1, limitNum = 10) {
  const params = new URLSearchParams({ query, page: pageNum, limit: limitNum });
  const res = await fetch('/api/files?' + params.toString());
  if (!res.ok) throw new Error('Gagal fetch data');
  return res.json();
}

async function fetchSuggestions(q) {
  const params = new URLSearchParams({ q });
  const res = await fetch('/api/suggest?' + params.toString());
  if (!res.ok) return [];
  const body = await res.json();
  return body.suggestions || [];
}

function highlight(text, query) {
  if (!query) return text;
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(esc, 'ig');
  return text.replace(re, (m) => `<span class="highlight">${m}</span>`);
}

function renderRows(rows, q) {
  resultsBody.innerHTML = '';
  if (!rows || rows.length === 0) {
    resultsBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Tidak ada hasil.</td></tr>`;
    return;
  }
  rows.forEach((r, idx) => {
    const row = document.createElement('tr');
    const noCell = `<th scope="row">${(page-1)*limit + idx + 1}</th>`;
    row.innerHTML = `
      ${noCell}
      <td>${highlight(escapeHtml(r.nomor), q)}</td>
      <td>${highlight(escapeHtml(r.tanggal_directur), q)}</td>
      <td>${highlight(escapeHtml(r.perusahaan), q)}</td>
      <td>${highlight(escapeHtml(r.desa), q)}</td>
      <td>${highlight(escapeHtml(r.kecamatan), q)}</td>
      <td>${r.luas}</td>
      <td>${highlight(escapeHtml(r.peruntukan), q)}</td>
    `;
    resultsBody.appendChild(row);
  });
}

function escapeHtml(unsafe) {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderPagination(total, pageNum, limitNum) {
  paginationEl.innerHTML = '';
  const pages = Math.max(1, Math.ceil(total / limitNum));
  const createItem = (p, label = null, disabled=false, active=false) => {
    const li = document.createElement('li');
    li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = label || p;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (!disabled && !active) {
        page = p;
        load();
      }
    });
    li.appendChild(a);
    return li;
  };

  // prev
  paginationEl.appendChild(createItem(Math.max(1, pageNum-1), '«', pageNum === 1));
  // show up to 7 pages centered
  const start = Math.max(1, pageNum - 3);
  const end = Math.min(pages, pageNum + 3);
  for (let p = start; p <= end; p++) {
    paginationEl.appendChild(createItem(p, null, false, p === pageNum));
  }
  // next
  paginationEl.appendChild(createItem(Math.min(pages, pageNum+1), '»', pageNum === pages));
}

async function load() {
  try {
    const data = await fetchFiles(currentQuery, page, limit);
    renderRows(data.data, currentQuery);
    statsEl.textContent = `Menampilkan ${data.data.length} dari ${data.total} hasil (halaman ${data.page})`;
    renderPagination(data.total, data.page, data.limit);
  } catch (err) {
    resultsBody.innerHTML = `<tr><td colspan="8" class="text-danger text-center">Error: ${err.message}</td></tr>`;
  }
}

const debouncedSuggest = debounce(async (val) => {
  if (!val) {
    suggestionsEl.style.display = 'none';
    suggestionsEl.innerHTML = '';
    return;
  }
  try {
    const list = await fetchSuggestions(val);
    if (!list || list.length === 0) {
      suggestionsEl.style.display = 'none';
      suggestionsEl.innerHTML = '';
      return;
    }
    suggestionsEl.innerHTML = '';
    list.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `<div>${escapeHtml(item.text)} <small class="text-muted">(${item.type})</small></div>`;
      li.addEventListener('click', () => {
        searchBox.value = item.text;
        currentQuery = item.text;
        suggestionsEl.style.display = 'none';
        page = 1;
        load();
      });
      suggestionsEl.appendChild(li);
    });
    suggestionsEl.style.display = 'block';
  } catch (err) {
    suggestionsEl.style.display = 'none';
  }
}, 200);

searchBox.addEventListener('input', (e) => {
  const v = e.target.value.trim();
  currentQuery = v;
  page = 1;
  debouncedSuggest(v);
  debouncedLoad();
});

const debouncedLoad = debounce(() => load(), 300);

limitSelect.addEventListener('change', (e) => {
  limit = parseInt(e.target.value);
  page = 1;
  load();
});

document.addEventListener('click', (e) => {
  if (!suggestionsEl.contains(e.target) && e.target !== searchBox) {
    suggestionsEl.style.display = 'none';
  }
});

// initial load
load();
