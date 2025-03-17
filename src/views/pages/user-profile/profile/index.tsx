// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { ProfileTabType } from '@/types/pages/profileTypes'

// Component Imports
import AboutOverview from './AboutOverview'

// Removed unused component imports
// import ActivityTimeline from './ActivityTimeline'
// import ConnectionsTeams from './ConnectionsTeams'
// import ProjectsTable from './ProjectsTables'

const ProfileTab = ({ data }: { data?: ProfileTabType }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AboutOverview data={data} />
      </Grid>

      {/* Removed other components that are not part of the API response */}
    </Grid>
  )
}

export default ProfileTab
