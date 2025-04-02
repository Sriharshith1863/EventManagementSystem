import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'

function Layout() {
  return (
    <div className="w-full h-screen flex flex-col justify-between">
        <Header />
        <Outlet />
        <footer className="bottom-0 p-4 text-center">
            Website footer
        </footer>
    </div>
  )
}

export default Layout