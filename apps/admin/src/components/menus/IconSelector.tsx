import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { InputWithIcon } from '../../components/common/InputWithIcon';
import { UnifiedIcon } from '../../components/common/UnifiedIcon';
import { cn } from '@admin/lib/utils';

// Import react-icons
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

interface IconSelectorProps {
  value?: string;
  onChange: (icon: string) => void;
  label?: string;
  placeholder?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ value, onChange, label, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Icon mapping to actual components
  const iconMap: Record<string, React.ReactElement> = {
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

  // Icon categories with visual icons
  const iconSets = {
    'Heroicons': [
      { name: 'home', component: <FiHome /> },
      { name: 'user', component: <FiUser /> },
      { name: 'shopping-cart', component: <FiShoppingCart /> },
      { name: 'search', component: <FiSearch /> },
      { name: 'heart', component: <FiHeart /> },
      { name: 'star', component: <FiStar /> },
      { name: 'phone', component: <FiPhone /> },
      { name: 'mail', component: <FiMail /> },
      { name: 'map-pin', component: <FiMapPin /> },
      { name: 'calendar', component: <FiCalendar /> },
      { name: 'clock', component: <FiClock /> },
      { name: 'camera', component: <FiCamera /> },
      { name: 'bell', component: <FiBell /> },
      { name: 'bookmark', component: <FiBookmark /> },
      { name: 'chat', component: <FiMessageSquare /> },
      { name: 'document', component: <FiFile /> },
      { name: 'folder', component: <FiFolder /> },
      { name: 'cog', component: <FiSettings /> },
      { name: 'wrench', component: <FiTool /> },
      { name: 'trash', component: <FiTrash2 /> },
      { name: 'download', component: <FiDownload /> },
      { name: 'upload', component: <FiUpload /> },
      { name: 'arrow-left', component: <FiArrowLeft /> },
      { name: 'arrow-right', component: <FiArrowRight /> },
      { name: 'arrow-up', component: <FiArrowUp /> },
      { name: 'arrow-down', component: <FiArrowDown /> },
      { name: 'chevron-left', component: <FiChevronLeft /> },
      { name: 'chevron-right', component: <FiChevronRight /> },
      { name: 'chevron-up', component: <FiChevronUp /> },
      { name: 'chevron-down', component: <FiChevronDown /> },
      { name: 'plus', component: <FiPlus /> },
      { name: 'minus', component: <FiMinus /> },
      { name: 'x', component: <FiX /> },
      { name: 'check', component: <FiCheck /> }
    ],
    'Font Awesome': [
      { name: 'fa-home', component: <FaHome /> },
      { name: 'fa-user', component: <FaUser /> },
      { name: 'fa-shopping-bag', component: <FaShoppingBag /> },
      { name: 'fa-search', component: <FaSearch /> },
      { name: 'fa-heart', component: <FaHeart /> },
      { name: 'fa-star', component: <FaStar /> },
      { name: 'fa-phone', component: <FaPhone /> },
      { name: 'fa-envelope', component: <FaEnvelope /> },
      { name: 'fa-map-marker-alt', component: <FaMapMarkerAlt /> },
      { name: 'fa-calendar', component: <FaCalendar /> },
      { name: 'fa-clock', component: <FaClock /> },
      { name: 'fa-camera', component: <FaCamera /> },
      { name: 'fa-bell', component: <FaBell /> },
      { name: 'fa-bookmark', component: <FaBookmark /> },
      { name: 'fa-comments', component: <FaComments /> },
      { name: 'fa-file', component: <FaFile /> },
      { name: 'fa-folder', component: <FaFolder /> },
      { name: 'fa-cog', component: <FaCog /> },
      { name: 'fa-wrench', component: <FaWrench /> },
      { name: 'fa-trash', component: <FaTrash /> },
      { name: 'fa-download', component: <FaDownload /> },
      { name: 'fa-upload', component: <FaUpload /> },
      { name: 'fa-arrow-left', component: <FaArrowLeft /> },
      { name: 'fa-arrow-right', component: <FaArrowRight /> },
      { name: 'fa-arrow-up', component: <FaArrowUp /> },
      { name: 'fa-arrow-down', component: <FaArrowDown /> },
      { name: 'fa-chevron-left', component: <FaChevronLeft /> },
      { name: 'fa-chevron-right', component: <FaChevronRight /> },
      { name: 'fa-chevron-up', component: <FaChevronUp /> },
      { name: 'fa-chevron-down', component: <FaChevronDown /> },
      { name: 'fa-plus', component: <FaPlus /> },
      { name: 'fa-minus', component: <FaMinus /> },
      { name: 'fa-times', component: <FaTimes /> },
      { name: 'fa-check', component: <FaCheck /> }
    ],
    'Material Icons': [
      { name: 'md-home', component: <MdHome /> },
      { name: 'md-person', component: <MdPerson /> },
      { name: 'md-shopping_cart', component: <MdShoppingCart /> },
      { name: 'md-search', component: <MdSearch /> },
      { name: 'md-favorite', component: <MdFavorite /> },
      { name: 'md-star', component: <MdStar /> },
      { name: 'md-phone', component: <MdPhone /> },
      { name: 'md-email', component: <MdEmail /> },
      { name: 'md-location_on', component: <MdLocationOn /> },
      { name: 'md-calendar_today', component: <MdCalendarToday /> },
      { name: 'md-access_time', component: <MdAccessTime /> },
      { name: 'md-camera_alt', component: <MdCameraAlt /> },
      { name: 'md-notifications', component: <MdNotifications /> },
      { name: 'md-bookmark', component: <MdBookmark /> },
      { name: 'md-chat', component: <MdChat /> },
      { name: 'md-description', component: <MdDescription /> },
      { name: 'md-folder', component: <MdFolder /> },
      { name: 'md-settings', component: <MdSettings /> },
      { name: 'md-build', component: <MdBuild /> },
      { name: 'md-delete', component: <MdDelete /> },
      { name: 'md-download', component: <MdDownload /> },
      { name: 'md-upload', component: <MdUpload /> },
      { name: 'md-arrow_back', component: <MdArrowBack /> },
      { name: 'md-arrow_forward', component: <MdArrowForward /> },
      { name: 'md-arrow_upward', component: <MdArrowUpward /> },
      { name: 'md-arrow_downward', component: <MdArrowDownward /> },
      { name: 'md-chevron_left', component: <MdChevronLeft /> },
      { name: 'md-chevron_right', component: <MdChevronRight /> },
      { name: 'md-keyboard_arrow_up', component: <MdKeyboardArrowUp /> },
      { name: 'md-keyboard_arrow_down', component: <MdKeyboardArrowDown /> },
      { name: 'md-add', component: <MdAdd /> },
      { name: 'md-remove', component: <MdRemove /> },
      { name: 'md-close', component: <MdClose /> },
      { name: 'md-check', component: <MdCheck /> }
    ]
  };

  const handleIconSelect = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
  };

