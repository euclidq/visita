import { createFileRoute } from '@tanstack/react-router'
import VisitorRegistration from '../../modules/visitor-registration/VisitorRegistration'

export const Route = createFileRoute('/visitor-registration/')({
  component: VisitorRegistration,
})
