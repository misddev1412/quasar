import { styled, alpha } from '@mui/material/styles';
import {
  Drawer,
  ListItemButton,
  Badge,
  Typography,
  IconButton,
  InputBase,
  MenuItem
} from '@mui/material';
import { Z_INDEX } from '../../../../utils/zIndex';

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 250,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: 250,
    zIndex: Z_INDEX.SIDEBAR, // Lower than main content and modals
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
    overflowX: 'hidden',
  },
}));

export const StyledMiniDrawer = styled(Drawer)(({ theme }) => ({
  width: 70,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: 70,
    zIndex: Z_INDEX.SIDEBAR, // Lower than main content and modals
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
    overflowX: 'hidden',
  },
}));

export const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 0,
  margin: 0,
  width: '100%',
  transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color'], {
    duration: theme.transitions.duration.short,
  }),
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'dark'
      ? `rgba(59, 130, 246, 0.15)`
      : `rgba(59, 130, 246, 0.1)`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 0 0 1px rgba(59, 130, 246, 0.3)'
      : '0 0 0 1px rgba(59, 130, 246, 0.2)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? `rgba(59, 130, 246, 0.2)`
        : `rgba(59, 130, 246, 0.15)`,
      boxShadow: theme.palette.mode === 'dark'
        ? '0 0 0 1px rgba(59, 130, 246, 0.4)'
        : '0 0 0 1px rgba(59, 130, 246, 0.3)',
    },
    color: theme.palette.mode === 'dark'
      ? theme.palette.common.white
      : theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.04)',
  }
}));

export const MenuBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -2,
    top: 4,
    border: `1.5px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontWeight: '600',
    fontSize: '0.65rem',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 2px 4px rgba(0, 0, 0, 0.3)'
      : '0 2px 4px rgba(0, 0, 0, 0.15)',
  },
}));

export const GroupTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  padding: theme.spacing(1.5, 3),
  color: theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[600],
}));

export const ThemeToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 70,
  right: theme.spacing(1),
  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
  width: 36,
  height: 36,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  },
}));

export const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.08 : 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.12 : 0.25),
  },
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  width: '90%',
}));

export const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  minHeight: '36px',
  position: 'absolute',
  left: 0,
  top: 0,
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  zIndex: 1,
  color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600],
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem !important',
    display: 'block !important',
    color: 'inherit !important',
    width: '1.25rem',
    height: '1.25rem',
  },
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.875rem',
  },
}));

export const SearchResultItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1.5),
    fontSize: '1.25rem',
    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
  }
}));

export const SearchResultGroup = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  padding: theme.spacing(0.75, 2),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  color: theme.palette.text.secondary,
}));
