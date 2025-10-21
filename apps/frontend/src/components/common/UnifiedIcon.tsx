import React from 'react';
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic';

// Import react-icons for admin compatibility
import {
  FiHome, FiUser, FiShoppingCart, FiSearch, FiHeart, FiStar, FiPhone, FiMail,
  FiMapPin, FiCalendar, FiClock, FiCamera, FiBell, FiBookmark, FiMessageSquare,
  FiFile, FiFolder, FiSettings, FiTool, FiTrash2, FiDownload, FiUpload,
  FiArrowLeft, FiArrowRight, FiArrowUp, FiArrowDown, FiChevronLeft,
  FiChevronRight, FiChevronUp, FiChevronDown, FiPlus, FiMinus, FiX, FiCheck
} from 'react-icons/fi';

import {
  FaHome, FaUser, FaShoppingBag, FaSearch, FaHeart, FaStar,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendar, FaClock,
  FaCamera, FaBell, FaBookmark, FaComments, FaFile, FaFolder,
  FaCog, FaWrench, FaTrash, FaDownload, FaUpload, FaArrowLeft,
  FaArrowRight, FaArrowUp, FaArrowDown, FaChevronLeft,
  FaChevronRight, FaChevronUp, FaChevronDown, FaPlus, FaMinus,
  FaTimes, FaCheck
} from 'react-icons/fa';

import {
  MdHome, MdPerson, MdShoppingCart, MdSearch, MdFavorite, MdStar, MdPhone, MdEmail,
  MdLocationOn, MdCalendarToday, MdAccessTime, MdCameraAlt, MdNotifications,
  MdBookmark, MdChat, MdDescription, MdFolder, MdSettings, MdBuild, MdDelete,
  MdDownload, MdUpload, MdArrowBack, MdArrowForward, MdArrowUpward, MdArrowDownward,
  MdChevronLeft, MdChevronRight, MdKeyboardArrowUp, MdKeyboardArrowDown,
  MdAdd, MdRemove, MdClose, MdCheck
} from 'react-icons/md';

export type IconVariant = 'nav' | 'nav-active' | 'button' | 'header' | 'default';

interface UnifiedIconProps {
  icon?: string | null;
  variant?: IconVariant;
  className?: string;
  size?: number;
  fallback?: string;
}

// Available Lucide icon names
const LUCIDE_ICON_NAMES = new Set<string>(iconNames);