  const handleCustomIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const renderIconPreview = (icon: string, size: number = 20) => {
    return <UnifiedIcon icon={icon} size={size} className="text-gray-600" />;
  };

  const resolvedLabel = label || 'Icon';
  const resolvedPlaceholder = placeholder || 'Enter icon class name (e.g., fa-home, home)';

  return (
    <div className="relative space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {resolvedLabel}
      </label>
      <div className="flex gap-2">
        <div className="flex-1">
          <InputWithIcon
            value={value || ''}
            onChange={handleCustomIconChange}
            placeholder={resolvedPlaceholder}
            leftIcon={value ? renderIconPreview(value, 20) : undefined}
            className={cn('w-full h-11', !value && 'pl-3')}
            iconSpacing="compact"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 h-11"
        >
          {value ? 'Change' : 'Browse'}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange('')}
            className="px-3 h-11 text-red-500 hover:text-red-600 hover:bg-red-50"
            title="Remove icon"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <h4 className="font-medium text-gray-900">Select an Icon</h4>
            <p className="text-sm text-gray-500 mt-1">
              Choose from common icons or enter a custom icon class
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {Object.entries(iconSets).map(([setName, icons]) => (
              <div key={setName} className="border-b last:border-b-0">
                <div className="px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700">
                  {setName}
                </div>
                <div className="p-2">
                  <div className="grid grid-cols-6 gap-2">
                    {icons.map((iconItem) => (
                      <button
                        key={iconItem.name}
                        type="button"
                        onClick={() => handleIconSelect(iconItem.name)}
                        className={cn(
                          'p-2 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors',
                          'flex flex-col items-center justify-center h-12',
                          value === iconItem.name && 'bg-blue-100 border-blue-400'
                        )}
                        title={iconItem.name}
                      >
                        <div className="mb-1">
                          <UnifiedIcon icon={iconItem.name} size={16} />
                        </div>
                        <span className="truncate w-full text-xs">
                          {iconItem.name.replace(/^(fa-|md-|material-)/, '')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t bg-gray-50">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
