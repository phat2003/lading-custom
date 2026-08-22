import {
  CTA_LINK_TYPE_SECTION,
  getSectionLinkTargetId,
} from '../ctaLinks'
import { getSectionTypeName } from '../sectionManagement'

const labelCls =
  'mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]'
const inputCls =
  'w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm text-[var(--bd-text)] transition-all duration-200 focus:border-violet-400/60 focus:bg-violet-500/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50'

const CtaLinkControls = ({
  button,
  sections,
  sectionDisplayNames,
  onUpdate,
  onNavigate,
}) => {
  const linkType = button.link?.type || ''
  const targetSectionId = getSectionLinkTargetId(button)
  const targetSection = sections.find((section) => section.id === targetSectionId)
  const targetMissing = Boolean(targetSectionId && !targetSection)

  const changeLinkType = (nextType) => {
    if (nextType === linkType) return
    onUpdate(
      button.id,
      nextType === CTA_LINK_TYPE_SECTION
        ? { link: { type: CTA_LINK_TYPE_SECTION } }
        : { link: undefined },
    )
  }

  const changeTarget = (nextTargetSectionId) => {
    if (nextTargetSectionId === targetSectionId) return
    onUpdate(button.id, {
      link: nextTargetSectionId
        ? {
            type: CTA_LINK_TYPE_SECTION,
            targetSectionId: nextTargetSectionId,
          }
        : { type: CTA_LINK_TYPE_SECTION },
    })
  }

  return (
    <section className="animate-fade-in-up rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/[0.09] to-cyan-400/[0.04] p-3">
      <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--bd-accent)]">
        <span className="h-2.5 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
        Liên kết CTA
      </h3>

      <div className="space-y-3">
        <div>
          <label className={labelCls} htmlFor={`cta-link-type-${button.id}`}>
            Loại liên kết
          </label>
          <select
            id={`cta-link-type-${button.id}`}
            value={linkType === CTA_LINK_TYPE_SECTION ? linkType : ''}
            onChange={(event) => changeLinkType(event.target.value)}
            className={inputCls}
          >
            <option value="" className="bg-[var(--bd-panel-solid)]">Không liên kết</option>
            <option value={CTA_LINK_TYPE_SECTION} className="bg-[var(--bd-panel-solid)]">
              Section trong trang
            </option>
          </select>
        </div>

        {linkType === CTA_LINK_TYPE_SECTION && (
          <div>
            <label className={labelCls} htmlFor={`cta-section-target-${button.id}`}>
              Section đích
            </label>
            <select
              id={`cta-section-target-${button.id}`}
              value={targetSectionId}
              onChange={(event) => changeTarget(event.target.value)}
              disabled={sections.length === 0}
              className={inputCls}
            >
              <option value="" className="bg-[var(--bd-panel-solid)]">
                {sections.length ? 'Chọn Section đích' : 'Chưa có Section để liên kết'}
              </option>
              {targetMissing && (
                <option value={targetSectionId} className="bg-[var(--bd-panel-solid)]">
                  Section đích không còn tồn tại
                </option>
              )}
              {sections.map((section) => (
                <option
                  key={section.id}
                  value={section.id}
                  className="bg-[var(--bd-panel-solid)]"
                >
                  {sectionDisplayNames.get(section.id)} — {getSectionTypeName(section.sectionType)}
                </option>
              ))}
            </select>
            {targetMissing && (
              <p className="mt-2 text-xs leading-relaxed text-amber-300">
                Section đích không còn tồn tại. Chọn Section khác hoặc xóa liên kết.
              </p>
            )}
          </div>
        )}

        {linkType === CTA_LINK_TYPE_SECTION && (
          <button
            type="button"
            disabled={!targetSection}
            onClick={() => onNavigate(targetSectionId)}
            className="w-full rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-[var(--bd-accent)] transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-violet-500/10"
          >
            Kiểm tra liên kết
          </button>
        )}
      </div>
    </section>
  )
}

export default CtaLinkControls
