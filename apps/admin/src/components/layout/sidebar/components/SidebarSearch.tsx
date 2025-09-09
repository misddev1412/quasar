import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Tooltip,
  IconButton,
  Paper,
  Popper,
  MenuList,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { SearchService } from '../../../../domains/search/services/SearchService';
import { ISearchService } from '../../../../domains/search/interfaces/ISearchService';
import { MenuGroup } from '../../../../domains/navigation/types/MenuItem';
import { SearchResult } from '../../../../domains/search/types/SearchResult';
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
  SearchResultItem,
  SearchResultGroup,
} from '../styles/SidebarStyles';

interface SidebarSearchProps {
  menuGroups: MenuGroup[];
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const SidebarSearch: React.FC<SidebarSearchProps> = ({
  menuGroups,
  collapsed,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const searchService: ISearchService = new SearchService();
  
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    const results = searchService.performSearch(value, menuGroups);
    setSearchResults(results);
  };
  
  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setSearchValue('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };
  
  const handleSearchFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsSearchFocused(true);
    setSearchAnchorEl(event.currentTarget.parentElement || null);
  };
  
  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const handleCollapsedSearchClick = () => {
    onToggleSidebar();
    setTimeout(() => {
      const searchInput = document.querySelector('input[aria-label="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 300);
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      if (searchValue.trim().length > 0) {
        return (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">没有匹配的结果</Typography>
          </Box>
        );
      }
      return null;
    }

    const groupedResults = searchService.groupSearchResults(searchResults);

    return (
      <MenuList>
        {Object.entries(groupedResults).map(([group, items], index) => (
          <React.Fragment key={index}>
            <SearchResultGroup>{group}</SearchResultGroup>
            {items.map((result, idx) => (
              <SearchResultItem 
                key={idx} 
                onClick={() => handleSearchResultClick(result.path)}
              >
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  {result.icon}
                  <Typography sx={{ ml: 1.5, fontSize: '0.875rem' }}>
                    {result.label}
                  </Typography>
                </Box>
                <KeyboardArrowRightIcon fontSize="small" color="action" />
              </SearchResultItem>
            ))}
          </React.Fragment>
        ))}
      </MenuList>
    );
  };

  if (collapsed) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
        <Tooltip title="搜索" placement="right">
          <IconButton
            onClick={handleCollapsedSearchClick}
            sx={{
              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              color: theme => theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700],
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              },
            }}
            size="small"
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <>
      <Search>
        <SearchIconWrapper>
          <SearchIcon fontSize="small" color="action" />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="搜索…"
          inputProps={{ 'aria-label': 'search' }}
          value={searchValue}
          onChange={handleSearch}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
      </Search>
      <Popper
        open={isSearchFocused && searchResults.length > 0}
        anchorEl={searchAnchorEl}
        placement="bottom-start"
        style={{ width: searchAnchorEl?.offsetWidth, zIndex: 1300 }}
      >
        <Paper elevation={3} sx={{ mt: 0.5, maxHeight: 320, overflow: 'auto' }}>
          {renderSearchResults()}
        </Paper>
      </Popper>
    </>
  );
};

export default SidebarSearch;