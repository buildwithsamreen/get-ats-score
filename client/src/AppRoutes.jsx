import {Routes, Route, Navigate, useParams} from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Resumes from './pages/Resumes'
import Builder from './pages/Builder'
import Letters from './pages/Letters'
import LetterEditor from './pages/LetterEditor'
import {Privacy, Terms, Contact} from './pages/InfoPages'
import {GuideList, Guide} from './pages/Guides'

// Remount editors when switching documents so their state resets.
function BuilderRoute() {
  const {id} = useParams()
  return <Builder key={id} />
}

function LetterRoute() {
  const {id} = useParams()
  return <LetterEditor key={id} />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/resumes' element={<Resumes />} />
        <Route path='/builder/:id' element={<BuilderRoute />} />
        <Route path='/letters' element={<Letters />} />
        <Route path='/letters/:id' element={<LetterRoute />} />
        <Route path='/guides' element={<GuideList />} />
        <Route path='/guides/:slug' element={<Guide />} />
        <Route path='/privacy' element={<Privacy />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  )
}
