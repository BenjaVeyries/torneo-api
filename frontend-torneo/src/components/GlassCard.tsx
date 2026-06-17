// src/components/GlassCard.tsx
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';

// Glassmorphism styled container
const GlassBox = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(12px) saturate(180%)',
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
  padding: theme.spacing(2),
  color: theme.palette.text.primary,
}));

type GlassCardProps = {
  title?: string;
  children: React.ReactNode;
};

export const GlassCard: React.FC<GlassCardProps> = ({ title, children }) => (
  <GlassBox elevation={0}>
    {title && (
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
    )}
    <Box>{children}</Box>
  </GlassBox>
);

export default GlassCard;
