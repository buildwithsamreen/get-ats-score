import {Routes, Route, Navigate} from 'react-router-dom'
import {useAuth} from './auth/AuthContext'
import PrivateRoute from './auth/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Builder from './pages/Builder'

export default function AppRoutes() {
  const {user, loading} = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <Routes>
      <Route path='/login' element={user ? <Navigate to='/home' replace /> : <Login />} />
      <Route
        path='/register'
        element={user ? <Navigate to='/home' replace /> : <Register />}
      />

      <Route
        path='/'
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path='/builder/:id'
        element={
          <PrivateRoute>
            <Builder />
          </PrivateRoute>
        }
      />

      <Route path='*' element={<Navigate to={user ? '/home' : '/login'} replace />} />
    </Routes>
  )
}
