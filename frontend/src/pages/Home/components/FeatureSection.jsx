export default function FeatureSection() {
  const features = [
    {
      title: "Drag & Drop Editing",
      description: "Build pages visually, no code required.",
      icon: "🖱️",
    },
    {
      title: "Realtime Preview",
      description: "See updates instantly across devices.",
      icon: "⚡",
    },
    {
      title: "Optimized Templates",
      description: "High-converting designs ready to use.",
      icon: "📑",
    },
    {
      title: "Built-in Analytics",
      description: "Track performance and conversions easily.",
      icon: "📊",
    },
  ]

  return (
    <section id="features" className="py-16 bg-white">
      <h2 className="mb-10 text-3xl font-bold text-center">Everything you need to design, iterate and ship</h2>
      <div className="grid grid-cols-1 gap-8 px-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="p-6 transition transform border rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1"
          >
            <div className="mb-4 text-4xl">{f.icon}</div>
            <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
            <p className="text-gray-600">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
