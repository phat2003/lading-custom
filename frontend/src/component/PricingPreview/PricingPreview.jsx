export default function PricingPreview() {
  return (
    <section id="pricing" className="px-8 py-16 text-center">
      <h3 className="mb-8 text-3xl font-semibold">Choose your plan</h3>
      <div className="grid max-w-4xl gap-8 mx-auto md:grid-cols-2">
        <div className="p-6 border rounded-lg shadow-sm">
          <h4 className="mb-2 font-bold">Free Plan</h4>
          <p className="mb-4">Basic templates, PDF export, watermark</p>
          <p className="text-xl font-bold">$0</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h4 className="mb-2 font-bold">Pro Plan</h4>
          <p className="mb-4">Premium templates, HTML/CSS export, no watermark</p>
          <p className="text-xl font-bold">$9.99/mo</p>
          <button className="px-6 py-3 mt-4 text-white bg-blue-600 rounded-lg">Upgrade to Pro</button>
        </div>
      </div>
    </section>
  )
}
