import assert from 'node:assert/strict';
import test from 'node:test';
import { getSidebarItemFontSizeClass } from './sidebarTypography';

test('renders xs storefront sidebar items at 10px', () => {
  assert.equal(getSidebarItemFontSizeClass('xs'), 'text-[10px]');
});

test('preserves the existing sizes for larger menu items', () => {
  assert.equal(getSidebarItemFontSizeClass('sm'), 'text-sm');
  assert.equal(getSidebarItemFontSizeClass('base'), 'text-base');
  assert.equal(getSidebarItemFontSizeClass('lg'), 'text-lg');
});
