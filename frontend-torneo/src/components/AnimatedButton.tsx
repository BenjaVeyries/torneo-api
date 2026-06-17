// src/components/AnimatedButton.tsx
import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { motion } from 'framer-motion';

// Framer Motion variants for subtle micro‑animation
const hover = {
  scale: 1.05,
  transition: { duration: 0.2 },
};
const tap = {
  scale: 0.95,
  transition: { duration: 0.1 },
};

type AnimatedButtonProps = ButtonProps & {
  /** optional icon component */
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, startIcon, endIcon, ...rest }) => (
  <motion.div whileHover={hover} whileTap={tap} style={{ display: 'inline-block' }}>
    <Button startIcon={startIcon} endIcon={endIcon} {...rest}>
      {children}
    </Button>
  </motion.div>
);

export default AnimatedButton;
