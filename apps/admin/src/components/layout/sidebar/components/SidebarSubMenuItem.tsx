import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Collapse,
  List,
  ListItem,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { MenuItem } from '../../../../domains/navigation/types/MenuItem';
import { StyledListItemButton, MenuBadge } from '../styles/SidebarStyles';

interface SidebarSubMenuItemProps {
  subItem: MenuItem;
  isActive: boolean;
  collapsed: boolean;
  subIndex: number;
  level?: number;
  expandedNodes?: Set<string>;
  onToggleSubMenu?: (itemId: string) => void;
  onSubItemActiveCheck?: (path: string) => boolean;
  onRegisterRef?: (path: string, element: HTMLElement | null) => void;
}

const SidebarSubMenuItem: React.FC<SidebarSubMenuItemProps> = ({
  subItem,
  isActive,
  collapsed,
  subIndex,
  level = 1,
  expandedNodes = new Set(),
  onToggleSubMenu,
  onSubItemActiveCheck,
  onRegisterRef,
}) => {
  const hasSubItems = subItem.subItems && subItem.subItems.length > 0;
  const isExpanded = expandedNodes.has(subItem.path);
  const subMenuItemRef = useRef<HTMLLIElement>(null);

  // Register ref when sub-item is active
  useEffect(() => {
    if (isActive && subMenuItemRef.current && onRegisterRef) {
      onRegisterRef(subItem.path, subMenuItemRef.current);
    } else if (!isActive && onRegisterRef) {
      onRegisterRef(subItem.path, null);
    }
  }, [isActive, subItem.path, onRegisterRef]);
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

  const renderSubItemsRecursive = () => {
    if (!hasSubItems || collapsed) return null;

    return (
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ p: 0, m: 0 }}>
          {subItem.subItems!.map((childItem, childIndex) => (
            <SidebarSubMenuItem
              key={childIndex}
              subItem={childItem}
              isActive={onSubItemActiveCheck?.(childItem.path) || false}
              collapsed={collapsed}
              subIndex={childIndex}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggleSubMenu={onToggleSubMenu}
              onSubItemActiveCheck={onSubItemActiveCheck}
              onRegisterRef={onRegisterRef}
            />
          ))}
        </List>
      </Collapse>
    );
  };

  if (collapsed) {
    const buttonContent = (
      <StyledListItemButton
        onClick={hasSubItems ? () => onToggleSubMenu?.(subItem.path) : undefined}
        selected={isActive}
        sx={{
          justifyContent: 'center',
          minHeight: 48,
          mt: subIndex === 0 ? 0 : 0.5,
          mx: 0,
          px: 1,
          position: 'relative',
          width: '100%',
          borderRadius: '6px',
          border: theme => `1px solid ${isActive
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
    );

    const linkContent = hasSubItems ? (
      buttonContent
    ) : (
      <Link
        to={subItem.path}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
      >
        {buttonContent}
      </Link>
    );

    return (
      <Box ref={subMenuItemRef} data-menu-path={subItem.path}>
        <Tooltip
          title={subItem.label}
          placement="right"
          arrow
        >
          {linkContent}
        </Tooltip>
      </Box>
    );
  }

  const tooltipTitle = subItem.label;

  const buttonContent = (
    <StyledListItemButton
      onClick={hasSubItems ? () => onToggleSubMenu?.(subItem.path) : undefined}
      selected={isActive}
      sx={{
        pl: 2.5 + (level * 2), // Match parent horizontal padding with additional indent per level
        pr: 2.5,
        py: 0.75,
        minHeight: 48,
        width: '100%',
        mx: 0,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: 3,
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
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
        }}
        sx={{
          color: isActive
            ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
            : 'text.primary',
          minWidth: 0,
          flex: 1,
          '& span': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block'
          }
        }}
      />
      {hasSubItems && (isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />)}
    </StyledListItemButton>
  );

  const linkContent = hasSubItems ? (
    buttonContent
  ) : (
    <Link
      to={subItem.path}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
    >
      {buttonContent}
    </Link>
  );

  return (
    <>
      <ListItem
        ref={subMenuItemRef}
        data-menu-path={subItem.path}
        disablePadding
        sx={{ width: '100%', p: 0, m: 0 }}
      >
        <Tooltip title={tooltipTitle} placement="top" arrow>
          {linkContent}
        </Tooltip>
      </ListItem>
      {renderSubItemsRecursive()}
    </>
  );
};

export default SidebarSubMenuItem;
