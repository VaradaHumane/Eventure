import Spinner from './Spinner'

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-stone-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}