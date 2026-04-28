import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export default function Layout() {
  return (
    <main className="flex flex-col min-h-screen selection:bg-primary selection:text-white">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </main>
  )
}
