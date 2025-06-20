// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import LogoSettings from '../../../../components/adminSettings/LogoSettings'

const AdminSettingsLeft = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <LogoSettings />
      </Grid>
    </Grid>
  )
}

export default AdminSettingsLeft
