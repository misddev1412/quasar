export interface ViewMoreButtonColorConfig {
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  hoverTextColor?: string;
  hoverBackgroundColor?: string;
  hoverBorderColor?: string;
}

export interface ViewMoreButtonConfig {
  size?: 'sm' | 'md' | 'lg';
  uppercase?: boolean;
  bold?: boolean;
  variant?: 'default' | 'primary' | 'ghost' | 'outline';
  lightMode?: ViewMoreButtonColorConfig;
  darkMode?: ViewMoreButtonColorConfig;
  label?: string;
  href?: string;
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
}
