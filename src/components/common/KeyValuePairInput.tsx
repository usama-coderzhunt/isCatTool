import React, { useState } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Button,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    useTheme,
    ToggleButtonGroup,
    ToggleButton,
    Switch,
    Autocomplete
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type ValueType = 'string' | 'number' | 'boolean';

interface KeyValuePair {
    key: string;
    value: string | number | boolean;
    type: ValueType;
}

interface KeyValuePairInputProps {
    pairs: KeyValuePair[];
    onChange: (pairs: KeyValuePair[]) => void;
    disabled?: boolean;
    showTypeSelector?: boolean;
    availableKeys?: string[];
    label?: string;
}

const KeyValuePairInput: React.FC<KeyValuePairInputProps> = ({
    pairs,
    onChange,
    disabled = false,
    showTypeSelector = false,
    availableKeys = [],
    label
}) => {
    const { t } = useTranslation('global');
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState<string>('');
    const [selectedType, setSelectedType] = useState<ValueType>('string');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const theme = useTheme();

    // Get currently used keys
    const usedKeys = pairs.map(pair => pair.key);

    // Filter available keys to show only unused ones, except when editing
    const filteredAvailableKeys = availableKeys.filter(key =>
        editingIndex !== null
            ? key === pairs[editingIndex]?.key || !usedKeys.includes(key)
            : !usedKeys.includes(key)
    );

    const handleAdd = () => {
        if (newKey.trim() && (newValue.trim() || selectedType === 'boolean')) {
            let processedValue: string | number | boolean = newValue;

            // Process value based on type
            if (selectedType === 'number') {
                processedValue = Number(newValue);
            } else if (selectedType === 'boolean') {
                processedValue = newValue === 'true';
            }

            if (editingIndex !== null) {
                // Update existing pair
                const updatedPairs = [...pairs];
                updatedPairs[editingIndex] = {
                    key: newKey.trim(),
                    value: processedValue,
                    type: selectedType
                };
                onChange(updatedPairs);
                setEditingIndex(null);
            } else {
                // Add new pair
                const updatedPairs = [...pairs, {
                    key: newKey.trim(),
                    value: processedValue,
                    type: selectedType
                }];
                onChange(updatedPairs);
            }

            setNewKey('');
            setNewValue('');
            setSelectedType('string');
        }
    };

    const handleEdit = (index: number) => {
        const pair = pairs[index];
        setNewKey(pair.key);
        setNewValue(String(pair.value));
        setSelectedType(pair.type);
        setEditingIndex(index);
    };

    const handleCancel = () => {
        setNewKey('');
        setNewValue('');
        setSelectedType('string');
        setEditingIndex(null);
    };

    const handleRemove = (index: number) => {
        const updatedPairs = pairs.filter((_, i) => i !== index);
        onChange(updatedPairs);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newKey.trim() && (newValue.trim() || selectedType === 'boolean')) {
            handleAdd();
        }
    };

    const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: ValueType) => {
        if (newType !== null) {
            setSelectedType(newType);
            setNewValue(newType === 'boolean' ? 'false' : ''); // Reset value when type changes
        }
    };

    const renderValueInput = () => {
        switch (selectedType) {
            case 'number':
                return (
                    <TextField
                        label={t('keyValuePair.value')}
                        value={newValue}
                        className='rounded-[6px]'
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="small"
                        type="number"
                        disabled={disabled}
                        InputLabelProps={{ shrink: true }}
                    />
                );
            case 'boolean':
                return (
                    <Box className='flex items-center gap-1'>
                        <Typography variant="h6" className='text-base font-medium leading-5'>{newValue === 'true' ? t('common.yes') : t('common.no')}</Typography>
                        <Switch
                            checked={newValue === 'true'}
                            onChange={(e) => setNewValue(e.target.checked ? 'true' : 'false')}
                            disabled={disabled}
                        />
                    </Box>
                );
            default:
                return (
                    <TextField
                        label={t('keyValuePair.value')}
                        value={newValue}
                        className='rounded-[6px]'
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="small"
                        disabled={disabled}
                        InputLabelProps={{ shrink: true }}
                    />
                );
        }
    };

    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 2,
                    borderColor: theme.palette.grey[300],
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        mb: 3,
                        fontWeight: 600,
                        color: theme.palette.primary.main
                    }}
                >
                    {/* {editingIndex !== null ? t('keyValuePair.editValue') : t('keyValuePair.addValue')} */}
                    {label}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 3,
                        alignItems: 'flex-start',
                        ...(showTypeSelector ? {
                            flexDirection: 'column',
                            '& > *': { width: '100%' }
                        } : {
                            '& .MuiTextField-root': { flex: 1 }
                        })
                    }}
                >
                    {availableKeys.length > 0 ? (
                        <Autocomplete
                            value={newKey}
                            onChange={(_, newValue) => setNewKey(newValue || '')}
                            options={filteredAvailableKeys}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t('keyValuePair.key')}
                                    size="small"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            )}
                            disabled={disabled}
                            fullWidth
                            disableClearable
                            noOptionsText={
                                editingIndex !== null
                                    ? filteredAvailableKeys.length === 0
                                        ? t('keyValuePair.noOtherKeys')
                                        : t('keyValuePair.noMatchingKeys')
                                    : filteredAvailableKeys.length === 0
                                        ? t('keyValuePair.allKeysUsed')
                                        : t('keyValuePair.noMatchingKeys')
                            }
                        />
                    ) : (
                        <TextField
                            label={t('keyValuePair.key')}
                            value={newKey}
                            className='rounded-[6px]'
                            onChange={(e) => setNewKey(e.target.value)}
                            onKeyPress={handleKeyPress}
                            size="small"
                            disabled={disabled}
                            InputLabelProps={{ shrink: true }}
                            fullWidth={showTypeSelector}
                        />
                    )}

                    {renderValueInput()}

                    {showTypeSelector && (
                        <>
                            <ToggleButtonGroup
                                value={selectedType}
                                exclusive
                                onChange={handleTypeChange}
                                aria-label="value type"
                                size="small"
                                disabled={disabled}
                                sx={{
                                    '& .MuiToggleButton-root': {
                                        flex: 1,
                                        px: 3
                                    }
                                }}
                            >
                                <ToggleButton value="string" aria-label="string type">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <i className="tabler-abc" />
                                        <span>{t('keyValuePair.text')}</span>
                                    </Box>
                                </ToggleButton>
                                <ToggleButton value="number" aria-label="number type">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <i className="tabler-numbers" />
                                        <span>{t('keyValuePair.number')}</span>
                                    </Box>
                                </ToggleButton>
                                <ToggleButton value="boolean" aria-label="boolean type">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <i className="tabler-toggle-right" />
                                        <span>{t('keyValuePair.yesNo')}</span>
                                    </Box>
                                </ToggleButton>
                            </ToggleButtonGroup>

                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
                                {editingIndex !== null && (
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                        disabled={disabled}
                                        sx={{ minWidth: 100 }}
                                    >
                                        {t('keyValuePair.cancel')}
                                    </Button>
                                )}
                                <Button
                                    variant="contained"
                                    onClick={handleAdd}
                                    disabled={!newKey.trim() || (!newValue.trim() && selectedType !== 'boolean') || disabled}
                                    sx={{ minWidth: 100 }}
                                >
                                    {editingIndex !== null ? t('keyValuePair.update') : t('keyValuePair.add')}
                                </Button>
                            </Box>
                        </>
                    )}

                    {!showTypeSelector && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {editingIndex !== null && (
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                    disabled={disabled}
                                    sx={{ minWidth: 100 }}
                                >
                                    {t('keyValuePair.cancel')}
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={handleAdd}
                                disabled={!newKey.trim() || (!newValue.trim() && selectedType !== 'boolean') || disabled}
                                sx={{ minWidth: 100 }}
                            >
                                {editingIndex !== null ? t('keyValuePair.update') : t('keyValuePair.add')}
                            </Button>
                        </Box>
                    )}
                </Box>

                <List sx={{ p: 0 }}>
                    {pairs.map((pair, index) => (
                        <ListItem
                            key={index}
                            divider={index !== pairs.length - 1}
                            sx={{
                                py: 2,
                                px: 2,
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: theme.palette.grey[50]
                                }
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontWeight: 600,
                                                color: theme.palette.text.primary
                                            }}
                                        >
                                            {pair.key}:
                                        </Typography>
                                        <Typography
                                            component="span"
                                            sx={{
                                                color: theme.palette.text.secondary
                                            }}
                                        >
                                            {String(pair.value)}
                                        </Typography>
                                        {showTypeSelector && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: theme.palette.text.disabled,
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                ({pair.type})
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                            {!disabled && (
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleEdit(index)}
                                        sx={{
                                            color: theme.palette.primary.main,
                                            mr: 1,
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.light,
                                                color: theme.palette.primary.dark
                                            }
                                        }}
                                    >
                                        <i className="tabler-edit" style={{ fontSize: '1.2rem' }} />
                                    </IconButton>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleRemove(index)}
                                        sx={{
                                            color: theme.palette.error.main,
                                            '&:hover': {
                                                backgroundColor: theme.palette.error.light,
                                                color: theme.palette.error.dark
                                            }
                                        }}
                                    >
                                        <i className="tabler-trash" style={{ fontSize: '1.2rem' }} />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default KeyValuePairInput; 
