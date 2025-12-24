import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Collapse,
  List,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { MenuItem } from '../../../../domains/navigation/types/MenuItem';
import { StyledListItemButton, MenuBadge } from '../styles/SidebarStyles';
import SidebarSubMenuItem from './SidebarSubMenuItem';

interface SidebarMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  isExpanded: boolean;
  collapsed: boolean;
  badgeContent: number;
  hasActiveSubItem: boolean;
  onToggleSubMenu: () => void;
  onSubItemActiveCheck: (path: string) => boolean;
  expandedNodes?: Set<string>;
  onRegisterRef?: (path: string, element: HTMLElement | null) => void;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  item,
  isActive,
  isExpanded,
  collapsed,
  badgeContent,
  hasActiveSubItem,
  onToggleSubMenu,
  onSubItemActiveCheck,
  expandedNodes = new Set(),
  onRegisterRef,
}) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const shouldHighlightParent = collapsed && hasActiveSubItem;
  const menuItemRef = useRef<HTMLLIElement>(null);

  // Register ref when item is active
  useEffect(() => {
    if (isActive && menuItemRef.current && onRegisterRef) {
      onRegisterRef(item.path, menuItemRef.current);
    } else if (!isActive && onRegisterRef) {
      onRegisterRef(item.path, null);
    }
  }, [isActive, item.path, onRegisterRef]);

  const renderIcon = () => {
    if (badgeContent > 0) {
      return (
        <MenuBadge badgeContent={badgeContent} color="error">
          {item.icon}
        </MenuBadge>
      );
    }
    return item.icon;
  };

  const renderMainButton = () => {
    const buttonContent = (
      <StyledListItemButton
        onClick={hasSubItems && !collapsed ? onToggleSubMenu : undefined}
        selected={isActive || shouldHighlightParent}
        sx={{
          minHeight: 48,
          justifyContent: collapsed ? 'center' : 'initial',
          px: collapsed ? 1 : 2.5,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          ...(collapsed && hasActiveSubItem && {
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '3px',
              backgroundColor: 'primary.main',
              borderRadius: '0 2px 2px 0',
              zIndex: 1,
            }
          })
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: collapsed ? 0 : 3,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            width: collapsed ? '100%' : 'auto',
            color: (isActive || shouldHighlightParent)
              ? theme => theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'
              : 'text.secondary',
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem',
            },
          }}
        >
          {renderIcon()}
        </ListItemIcon>
        {!collapsed && (
          <>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: (isActive || shouldHighlightParent) ? 'medium' : 'normal',
                noWrap: true,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
              }}
              sx={{
                opacity: collapsed ? 0 : 1,
                color: (isActive || shouldHighlightParent)
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
          </>
        )}
      </StyledListItemButton>
    );

    const tooltipTitle = item.label;

    if (hasSubItems) {
      return (
        <Tooltip title={tooltipTitle} placement="right" arrow>
          {buttonContent}
        </Tooltip>
      );
    }

    return (
      <Tooltip title={tooltipTitle} placement="right" arrow>
        <Link
          to={item.path}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
        >
          {buttonContent}
        </Link>
      </Tooltip>
    );
  };

  const renderCollapsedSubItems = () => {
    if (!hasSubItems || !collapsed) return null;

    return (
      <Box
        sx={{
          mt: 0.5,
          mb: 1,
          position: 'relative',
          width: 'calc(100% + 16px)',
          ml: '-8px',
          mr: '-8px',
          px: 1,
        }}
      >
        {item.subItems!.map((subItem, subIndex) => (
          <SidebarSubMenuItem
            key={subIndex}
            subItem={subItem}
            isActive={onSubItemActiveCheck(subItem.path)}
            collapsed={true}
            subIndex={subIndex}
            expandedNodes={expandedNodes}
            onToggleSubMenu={() => { }}
            onSubItemActiveCheck={onSubItemActiveCheck}
            onRegisterRef={onRegisterRef}
          />
        ))}
      </Box>
    );
  };

  const renderExpandedSubItems = () => {
    if (!hasSubItems || collapsed) return null;

    return (
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List
          component="div"
          disablePadding
          sx={{
            width: 'calc(100% + 16px)',
            ml: '-8px',
            mr: '-8px',
            px: 1,
          }}
        >
          {item.subItems!.map((subItem, subIndex) => (
            <SidebarSubMenuItem
              key={subIndex}
              subItem={subItem}
              isActive={onSubItemActiveCheck(subItem.path)}
              collapsed={false}
              subIndex={subIndex}
              expandedNodes={expandedNodes}
              onToggleSubMenu={() => { }}
              onSubItemActiveCheck={onSubItemActiveCheck}
              onRegisterRef={onRegisterRef}
            />
          ))}
        </List>
      </Collapse>
    );
  };

  return (
    <>
      <ListItem
        ref={menuItemRef}
        data-menu-path={item.path}
        disablePadding
        sx={{
          display: 'block',
          mb: hasSubItems && collapsed ? 0.5 : (hasSubItems ? 0 : 0.5)
        }}
      >
        {renderMainButton()}
      </ListItem>

      {renderExpandedSubItems()}
      {renderCollapsedSubItems()}
    </>
  );
};

export default SidebarMenuItem;