// Icon mapping for react-icons compatibility
const REACT_ICONS_MAP: Record<string, React.ReactElement> = {
  // Heroicons (Fi)
  'home': <FiHome />,
  'user': <FiUser />,
  'shopping-cart': <FiShoppingCart />,
  'search': <FiSearch />,
  'heart': <FiHeart />,
  'star': <FiStar />,
  'phone': <FiPhone />,
  'mail': <FiMail />,
  'map-pin': <FiMapPin />,
  'calendar': <FiCalendar />,
  'clock': <FiClock />,
  'camera': <FiCamera />,
  'bell': <FiBell />,
  'bookmark': <FiBookmark />,
  'chat': <FiMessageSquare />,
  'document': <FiFile />,
  'folder': <FiFolder />,
  'cog': <FiSettings />,
  'wrench': <FiTool />,
  'trash': <FiTrash2 />,
  'download': <FiDownload />,
  'upload': <FiUpload />,
  'arrow-left': <FiArrowLeft />,
  'arrow-right': <FiArrowRight />,
  'arrow-up': <FiArrowUp />,
  'arrow-down': <FiArrowDown />,
  'chevron-left': <FiChevronLeft />,
  'chevron-right': <FiChevronRight />,
  'chevron-up': <FiChevronUp />,
  'chevron-down': <FiChevronDown />,
  'plus': <FiPlus />,
  'minus': <FiMinus />,
  'x': <FiX />,
  'check': <FiCheck />,

  // Font Awesome (Fa)
  'fa-home': <FaHome />,
  'fa-user': <FaUser />,
  'fa-shopping-bag': <FaShoppingBag />,
  'fa-search': <FaSearch />,
  'fa-heart': <FaHeart />,
  'fa-star': <FaStar />,
  'fa-phone': <FaPhone />,
  'fa-envelope': <FaEnvelope />,
  'fa-map-marker-alt': <FaMapMarkerAlt />,
  'fa-calendar': <FaCalendar />,
  'fa-clock': <FaClock />,
  'fa-camera': <FaCamera />,
  'fa-bell': <FaBell />,
  'fa-bookmark': <FaBookmark />,
  'fa-comments': <FaComments />,
  'fa-file': <FaFile />,
  'fa-folder': <FaFolder />,
  'fa-cog': <FaCog />,
  'fa-wrench': <FaWrench />,
  'fa-trash': <FaTrash />,
  'fa-download': <FaDownload />,
  'fa-upload': <FaUpload />,
  'fa-arrow-left': <FaArrowLeft />,
  'fa-arrow-right': <FaArrowRight />,
  'fa-arrow-up': <FaArrowUp />,
  'fa-arrow-down': <FaArrowDown />,
  'fa-chevron-left': <FaChevronLeft />,
  'fa-chevron-right': <FaChevronRight />,
  'fa-chevron-up': <FaChevronUp />,
  'fa-chevron-down': <FaChevronDown />,
  'fa-plus': <FaPlus />,
  'fa-minus': <FaMinus />,
  'fa-times': <FaTimes />,
  'fa-check': <FaCheck />,

  // Material Icons (Md) - prefixed with 'md-'
  'md-home': <MdHome />,
  'md-person': <MdPerson />,
  'md-shopping_cart': <MdShoppingCart />,
  'md-search': <MdSearch />,
  'md-favorite': <MdFavorite />,
  'md-star': <MdStar />,
  'md-phone': <MdPhone />,
  'md-email': <MdEmail />,
  'md-location_on': <MdLocationOn />,
  'md-calendar_today': <MdCalendarToday />,
  'md-access_time': <MdAccessTime />,
  'md-camera_alt': <MdCameraAlt />,
  'md-notifications': <MdNotifications />,
  'md-bookmark': <MdBookmark />,
  'md-chat': <MdChat />,
  'md-description': <MdDescription />,
  'md-folder': <MdFolder />,
  'md-settings': <MdSettings />,
  'md-build': <MdBuild />,
  'md-delete': <MdDelete />,
  'md-download': <MdDownload />,
  'md-upload': <MdUpload />,
  'md-arrow_back': <MdArrowBack />,
  'md-arrow_forward': <MdArrowForward />,
  'md-arrow_upward': <MdArrowUpward />,
  'md-arrow_downward': <MdArrowDownward />,
  'md-chevron_left': <MdChevronLeft />,
  'md-chevron_right': <MdChevronRight />,
  'md-keyboard_arrow_up': <MdKeyboardArrowUp />,
  'md-keyboard_arrow_down': <MdKeyboardArrowDown />,
  'md-add': <MdAdd />,
  'md-remove': <MdRemove />,
  'md-close': <MdClose />,
  'md-check': <MdCheck />
};

// Normalize icon name for Lucide icons
const normalizeIconName = (icon: string) =>
  icon.trim().toLowerCase().replace(/[_\s]+/g, '-');

// Get variant classes
const getVariantClasses = (variant: IconVariant) => {
  switch (variant) {
    case 'nav':
      return 'icon-nav';
    case 'nav-active':
      return 'icon-nav-active';
    case 'button':
      return 'icon-button';
    case 'header':
      return 'icon-header';
    default:
      return 'icon-container icon-sm icon-default';
  }
};

export const UnifiedIcon: React.FC<UnifiedIconProps> = ({
  icon,
  variant = 'nav',
  className = '',
  size = 18,
  fallback
}) => {
  if (!icon) {
    return null;
  }

  const normalized = normalizeIconName(icon);
  const baseClasses = getVariantClasses(variant);
  const combinedClassName = [baseClasses, className].filter(Boolean).join(' ');

  // Try Lucide icons first (preferred for frontend)
  if (LUCIDE_ICON_NAMES.has(normalized)) {
    const iconName = normalized as IconName;
    return (
      <DynamicIcon
        name={iconName}
        size={size}
        strokeWidth={1.8}
        className={combinedClassName}
        aria-hidden="true"
      />
    );
  }

  // Fallback to react-icons for admin compatibility
  const reactIcon = REACT_ICONS_MAP[icon];
  if (reactIcon) {
    return (
      <span className={combinedClassName} style={{ fontSize: `${size}px`, lineHeight: 1 }}>
        {reactIcon}
      </span>
    );
  }

  // Ultimate fallback
  if (fallback) {
    return <span className={combinedClassName}>{fallback}</span>;
  }

  return (
    <span className={`${combinedClassName} text-xs opacity-50`} title={`Unknown icon: ${icon}`}>
      ?
    </span>
  );
};

export default UnifiedIcon;