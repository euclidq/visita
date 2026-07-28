import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { ConfigProvider } from 'antd'

import './index.css'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      token: {
        fontFamily: '"Google Sans", Arial, sans-serif',
      },
    }}
  >
    <RouterProvider router={router} />
  </ConfigProvider>,
)
