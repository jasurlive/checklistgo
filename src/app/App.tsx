import { BrowserRouter, Route, Routes } from 'react-router'
import '../css/reset.css'
import '../css/theme.css'
import '../css/page.css'
import Layout from '../components/Layout'
import Checklist from '../pages/Checklist'
import Shopping from '../pages/Shopping'
import Habits from '../pages/Habits'
import Notes from '../pages/Notes'
import Settings from '../pages/Settings'
import NotFound from '../pages/NotFound'

// add a page: create it in pages, add a <Route> here and an item in Menu.tsx
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Checklist />} />
          <Route path="shopping" element={<Shopping />} />
          <Route path="habits" element={<Habits />} />
          {/* one splat route for list + editor, so Notes doesn't remount between them */}
          <Route path="notes/*" element={<Notes />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
