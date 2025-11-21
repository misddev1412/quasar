import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface UserInfoProps {
  collapsed?: boolean;
}

const UserInfoContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'collapsed'
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  marginTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(5px)',
  width: '100%',
  boxSizing: 'border-box',
  padding: theme.spacing(1.5, collapsed ? 1.5 : 2),
  display: 'flex',
  justifyContent: 'center',
}));


const CollapsedLogoutButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  width: 36,
  height: 36,
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300]}`,
}));

const UserInfo: React.FC<UserInfoProps> = ({ collapsed = false }) => {
  const { logout } = useAuth();
  const { t } = useTranslationWithBackend();

  const handleLogout = () => {
    logout();
  };

  return (
    <UserInfoContainer collapsed={collapsed}>
      {collapsed ? (
        <Tooltip title={t('userInfo.logout', 'Logout')} placement="right">
          <CollapsedLogoutButton onClick={handleLogout} size="small">
            <LogoutIcon fontSize="small" />
          </CollapsedLogoutButton>
        </Tooltip>
      ) : (
        <div
          onClick={handleLogout}
          style={{
            width: '100%',
            fontSize: '16px',
            fontWeight: 600,
            color: '#ef4444',
            textAlign: 'center',
            padding: '8px 0',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          {t('userInfo.logout', 'Logout')}
        </div>
      )}
    </UserInfoContainer>
  );
};

export default UserInfo;
