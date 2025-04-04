// import React from 'react'
// import { Outlet } from 'react-router-dom'
// import Header from './components/Header'

// function Layout() {
//   return (
//     <div className="w-full h-screen flex flex-col justify-between">
//         <Header />
//         <Outlet />
//         <footer className="bottom-0 p-4 text-center">
//             Website footer
//         </footer>
//     </div>
//   )
// }

// export default Layout

import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'

function Layout() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-gray-900 text-gray-200">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <footer className="bottom-0 p-4 text-center bg-gray-800 text-gray-400 border-t border-gray-700">
            Website footer
        </footer>
    </div>
  )
}

export default Layout