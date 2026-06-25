export default function HeroSection({ onGetStarted, onWatchDemo }) {
  return (
    <section className="py-20 text-center bg-gray-50">
      <h2 className="mb-4 text-4xl font-bold">
        Build high-converting landing pages in minutes
      </h2>
      <p className="mb-6 text-lg">
        No code required. Drag-and-drop editor, optimized templates, built-in analytics.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onGetStarted}
          className="px-6 py-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Get Started - It’s Free
        </button>
        <button
          onClick={onWatchDemo}
          className="px-6 py-3 transition border border-gray-400 rounded-lg hover:bg-gray-100"
        >
          Watch Demo
        </button>
      </div>
    </section>
  )
}
