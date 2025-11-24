import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { NotificationsProvider } from './context/NotificationsProvider'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import UserProfile from './pages/UserProfile'
import AdminDashboard from './pages/AdminDashboard'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Erbs from './pages/Erbs'
import Projects from './pages/Projects'
import ProjectKanban from './pages/ProjectKanban'
import Layout from './components/Layout'

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              <Route path="admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

              {/* ERP Modules */}
              <Route path="clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
              <Route path="erbs" element={<PrivateRoute><Erbs /></PrivateRoute>} />
              <Route path="projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
              <Route path="projects/:id" element={<PrivateRoute><ProjectKanban /></PrivateRoute>} />
            </Route>
          </Routes>
        </NotificationsProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
