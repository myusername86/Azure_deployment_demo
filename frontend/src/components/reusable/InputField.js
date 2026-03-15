import React from 'react';
import { TextField } from '@mui/material';

/**
 
 * @param {string} label - Label for the input field
 * @param {string} name - Name attribute for the input
 * @param {string} type - Input type (text, password, email, etc.)
 * @param {string} value - Current value of the input
 * @param {function} onChange - Change handler function
 * @param {boolean} error - Whether the field has an error
 * @param {string} helperText - Helper or error text to display
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether the field is required
 * @param {boolean} fullWidth - Whether the field should take full width
 * @param {string} autoComplete - Autocomplete attribute
 * @param {boolean} autoFocus - Whether to autofocus this field
 */
const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error = false,
  helperText = '',
  placeholder = '',
  required = false,
  fullWidth = true,
  autoComplete = 'off',
  autoFocus = false,
  ...otherProps
}) => {
  return (
    <TextField
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      required={required}
      fullWidth={fullWidth}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      margin="normal"
      variant="outlined"
      {...otherProps}
    />
  );
};

export default InputField;
