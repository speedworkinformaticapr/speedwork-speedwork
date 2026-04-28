import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1B7D3A] to-[#0052CC]">
      <div className="w-full max-w-[400px] animate-fade-in-up">
        <Outlet />
      </div>
    </div>
  )
}
