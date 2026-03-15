import React from 'react';
import { Button } from '@mui/material';

/**
 * Reusable PrimaryButton component
 * @param {string} text - Button text
 * @param {function} onClick - Click handler function
 * @param {string} type - Button type (button, submit, reset)
 * @param {boolean} fullWidth - Whether the button should take full width
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} variant - Button variant (contained, outlined, text)
 * @param {string} color - Button color
 * @param {node} startIcon - Icon to display at the start of the button
 * @param {node} endIcon - Icon to display at the end of the button
 */
const PrimaryButton = ({
  text,
  onClick,
  type = 'button',
  fullWidth = false,
  disabled = false,
  variant = 'contained',
  color = 'primary',
  startIcon = null,
  endIcon = null,
  ...otherProps
}) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      fullWidth={fullWidth}
      disabled={disabled}
      variant={variant}
      color={color}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        mt: 3,
        mb: 2,
        py: 1.5,
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 600,
      }}
      {...otherProps}
    >
      {text}
    </Button>
  );
};

export default PrimaryButton;
