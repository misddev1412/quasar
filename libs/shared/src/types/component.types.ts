export type ThemeAwareColor = {
  light?: string;
  dark?: string;
};

export type ViewMoreButtonTextTransform = 'none' | 'uppercase' | 'capitalize';
export type ViewMoreButtonBorderWidth = 'none' | 'thin' | 'medium' | 'thick';

export interface ViewMoreButtonBorderConfig extends Record<string, unknown> {
  width?: ViewMoreButtonBorderWidth;
  color?: ThemeAwareColor;
}

export interface ViewMoreButtonHoverConfig extends Record<string, unknown> {
  textColor?: ThemeAwareColor;
  backgroundColor?: ThemeAwareColor;
  borderColor?: ThemeAwareColor;
}

export interface ViewMoreButtonConfig extends Record<string, unknown> {
  size?: 'sm' | 'md' | 'lg';
  textTransform?: ViewMoreButtonTextTransform;
  isBold?: boolean;
  backgroundColor?: ThemeAwareColor;
  textColor?: ThemeAwareColor;
  border?: ViewMoreButtonBorderConfig;
  hover?: ViewMoreButtonHoverConfig;
}
