// src/App.tsx
// 應用程式根元件
// 以 RouterProvider 包裹整個應用，啟用 React Router v6 功能

import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {
  return <RouterProvider router={router} />
}

export default App
