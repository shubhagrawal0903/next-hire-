export default function TestTheme() {
  return (
    <div className="min-h-screen p-8 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Theme Toggle Test
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          This page demonstrates the theme toggle functionality. Click the theme toggle button in the header to switch between light and dark modes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Light Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Clean and bright design for daytime use
            </p>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Dark Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Easy on the eyes for nighttime browsing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
