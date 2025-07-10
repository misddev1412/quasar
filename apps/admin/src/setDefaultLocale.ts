(function() {
  try {
    localStorage.setItem('admin-locale', 'en');
    console.log('Admin locale set to English by default');
  } catch (e) {
    console.error('Failed to set admin locale:', e);
  }
})();

export {}; 