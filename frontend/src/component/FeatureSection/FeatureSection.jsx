export default function FeaturesSection() {
  return (
    <section id="features" className="px-8 py-16">
      <h3 className="mb-8 text-3xl font-semibold text-center">
        Everything you need to design, iterate and ship
      </h3>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg shadow-sm">
          <h4 className="mb-2 font-bold">🖱️ Drag & Drop Editing</h4>
          <p>Build pages visually with no code.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h4 className="mb-2 font-bold">⚡ Realtime Preview</h4>
          <p>See updates instantly across devices.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h4 className="mb-2 font-bold">📱 Responsive Design</h4>
          <p>Preview across desktop, tablet, and mobile.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h4 className="mb-2 font-bold">💾 Export Options</h4>
          <p>Download ready-to-deploy HTML/CSS/JS.</p>
        </div>
      </div>
    </section>
  )
}
