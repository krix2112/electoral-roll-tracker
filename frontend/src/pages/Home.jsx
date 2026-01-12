import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Electoral Roll Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track and visualize changes in electoral rolls to prevent fraud
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/upload"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Upload Roll
            </Link>
            <Link
              to="/compare"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition"
            >
              Compare Rolls
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
