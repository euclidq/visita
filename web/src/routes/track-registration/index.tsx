import { createFileRoute } from '@tanstack/react-router'
import TrackRegistration from '../../modules/track-registration/TrackRegistration'

export const Route = createFileRoute('/track-registration/')({
  component: TrackRegistration,
})