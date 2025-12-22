(function() {
  try {
    // Only set default locale if none exists in localStorage
    const existingLocale = localStorage.getItem('admin-locale');
    if (!existingLocale) {
      localStorage.setItem('admin-locale', 'en');
    }
  } catch (e) {
    console.error('Failed to set admin locale:', e);
  }
})();

export {}; 
