import React from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import UserProfile from './pages/UserProfile'
import AdminDashboard from './pages/AdminDashboard'
import Header from './components/Header'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Erbs from './pages/Erbs'
import Projects from './pages/Projects'

function Layout(): JSX.Element {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App(): JSX.Element {
  return (
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
      </Route>
    </Routes>
  )
}
