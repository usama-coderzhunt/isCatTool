'use client'

// React Imports
import { useState } from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

interface Action {
  type: string;
  payload?: any; // Adjust the type as needed
}

const UserRight = ({ action }: { action: Action }) => {
  const [selectedSetting, setSelectedSetting] = useState<string>(''); // State for selected setting

  const handleSettingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedSetting(event.target.value as string);
  };

  // Dummy data for dropdown
  const settingsOptions = [
    { value: 'general', label: 'General Settings' },
    { value: 'logo', label: 'Logo Settings' },
    { value: 'finance', label: 'Finance Settings' },
    { value: 'apiTokens', label: 'API Tokens' },
    { value: 'socialTracking', label: 'Social Tracking' },
    { value: 'socialLinks', label: 'Social Links' },
    { value: 'header', label: 'Header Settings' },
    { value: 'footer', label: 'Footer Settings' },
    { value: 'seo', label: 'SEO Settings' },
  ];

  return (
    <>
      <h2>Admin Settings</h2>
      <FormControl fullWidth>
        <InputLabel id="settings-select-label">Select Setting</InputLabel>
        <Select
          labelId="settings-select-label"
          value={selectedSetting}
          onChange={()=>{}}
        >
          {settingsOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Render selected setting */}
      <div>
        <h3>Selected Setting: {selectedSetting}</h3>
      </div>
    </>
  );
};

export default UserRight;
