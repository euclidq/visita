import { Outlet, createRootRoute } from '@tanstack/react-router'
import Footer from '../shared/components/Footer'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="flex flex-col">
      <main className="flex min-h-screen flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
