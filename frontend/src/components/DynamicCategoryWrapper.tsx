import React from 'react';
import { useLocation } from 'react-router-dom';
import SubCategoryPage from './SubCategoryPage';
import { Box, Typography } from '@mui/material';

const DynamicCategoryWrapper: React.FC = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  // If the path is exactly /categories, this component shouldn't render (CategoriesPage should),
  // but if it somehow does, we can handle it or return null.
  if (pathParts.length < 2) {
    return <Box sx={{p: 4}}><Typography>Invalid category path</Typography></Box>;
  }

  // The last part of the path is the current category's slug
  const slug = pathParts[pathParts.length - 1];
  
  // The back URL is the current path minus the last slug
  const backUrlParts = pathParts.slice(0, -1);
  const backUrl = '/' + backUrlParts.join('/');
  
  return <SubCategoryPage key={slug} slug={slug} backUrl={backUrl} />;
};

export default DynamicCategoryWrapper;
