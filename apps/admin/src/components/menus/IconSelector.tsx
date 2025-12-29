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
  FiChevronRight, FiChevronUp, FiChevronDown, FiPlus, FiMinus, FiX, FiCheck,
  FiMenu, FiGrid, FiList, FiTag, FiShoppingBag, FiGift, FiPackage,
  FiTruck, FiCreditCard, FiDollarSign, FiPercent, FiAward, FiTrendingUp,
  FiBarChart2, FiPieChart, FiActivity, FiUsers, FiUserPlus, FiUserCheck,
  FiLock, FiUnlock, FiEye, FiEyeOff, FiEdit, FiEdit2, FiEdit3,
  FiSave, FiRefreshCw, FiRotateCw, FiShare2, FiCopy, FiClipboard,
  FiLink, FiExternalLink, FiImage, FiVideo, FiMusic, FiHeadphones,
  FiMic, FiVolume2, FiVolumeX, FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiSun, FiMoon, FiCloud, FiCloudRain, FiZap, FiWifi, FiWifiOff,
  FiMonitor, FiSmartphone, FiTablet, FiWatch, FiPrinter, FiServer,
  FiDatabase, FiHardDrive, FiCpu, FiCode, FiTerminal, FiGitBranch,
  FiGithub, FiGitlab, FiTwitter, FiFacebook, FiInstagram, FiLinkedin,
  FiYoutube, FiSlack, FiTrello, FiChrome, FiLayers, FiFilter,
  FiAlertCircle, FiAlertTriangle, FiInfo, FiHelpCircle, FiCheckCircle,
  FiXCircle, FiSlash, FiCornerUpLeft, FiCornerUpRight, FiMaximize,
  FiMinimize, FiSidebar, FiLayout, FiColumns, FiSquare, FiCircle
} from 'react-icons/fi';

import {
  FaHome, FaUser, FaShoppingBag, FaSearch, FaHeart, FaStar,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendar, FaClock,
  FaCamera, FaBell, FaBookmark, FaComments, FaFile, FaFolder,
  FaCog, FaWrench, FaTrash, FaDownload, FaUpload, FaArrowLeft,
  FaArrowRight, FaArrowUp, FaArrowDown, FaChevronLeft,
  FaChevronRight, FaChevronUp, FaChevronDown, FaPlus, FaMinus,
  FaTimes, FaCheck, FaBars, FaEllipsisV, FaEllipsisH, FaTh,
  FaThLarge, FaThList, FaTags, FaGift, FaBox, FaTruck,
  FaCreditCard, FaDollarSign, FaPercentage, FaAward, FaChartLine,
  FaChartBar, FaChartPie, FaChartArea, FaUsers, FaUserPlus, FaUserCheck,
  FaLock, FaLockOpen, FaEye, FaEyeSlash, FaEdit, FaPen, FaPencilAlt,
  FaSave, FaSyncAlt, FaRedo, FaShare, FaCopy, FaClipboard,
  FaLink, FaExternalLinkAlt, FaImage, FaVideo, FaMusic, FaHeadphones,
  FaMicrophone, FaVolumeUp, FaVolumeMute, FaPlay, FaPause, FaStepBackward, FaStepForward,
  FaSun, FaMoon, FaCloud, FaCloudRain, FaBolt, FaWifi, FaSignal,
  FaDesktop, FaMobileAlt, FaTabletAlt, FaPrint, FaServer,
  FaDatabase, FaHdd, FaMicrochip, FaCode, FaTerminal, FaCodeBranch,
  FaGithub, FaGitlab, FaTwitter, FaFacebook, FaInstagram, FaLinkedin,
  FaYoutube, FaSlack, FaTrello, FaChrome, FaLayerGroup, FaFilter,
  FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaQuestionCircle, FaCheckCircle,
  FaTimesCircle, FaBan, FaUndo, FaExpand, FaCompress,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaBold, FaItalic,
  FaUnderline, FaStrikethrough, FaListUl, FaListOl, FaQuoteRight, FaParagraph
} from 'react-icons/fa';

