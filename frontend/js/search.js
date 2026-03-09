// ── search.js — Search & Filter Logic ──

function filterStudents(students, query) {
  const q = query.toLowerCase().trim();
  return students.filter(s =>
    (s.name   && s.name.toLowerCase().includes(q))  ||
    (s.email  && s.email.toLowerCase().includes(q)) ||
    (s.mobile && String(s.mobile).includes(q))
  );
}

function handleSearch() {
  const query   = document.getElementById('search-input').value.trim();
  const clearBtn = document.getElementById('clear-btn');
  const tag      = document.getElementById('search-tag');
  const tagText  = document.getElementById('search-tag-text');

  if (query) {
    clearBtn.classList.add('visible');
    filteredStudents = filterStudents(allStudents, query);
    tagText.textContent = `"${query}"`;
    tag.classList.remove('d-none');
  } else {
    clearBtn.classList.remove('visible');
    filteredStudents = [...allStudents];
    tag.classList.add('d-none');
  }

  renderTable(filteredStudents);
  updateExportCounts();
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  handleSearch();
  document.getElementById('search-input').focus();
}