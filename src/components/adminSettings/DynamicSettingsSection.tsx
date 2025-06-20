'use client'

import { Card, CardContent, Typography, IconButton, Collapse, CircularProgress } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CustomTextField from '@/@core/components/mui/TextField'

interface InputField {
  label?: string
  defaultValue?: string
  readOnly?: boolean
  render?: () => JSX.Element
  onChange?: (value: string) => void
}

interface DynamicSettingsSectionProps {
  title: string
  fields: InputField[]
  isExpanded: boolean
  onToggle: () => void
  isLoading?: boolean
}

const DynamicSettingsSection: React.FC<DynamicSettingsSectionProps> = ({ 
  title, 
  fields, 
  isExpanded,
  onToggle,
  isLoading 
}) => {
  return (
    <Card className='p-5 mb-5'>
      <div className='flex justify-between items-center'>
        <Typography 
          variant="h5" 
          onClick={onToggle} 
          style={{ cursor: 'pointer' }}
        >
          {title}
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          <IconButton onClick={onToggle}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </div>
      </div>
      <Collapse in={isExpanded}>
        <CardContent className={`flex ${title === 'Logo Settings' ? 'flex-row justify-between' : 'flex-col gap-4'}`}>
          {fields.map((field, index) => (
            <div key={index} className="w-full">
              {field.render ? (
                <>
                  {field.label && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {field.label}
                    </Typography>
                  )}
                  {field.render()}
                </>
              ) : (
                <CustomTextField
                  label={field.label}
                  defaultValue={field.defaultValue}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                  InputProps={{
                    readOnly: field.readOnly,
                  }}
                  onChange={(e) => field.onChange?.(e.target.value)}
                  disabled={isLoading || field.readOnly}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default DynamicSettingsSection