import {
  MdHome, MdPerson, MdShoppingCart, MdSearch, MdFavorite, MdStar, MdPhone, MdEmail,
  MdLocationOn, MdCalendarToday, MdAccessTime, MdCameraAlt, MdNotifications,
  MdBookmark, MdChat, MdDescription, MdFolder, MdSettings, MdBuild, MdDelete,
  MdDownload, MdUpload, MdArrowBack, MdArrowForward, MdArrowUpward, MdArrowDownward,
  MdChevronLeft, MdChevronRight, MdKeyboardArrowUp, MdKeyboardArrowDown,
  MdAdd, MdRemove, MdClose, MdCheck, MdMenu, MdMoreVert, MdMoreHoriz,
  MdApps, MdViewModule, MdViewList, MdLabel, MdCardGiftcard, MdInventory,
  MdLocalShipping, MdPayment, MdAttachMoney, MdDiscount, MdEmojiEvents, MdTrendingUp,
  MdBarChart, MdPieChart, MdShowChart, MdPeople, MdPersonAdd, MdVerifiedUser,
  MdLock, MdLockOpen, MdVisibility, MdVisibilityOff, MdEdit, MdCreate, MdDraw,
  MdSave, MdRefresh, MdLoop, MdShare, MdContentCopy, MdContentPaste,
  MdLink, MdOpenInNew, MdImage, MdVideocam, MdMusicNote, MdHeadset,
  MdMic, MdVolumeUp, MdVolumeOff, MdPlayArrow, MdPause, MdSkipPrevious, MdSkipNext,
  MdWbSunny, MdNightlight, MdCloud, MdCloudQueue, MdFlashOn, MdWifi, MdSignalCellularAlt,
  MdComputer, MdPhoneAndroid, MdTablet, MdPrint, MdStorage,
  MdDns, MdSdStorage, MdMemory, MdCode, MdTerminal, MdAccountTree,
  MdLayers, MdFilterList, MdError, MdWarning, MdInfo, MdHelp, MdCheckCircle,
  MdCancel, MdBlock, MdUndo, MdRedo, MdFullscreen, MdFullscreenExit,
  MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify,
  MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdFormatStrikethrough,
  MdFormatListBulleted, MdFormatListNumbered, MdFormatQuote, MdSubject,
  MdDashboard, MdViewCarousel, MdViewColumn, MdViewDay, MdViewWeek
} from 'react-icons/md';

