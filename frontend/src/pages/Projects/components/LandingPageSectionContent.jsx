import {
  ImageIcon,
  LayoutTemplateIcon,
} from '../../../components/icons'

const LandingPageSectionContent = ({ section }) => {
  if (section.type === 'image') {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed border-current/20">
        <ImageIcon size={44} className="opacity-35" />
        <h2 className="mt-4 text-xl font-semibold">{section.title}</h2>
        <p className="mt-2 opacity-60">{section.text}</p>
      </div>
    )
  }

  if (section.type === 'columns') {
    const [leftText, rightText] = section.text.split('|')

    return (
      <div>
        <h2 className="text-2xl font-bold md:text-3xl">{section.title}</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[leftText, rightText].map((text, index) => (
            <div
              key={`${text}-${index}`}
              className="min-w-0 rounded-lg border border-current/10 bg-white/30 p-5 md:p-7"
            >
              <p className="text-lg font-semibold">Cột {index + 1}</p>
              <p className="mt-3 opacity-70">
                {text || `Nội dung cột ${index + 1}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (section.type === 'heading') {
    return <h2 className="text-3xl font-bold md:text-4xl">{section.title}</h2>
  }

  if (section.type === 'text') {
    return <p className="text-lg leading-8 opacity-75">{section.text}</p>
  }

  if (section.type === 'hero') {
    return (
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb]">
          <LayoutTemplateIcon size={30} />
        </div>
        <h1 className="mt-7 text-3xl font-bold md:text-4xl">{section.title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 opacity-70">
          {section.text}
        </p>
        {section.buttonText && (
          <button
            type="button"
            className="mt-8 rounded-lg bg-[#2563eb] px-8 py-3 font-bold text-white shadow-[0_8px_25px_rgba(37,99,235,0.25)]"
          >
            {section.buttonText}
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {section.title && <h2 className="text-3xl font-bold">{section.title}</h2>}
      {section.text && (
        <p className="mt-4 text-lg leading-8 opacity-70">{section.text}</p>
      )}
      {section.buttonText && (
        <button
          type="button"
          className="mt-7 rounded-lg bg-[#2563eb] px-7 py-3 font-bold text-white"
        >
          {section.buttonText}
        </button>
      )}
    </div>
  )
}

export default LandingPageSectionContent
