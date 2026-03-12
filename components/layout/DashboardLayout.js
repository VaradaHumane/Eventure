import Navbar from './Navbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="pt-16 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}