interface IconSelectorProps {
  value?: string;
  onChange: (icon: string) => void;
  label?: string;
  placeholder?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ value, onChange, label, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Icon mapping to actual components
  const iconMap: Record<string, React.ReactElement> = {
    // Heroicons (Fi) - Navigation & Menu
    'menu': <FiMenu />, 'burger': <FiMenu />, 'home': <FiHome />, 'user': <FiUser />,
    'shopping-cart': <FiShoppingCart />, 'shopping-bag': <FiShoppingBag />, 'search': <FiSearch />,
    'heart': <FiHeart />, 'star': <FiStar />, 'phone': <FiPhone />, 'mail': <FiMail />,
    'map-pin': <FiMapPin />, 'calendar': <FiCalendar />, 'clock': <FiClock />,
    'camera': <FiCamera />, 'bell': <FiBell />, 'bookmark': <FiBookmark />,
    'chat': <FiMessageSquare />, 'document': <FiFile />, 'folder': <FiFolder />,
    'cog': <FiSettings />, 'settings': <FiSettings />, 'wrench': <FiTool />,
    'trash': <FiTrash2 />, 'download': <FiDownload />, 'upload': <FiUpload />,
    'grid': <FiGrid />, 'list': <FiList />, 'tag': <FiTag />, 'gift': <FiGift />,
    'package': <FiPackage />, 'truck': <FiTruck />, 'credit-card': <FiCreditCard />,
    'dollar': <FiDollarSign />, 'percent': <FiPercent />, 'award': <FiAward />,
    'trending-up': <FiTrendingUp />, 'bar-chart': <FiBarChart2 />, 'pie-chart': <FiPieChart />,
    'activity': <FiActivity />, 'users': <FiUsers />, 'user-plus': <FiUserPlus />,
    'user-check': <FiUserCheck />, 'lock': <FiLock />, 'unlock': <FiUnlock />,
    'eye': <FiEye />, 'eye-off': <FiEyeOff />, 'edit': <FiEdit />, 'edit-2': <FiEdit2 />,
    'edit-3': <FiEdit3 />, 'save': <FiSave />, 'refresh': <FiRefreshCw />,
    'rotate': <FiRotateCw />, 'share': <FiShare2 />, 'copy': <FiCopy />,
    'clipboard': <FiClipboard />, 'link': <FiLink />, 'external-link': <FiExternalLink />,
    'image': <FiImage />, 'video': <FiVideo />, 'music': <FiMusic />,
    'headphones': <FiHeadphones />, 'mic': <FiMic />, 'volume': <FiVolume2 />,
    'volume-x': <FiVolumeX />, 'play': <FiPlay />, 'pause': <FiPause />,
    'skip-back': <FiSkipBack />, 'skip-forward': <FiSkipForward />, 'sun': <FiSun />,
    'moon': <FiMoon />, 'cloud': <FiCloud />, 'cloud-rain': <FiCloudRain />,
    'zap': <FiZap />, 'wifi': <FiWifi />, 'wifi-off': <FiWifiOff />,
    'monitor': <FiMonitor />, 'smartphone': <FiSmartphone />, 'tablet': <FiTablet />,
    'watch': <FiWatch />, 'printer': <FiPrinter />, 'server': <FiServer />,
    'database': <FiDatabase />, 'hard-drive': <FiHardDrive />, 'cpu': <FiCpu />,
    'code': <FiCode />, 'terminal': <FiTerminal />, 'git-branch': <FiGitBranch />,
    'github': <FiGithub />, 'gitlab': <FiGitlab />, 'twitter': <FiTwitter />,
    'facebook': <FiFacebook />, 'instagram': <FiInstagram />, 'linkedin': <FiLinkedin />,
    'youtube': <FiYoutube />, 'slack': <FiSlack />, 'trello': <FiTrello />,
    'chrome': <FiChrome />, 'layers': <FiLayers />, 'filter': <FiFilter />,
    'alert-circle': <FiAlertCircle />, 'alert-triangle': <FiAlertTriangle />,
    'info': <FiInfo />, 'help-circle': <FiHelpCircle />, 'check-circle': <FiCheckCircle />,
    'x-circle': <FiXCircle />, 'slash': <FiSlash />, 'sidebar': <FiSidebar />,
    'layout': <FiLayout />, 'columns': <FiColumns />, 'square': <FiSquare />,
    'circle': <FiCircle />, 'maximize': <FiMaximize />, 'minimize': <FiMinimize />,
    'arrow-left': <FiArrowLeft />, 'arrow-right': <FiArrowRight />,
    'arrow-up': <FiArrowUp />, 'arrow-down': <FiArrowDown />,
    'chevron-left': <FiChevronLeft />, 'chevron-right': <FiChevronRight />,
    'chevron-up': <FiChevronUp />, 'chevron-down': <FiChevronDown />,
    'plus': <FiPlus />, 'minus': <FiMinus />, 'x': <FiX />, 'check': <FiCheck />,

    // Font Awesome (Fa)
    'fa-bars': <FaBars />, 'fa-burger': <FaBars />, 'fa-menu': <FaBars />,
    'fa-ellipsis-v': <FaEllipsisV />, 'fa-ellipsis-h': <FaEllipsisH />,
    'fa-th': <FaTh />, 'fa-th-large': <FaThLarge />, 'fa-th-list': <FaThList />,
    'fa-home': <FaHome />, 'fa-user': <FaUser />, 'fa-shopping-bag': <FaShoppingBag />,
    'fa-search': <FaSearch />, 'fa-heart': <FaHeart />, 'fa-star': <FaStar />,
    'fa-phone': <FaPhone />, 'fa-envelope': <FaEnvelope />, 'fa-map-marker-alt': <FaMapMarkerAlt />,
    'fa-calendar': <FaCalendar />, 'fa-clock': <FaClock />, 'fa-camera': <FaCamera />,
    'fa-bell': <FaBell />, 'fa-bookmark': <FaBookmark />, 'fa-comments': <FaComments />,
    'fa-file': <FaFile />, 'fa-folder': <FaFolder />, 'fa-cog': <FaCog />,
    'fa-wrench': <FaWrench />, 'fa-trash': <FaTrash />, 'fa-download': <FaDownload />,
    'fa-upload': <FaUpload />, 'fa-tags': <FaTags />, 'fa-gift': <FaGift />,
    'fa-box': <FaBox />, 'fa-truck': <FaTruck />, 'fa-credit-card': <FaCreditCard />,
    'fa-dollar-sign': <FaDollarSign />, 'fa-percentage': <FaPercentage />,
    'fa-award': <FaAward />, 'fa-chart-line': <FaChartLine />, 'fa-chart-bar': <FaChartBar />,
    'fa-chart-pie': <FaChartPie />, 'fa-chart-area': <FaChartArea />,
    'fa-users': <FaUsers />, 'fa-user-plus': <FaUserPlus />, 'fa-user-check': <FaUserCheck />,
    'fa-lock': <FaLock />, 'fa-lock-open': <FaLockOpen />, 'fa-eye': <FaEye />,
    'fa-eye-slash': <FaEyeSlash />, 'fa-edit': <FaEdit />, 'fa-pen': <FaPen />,
    'fa-pencil-alt': <FaPencilAlt />, 'fa-save': <FaSave />, 'fa-sync-alt': <FaSyncAlt />,
    'fa-redo': <FaRedo />, 'fa-undo': <FaUndo />, 'fa-share': <FaShare />,
    'fa-copy': <FaCopy />, 'fa-clipboard': <FaClipboard />, 'fa-link': <FaLink />,
    'fa-external-link-alt': <FaExternalLinkAlt />, 'fa-image': <FaImage />,
    'fa-video': <FaVideo />, 'fa-music': <FaMusic />, 'fa-headphones': <FaHeadphones />,
    'fa-microphone': <FaMicrophone />, 'fa-volume-up': <FaVolumeUp />,
    'fa-volume-mute': <FaVolumeMute />, 'fa-play': <FaPlay />, 'fa-pause': <FaPause />,
    'fa-step-backward': <FaStepBackward />, 'fa-step-forward': <FaStepForward />,
    'fa-sun': <FaSun />, 'fa-moon': <FaMoon />, 'fa-cloud': <FaCloud />,
    'fa-cloud-rain': <FaCloudRain />, 'fa-bolt': <FaBolt />, 'fa-wifi': <FaWifi />,
    'fa-signal': <FaSignal />, 'fa-desktop': <FaDesktop />, 'fa-mobile-alt': <FaMobileAlt />,
    'fa-tablet-alt': <FaTabletAlt />, 'fa-print': <FaPrint />, 'fa-server': <FaServer />,
    'fa-database': <FaDatabase />, 'fa-hdd': <FaHdd />, 'fa-microchip': <FaMicrochip />,
    'fa-code': <FaCode />, 'fa-terminal': <FaTerminal />, 'fa-code-branch': <FaCodeBranch />,
    'fa-github': <FaGithub />, 'fa-gitlab': <FaGitlab />, 'fa-twitter': <FaTwitter />,
    'fa-facebook': <FaFacebook />, 'fa-instagram': <FaInstagram />,
    'fa-linkedin': <FaLinkedin />, 'fa-youtube': <FaYoutube />, 'fa-slack': <FaSlack />,
    'fa-trello': <FaTrello />, 'fa-chrome': <FaChrome />, 'fa-layer-group': <FaLayerGroup />,
    'fa-filter': <FaFilter />, 'fa-exclamation-circle': <FaExclamationCircle />,
    'fa-exclamation-triangle': <FaExclamationTriangle />, 'fa-info-circle': <FaInfoCircle />,
    'fa-question-circle': <FaQuestionCircle />, 'fa-check-circle': <FaCheckCircle />,
    'fa-times-circle': <FaTimesCircle />, 'fa-ban': <FaBan />, 'fa-expand': <FaExpand />,
    'fa-compress': <FaCompress />, 'fa-align-left': <FaAlignLeft />,
    'fa-align-center': <FaAlignCenter />, 'fa-align-right': <FaAlignRight />,
    'fa-align-justify': <FaAlignJustify />, 'fa-bold': <FaBold />, 'fa-italic': <FaItalic />,
    'fa-underline': <FaUnderline />, 'fa-strikethrough': <FaStrikethrough />,
    'fa-list-ul': <FaListUl />, 'fa-list-ol': <FaListOl />, 'fa-quote-right': <FaQuoteRight />,
    'fa-paragraph': <FaParagraph />, 'fa-arrow-left': <FaArrowLeft />,
    'fa-arrow-right': <FaArrowRight />, 'fa-arrow-up': <FaArrowUp />,
    'fa-arrow-down': <FaArrowDown />, 'fa-chevron-left': <FaChevronLeft />,
    'fa-chevron-right': <FaChevronRight />, 'fa-chevron-up': <FaChevronUp />,
    'fa-chevron-down': <FaChevronDown />, 'fa-plus': <FaPlus />, 'fa-minus': <FaMinus />,
    'fa-times': <FaTimes />, 'fa-check': <FaCheck />,

    // Material Icons (Md)
    'md-menu': <MdMenu />, 'md-burger': <MdMenu />, 'md-more-vert': <MdMoreVert />,
    'md-more-horiz': <MdMoreHoriz />, 'md-apps': <MdApps />, 'md-view-module': <MdViewModule />,
    'md-view-list': <MdViewList />, 'md-dashboard': <MdDashboard />,
    'md-view-carousel': <MdViewCarousel />, 'md-view-column': <MdViewColumn />,
    'md-view-day': <MdViewDay />, 'md-view-week': <MdViewWeek />,
    'md-home': <MdHome />, 'md-person': <MdPerson />, 'md-shopping_cart': <MdShoppingCart />,
    'md-search': <MdSearch />, 'md-favorite': <MdFavorite />, 'md-star': <MdStar />,
    'md-phone': <MdPhone />, 'md-email': <MdEmail />, 'md-location_on': <MdLocationOn />,
    'md-calendar_today': <MdCalendarToday />, 'md-access_time': <MdAccessTime />,
    'md-camera_alt': <MdCameraAlt />, 'md-notifications': <MdNotifications />,
    'md-bookmark': <MdBookmark />, 'md-chat': <MdChat />, 'md-description': <MdDescription />,
    'md-folder': <MdFolder />, 'md-settings': <MdSettings />, 'md-build': <MdBuild />,
    'md-delete': <MdDelete />, 'md-download': <MdDownload />, 'md-upload': <MdUpload />,
    'md-label': <MdLabel />, 'md-card_giftcard': <MdCardGiftcard />,
    'md-inventory': <MdInventory />, 'md-local_shipping': <MdLocalShipping />,
    'md-payment': <MdPayment />, 'md-attach_money': <MdAttachMoney />,
    'md-discount': <MdDiscount />, 'md-emoji_events': <MdEmojiEvents />,
    'md-trending_up': <MdTrendingUp />, 'md-bar_chart': <MdBarChart />,
    'md-pie_chart': <MdPieChart />, 'md-show_chart': <MdShowChart />,
    'md-people': <MdPeople />, 'md-person_add': <MdPersonAdd />,
    'md-verified_user': <MdVerifiedUser />, 'md-lock': <MdLock />,
    'md-lock_open': <MdLockOpen />, 'md-visibility': <MdVisibility />,
    'md-visibility_off': <MdVisibilityOff />, 'md-edit': <MdEdit />,
    'md-create': <MdCreate />, 'md-draw': <MdDraw />, 'md-save': <MdSave />,
    'md-refresh': <MdRefresh />, 'md-loop': <MdLoop />, 'md-share': <MdShare />,
    'md-content_copy': <MdContentCopy />, 'md-content_paste': <MdContentPaste />,
    'md-link': <MdLink />, 'md-open_in_new': <MdOpenInNew />, 'md-image': <MdImage />,
    'md-videocam': <MdVideocam />, 'md-music_note': <MdMusicNote />,
    'md-headset': <MdHeadset />, 'md-mic': <MdMic />, 'md-volume_up': <MdVolumeUp />,
    'md-volume_off': <MdVolumeOff />, 'md-play_arrow': <MdPlayArrow />,
    'md-pause': <MdPause />, 'md-skip_previous': <MdSkipPrevious />,
    'md-skip_next': <MdSkipNext />, 'md-wb_sunny': <MdWbSunny />,
    'md-nightlight': <MdNightlight />, 'md-cloud': <MdCloud />,
    'md-cloud_queue': <MdCloudQueue />, 'md-flash': <MdFlashOn />, 'md-wifi': <MdWifi />,
    'md-signal_cellular_alt': <MdSignalCellularAlt />, 'md-computer': <MdComputer />,
    'md-phone_android': <MdPhoneAndroid />, 'md-tablet': <MdTablet />,
    'md-print': <MdPrint />, 'md-storage': <MdStorage />, 'md-dns': <MdDns />,
    'md-sd_storage': <MdSdStorage />, 'md-memory': <MdMemory />, 'md-code': <MdCode />,
    'md-terminal': <MdTerminal />, 'md-account_tree': <MdAccountTree />,
    'md-layers': <MdLayers />, 'md-filter_list': <MdFilterList />, 'md-error': <MdError />,
    'md-warning': <MdWarning />, 'md-info': <MdInfo />, 'md-help': <MdHelp />,
    'md-check_circle': <MdCheckCircle />, 'md-cancel': <MdCancel />, 'md-block': <MdBlock />,
    'md-undo': <MdUndo />, 'md-redo': <MdRedo />, 'md-fullscreen': <MdFullscreen />,
    'md-fullscreen_exit': <MdFullscreenExit />, 'md-format_align_left': <MdFormatAlignLeft />,
    'md-format_align_center': <MdFormatAlignCenter />,
    'md-format_align_right': <MdFormatAlignRight />,
    'md-format_align_justify': <MdFormatAlignJustify />, 'md-format_bold': <MdFormatBold />,
    'md-format_italic': <MdFormatItalic />, 'md-format_underlined': <MdFormatUnderlined />,
    'md-format_strikethrough': <MdFormatStrikethrough />,
    'md-format_list_bulleted': <MdFormatListBulleted />,
    'md-format_list_numbered': <MdFormatListNumbered />, 'md-format_quote': <MdFormatQuote />,
    'md-subject': <MdSubject />, 'md-arrow_back': <MdArrowBack />,
    'md-arrow_forward': <MdArrowForward />, 'md-arrow_upward': <MdArrowUpward />,
    'md-arrow_downward': <MdArrowDownward />, 'md-chevron_left': <MdChevronLeft />,
    'md-chevron_right': <MdChevronRight />, 'md-keyboard_arrow_up': <MdKeyboardArrowUp />,
    'md-keyboard_arrow_down': <MdKeyboardArrowDown />, 'md-add': <MdAdd />,
    'md-remove': <MdRemove />, 'md-close': <MdClose />, 'md-check': <MdCheck />
  };

