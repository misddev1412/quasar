(function() {
  try {
    // Only set default locale if none exists in localStorage
    const existingLocale = localStorage.getItem('admin-locale');
    if (!existingLocale) {
      localStorage.setItem('admin-locale', 'en');
      console.log('Admin locale set to English by default (no existing locale found)');
    } else {
      console.log('Admin locale already set to:', existingLocale);
    }
  } catch (e) {
    console.error('Failed to set admin locale:', e);
  }
})();

export {}; 