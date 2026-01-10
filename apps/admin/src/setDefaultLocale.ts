(function() {
  try {
    // Defer to locale config API; avoid forcing a localStorage default here.
    localStorage.getItem('admin-locale');
  } catch (e) {
    console.error('Failed to set admin locale:', e);
  }
})();

export {}; 