  // Icon categories with visual icons - now searchable
  const allIcons = Object.keys(iconMap).map(name => ({
    name,
    component: iconMap[name]
  }));

  // Filter icons based on search query
  const filteredIcons = searchQuery
    ? allIcons.filter(icon =>
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allIcons;

  // Group filtered icons by category
  const groupedIcons: Record<string, typeof allIcons> = {
    'All Icons': filteredIcons
  };

  if (!searchQuery) {
    groupedIcons['Heroicons'] = allIcons.filter(icon =>
      !icon.name.startsWith('fa-') && !icon.name.startsWith('md-')
    );
    groupedIcons['Font Awesome'] = allIcons.filter(icon =>
      icon.name.startsWith('fa-')
    );
    groupedIcons['Material Design'] = allIcons.filter(icon =>
      icon.name.startsWith('md-')
    );
  }

  const handleIconSelect = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
    setSearchQuery(''); // Clear search when selecting
  };

  const handleCustomIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setSearchQuery(''); // Clear search when closing
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
        <div className="absolute z-50 mt-2 w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-4 border-b">
            <h4 className="font-medium text-gray-900 mb-3">Select an Icon</h4>
            <InputWithIcon
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons... (e.g., menu, burger, home)"
              leftIcon={<FiSearch />}
              className="w-full"
              iconSpacing="compact"
            />
            <p className="text-sm text-gray-500 mt-2">
              {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedIcons).map(([setName, icons]) => (
              icons.length > 0 && (
                <div key={setName} className="border-b last:border-b-0">
                  <div className="px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700 sticky top-0">
                    {setName} ({icons.length})
                  </div>
                  <div className="p-2">
                    <div className="grid grid-cols-8 gap-2">
                      {icons.map((iconItem) => (
                        <button
                          key={iconItem.name}
                          type="button"
                          onClick={() => handleIconSelect(iconItem.name)}
                          className={cn(
                            'p-2 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors',
                            'flex flex-col items-center justify-center h-16',
                            value === iconItem.name && 'bg-blue-100 border-blue-400 ring-2 ring-blue-200'
                          )}
                          title={iconItem.name}
                        >
                          <div className="mb-1">
                            <UnifiedIcon icon={iconItem.name} size={20} />
                          </div>
                          <span className="truncate w-full text-xs text-center">
                            {iconItem.name.replace(/^(fa-|md-)/, '')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ))}
            {filteredIcons.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FiSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No icons found matching "{searchQuery}"</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-gray-50">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
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
          onClick={handleCloseModal}
        />
      )}
    </div>
  );
};
