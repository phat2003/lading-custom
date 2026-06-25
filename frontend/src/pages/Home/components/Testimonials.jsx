export default function Testimonials() {
  // Placeholder testimonials — sau này thay bằng data thật 
  const testimonials = [
    { name: "User 1", role: "Role 1", feedback: "Feedback placeholder..." },
    { name: "User 2", role: "Role 2", feedback: "Feedback placeholder..." },
    { name: "User 3", role: "Role 3", feedback: "Feedback placeholder..." },
  ]

  return (
    <section id="review" className="py-16 bg-gray-50">
      <h2 className="mb-10 text-3xl font-bold text-center">What our users say</h2>
      <div className="grid grid-cols-1 gap-8 px-8 md:grid-cols-3">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="p-6 transition transform bg-white border rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1"
          >
            <p className="mb-4 italic text-gray-700">"{t.feedback}"</p>
            <p className="font-semibold">{t.name}</p>
            <p className="text-gray-500">{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
