export default function PricingPreview({ onChoosePlan }) {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      features: ["Basic templates", "Drag & drop editor", "Community support"],
    },
    {
      name: "Pro",
      price: "$19/mo",
      features: ["All templates", "Advanced analytics", "Priority support"],
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: ["Unlimited projects", "Dedicated manager", "Custom integrations"],
    },
  ]

  return (
    <section id="pricing" className="py-16 bg-gray-50">
      <h2 className="mb-10 text-3xl font-bold text-center">Choose the plan that fits you</h2>
      <div className="grid grid-cols-1 gap-8 px-8 md:grid-cols-3">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className="p-8 transition transform bg-white border rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1"
          >
            <h3 className="mb-2 text-2xl font-semibold">{plan.name}</h3>
            <p className="mb-4 text-xl text-blue-600">{plan.price}</p>
            <ul className="mb-6 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="text-gray-700">✔ {f}</li>
              ))}
            </ul>
            <button
              onClick={onChoosePlan}
              className="w-full px-6 py-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
