import React from 'react';
import { Link } from 'react-router-dom';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { SubMenuItem } from '../../../../domains/navigation/types/MenuItem';
import { StyledListItemButton, MenuBadge } from '../styles/SidebarStyles';

interface SidebarSubMenuItemProps {
  subItem: SubMenuItem;
  isActive: boolean;
  collapsed: boolean;
  subIndex: number;
}

const SidebarSubMenuItem: React.FC<SidebarSubMenuItemProps> = ({
  subItem,
  isActive,
  collapsed,
  subIndex,
}) => {
  const renderIcon = () => {
    if (subItem.badge) {
      return (
        <MenuBadge badgeContent={subItem.badge} color="error">
          {subItem.icon}
        </MenuBadge>
      );
    }
    return subItem.icon;
  };

  if (collapsed) {
    return (
      <Tooltip
        title={subItem.label}
        placement="right"
        arrow
      >
        <Link
          to={subItem.path}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <StyledListItemButton
            selected={isActive}
            sx={{
              justifyContent: 'center',
              minHeight: 36,
              mt: subIndex === 0 ? 0 : 0.5,
              mx: 1,
              px: 0.5,
              position: 'relative',
              borderRadius: '6px',
              border: theme => `1px solid ${
                isActive
                  ? 'transparent'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.08)'
              }`,
              backgroundColor: theme =>
                isActive
                  ? undefined
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(0, 0, 0, 0.02)',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '20%',
                bottom: '20%',
                width: '2px',
                backgroundColor: isActive
                  ? 'primary.main'
                  : theme => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(0, 0, 0, 0.15)',
                borderRadius: '0 1px 1px 0',
                opacity: isActive ? 1 : 0.6,
              },
              '&:hover': {
                backgroundColor: theme =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)',
                '&::before': {
                  opacity: 1,
                }
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                width: '100%',
                color: isActive
                  ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
                  : 'text.secondary',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.1rem',
                  opacity: isActive ? 1 : 0.8,
                },
              }}
            >
              {renderIcon()}
            </ListItemIcon>
          </StyledListItemButton>
        </Link>
      </Tooltip>
    );
  }

  return (
    <Link 
      to={subItem.path} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <StyledListItemButton
        selected={isActive}
        sx={{
          pl: 6,
          py: 0.75,
          minHeight: 38,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: 2,
            justifyContent: 'center',
            color: isActive
              ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
              : 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          {renderIcon()}
        </ListItemIcon>
        <ListItemText 
          primary={subItem.label} 
          primaryTypographyProps={{ 
            fontSize: 13,
            fontWeight: isActive ? 'medium' : 'normal',
          }}
          sx={{
            color: isActive
              ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
              : 'text.primary',
          }}
        />
      </StyledListItemButton>
    </Link>
  );
};

export default SidebarSubMenuItem;