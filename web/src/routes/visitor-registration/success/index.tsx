import { createFileRoute } from '@tanstack/react-router'
import SuccessPage from '../../../modules/visitor-registration/SuccessPage'

export const Route = createFileRoute('/visitor-registration/success/')({
  component: SuccessPage,
})
