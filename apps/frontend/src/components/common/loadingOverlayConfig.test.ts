import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveLoadingOverlayConfig } from './loadingOverlayConfig';

test('does not render while public settings are unresolved', () => {
  const values: Record<string, string> = {
    'storefront.loading_overlay_enabled': 'false',
  };
  const getSetting = (key: string, fallback = '') => values[key] ?? fallback;

  assert.equal(resolveLoadingOverlayConfig({ isSettingsLoading: true, getSetting }).enabled, false);
});

test('does not render when the admin disabled the loading screen', () => {
  const values: Record<string, string> = {
    'storefront.loading_overlay_enabled': 'false',
  };
  const getSetting = (key: string, fallback = '') => values[key] ?? fallback;

  assert.equal(resolveLoadingOverlayConfig({ isSettingsLoading: false, getSetting }).enabled, false);
});

test('does not render when settings settled without an explicit enabled value', () => {
  const getSetting = (_key: string, fallback = '') => fallback;

  assert.equal(resolveLoadingOverlayConfig({ isSettingsLoading: false, getSetting }).enabled, false);
});

test('normalizes enabled visual settings', () => {
    const configuredValues: Record<string, string> = {
      'storefront.loading_overlay_enabled': 'true',
      'storefront.loading_overlay_title': 'My Store',
      'storefront.loading_overlay_message': 'Đang chuẩn bị...',
      'storefront.loading_overlay_show_logo': 'false',
      'storefront.loading_overlay_background_color': '#112233',
      'storefront.loading_overlay_accent_color': '#abcdef',
    };

    const config = resolveLoadingOverlayConfig({
      isSettingsLoading: false,
      getSetting: (key, fallback = '') => configuredValues[key] ?? fallback,
    });

    assert.deepEqual(config, {
      enabled: true,
      title: 'My Store',
      message: 'Đang chuẩn bị...',
      showLogo: false,
      backgroundColor: '#112233',
      accentColor: '#abcdef',
    });
});

test('rejects unsafe color values', () => {
    const config = resolveLoadingOverlayConfig({
      isSettingsLoading: false,
      getSetting: (key, fallback = '') => ({
        'storefront.loading_overlay_enabled': 'true',
        'storefront.loading_overlay_background_color': 'url(javascript:alert(1))',
        'storefront.loading_overlay_accent_color': 'red;display:none',
      }[key] ?? fallback),
    });

    assert.equal(config.backgroundColor, '');
    assert.equal(config.accentColor, '#3b82f6');
});
