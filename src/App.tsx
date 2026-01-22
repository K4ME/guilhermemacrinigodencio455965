import { useState } from 'react'

const App = () => {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount((count) => count + 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-gray-100">
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="p-8 bg-gray-800 dark:bg-white rounded-lg shadow-lg">
          <h1 className="text-5xl font-bold mb-8 text-white dark:text-gray-900">
            React + TypeScript + Vite
          </h1>
          <button
            onClick={handleClick}
            className="rounded-lg border border-transparent px-5 py-3 text-base font-medium bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900 cursor-pointer transition-all duration-250 hover:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Contador é {count}
          </button>
          <p className="mt-6 text-gray-300 dark:text-gray-700">
            Edite <code className="bg-gray-700 dark:bg-gray-100 px-2 py-1 rounded text-sm">src/App.tsx</code> e salve para testar o HMR
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
