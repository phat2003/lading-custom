export default function HeroSection() {
  return (
    <section className="py-16 text-center bg-gray-50">
      <h2 className="mb-4 text-4xl font-bold">
        Build high-converting landing pages in minutes — no code required
      </h2>
      <p className="mb-6 text-lg text-gray-600">
        Landing Page Builder gives marketers, freelancers and agencies a simple drag-and-drop interface...
      </p>
      <div className="flex justify-center gap-4 mb-8">
        <button className="px-6 py-3 text-white bg-blue-600 rounded-lg">Get Started: It’s Free</button>
        <button className="px-6 py-3 border border-gray-400 rounded-lg">Watch Demo</button>
      </div>
      <div className="flex justify-center gap-8 text-gray-700">
        <span>86k+ Active users</span>
        <span>420k+ Created projects</span>
        <span>16k+ Projects created</span>
      </div>
    </section>
  )
}
