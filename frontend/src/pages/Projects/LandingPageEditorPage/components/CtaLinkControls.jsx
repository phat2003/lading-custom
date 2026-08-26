import {
  CTA_LINK_TYPE_LANDING_PAGE,
  CTA_LINK_TYPE_SECTION,
  createCtaLink,
  getLandingPageLinkTargetId,
  getSectionLinkTargetId,
} from '../ctaLinks'
import { getSectionTypeName } from '../sectionManagement'

const labelCls =
  'mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]'
const inputCls =
  'w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm text-[var(--bd-text)] transition-all duration-200 focus:border-violet-400/60 focus:bg-violet-500/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50'

const landingPageStatusLabel = (status) => {
  if (status === 'published') return 'Published'
  if (status === 'draft') return 'Draft'
  return status || 'Không rõ trạng thái'
}

const CtaLinkControls = ({
  button,
  sections,
  sectionDisplayNames,
  landingPages,
  landingPagesStatus,
  landingPagesError,
  onUpdate,
  onNavigateToSection,
  onNavigateToLandingPage,
  onRetryLandingPages,
}) => {
  const linkType = button.link?.type || ''
  const targetSectionId = getSectionLinkTargetId(button)
  const targetSection = sections.find((section) => section.id === targetSectionId)
  const targetSectionMissing = Boolean(targetSectionId && !targetSection)
  const targetLandingPageId = getLandingPageLinkTargetId(button)
  const targetLandingPage = landingPages.find(
    (landingPage) => landingPage.id === targetLandingPageId,
  )
  const targetLandingPageMissing = Boolean(
    landingPagesStatus === 'ready' &&
      targetLandingPageId &&
      !targetLandingPage,
  )
  const targetLandingPagePending = Boolean(
    landingPagesStatus !== 'ready' && targetLandingPageId,
  )

  const landingPagePlaceholder =
    landingPagesStatus === 'loading'
      ? 'Đang tải Landing Page...'
      : landingPagesStatus === 'error'
        ? 'Không tải được Landing Page'
        : landingPages.length
          ? 'Chọn Landing Page đích'
          : 'Chưa có Landing Page khác trong Project'

  const changeLinkType = (nextType) => {
    if (nextType === linkType) return
    onUpdate(button.id, { link: createCtaLink(nextType) })
  }

  const changeLandingPageTarget = (nextTargetLandingPageId) => {
    if (nextTargetLandingPageId === targetLandingPageId) return
    onUpdate(button.id, {
      link: createCtaLink(
        CTA_LINK_TYPE_LANDING_PAGE,
        nextTargetLandingPageId,
      ),
    })
  }

  const changeTarget = (nextTargetSectionId) => {
    if (nextTargetSectionId === targetSectionId) return
    onUpdate(button.id, {
      link: createCtaLink(CTA_LINK_TYPE_SECTION, nextTargetSectionId),
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
            value={
              [CTA_LINK_TYPE_SECTION, CTA_LINK_TYPE_LANDING_PAGE].includes(linkType)
                ? linkType
                : ''
            }
            onChange={(event) => changeLinkType(event.target.value)}
            className={inputCls}
          >
            <option value="" className="bg-[var(--bd-panel-solid)]">Không liên kết</option>
            <option value={CTA_LINK_TYPE_SECTION} className="bg-[var(--bd-panel-solid)]">
              Section trong trang
            </option>
            <option value={CTA_LINK_TYPE_LANDING_PAGE} className="bg-[var(--bd-panel-solid)]">
              Landing Page khác
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
              {targetSectionMissing && (
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
            {targetSectionMissing && (
              <p className="mt-2 text-xs leading-relaxed text-[var(--bd-warn)]">
                Section đích không còn tồn tại. Chọn Section khác hoặc xóa liên kết.
              </p>
            )}
          </div>
        )}

        {linkType === CTA_LINK_TYPE_SECTION && (
          <button
            type="button"
            disabled={!targetSection}
            onClick={() => onNavigateToSection(targetSectionId)}
            className="w-full rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-[var(--bd-accent)] transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-violet-500/10"
          >
            Kiểm tra liên kết
          </button>
        )}

        {linkType === CTA_LINK_TYPE_LANDING_PAGE && (
          <div>
            <label className={labelCls} htmlFor={`cta-landing-page-target-${button.id}`}>
              Landing Page đích
            </label>
            <select
              id={`cta-landing-page-target-${button.id}`}
              value={targetLandingPageId}
              onChange={(event) => changeLandingPageTarget(event.target.value)}
              disabled={landingPagesStatus !== 'ready' || landingPages.length === 0}
              className={inputCls}
            >
              <option value="" className="bg-[var(--bd-panel-solid)]">
                {landingPagePlaceholder}
              </option>
              {targetLandingPagePending && (
                <option value={targetLandingPageId} className="bg-[var(--bd-panel-solid)]">
                  Đang xác minh Landing Page đích...
                </option>
              )}
              {targetLandingPageMissing && (
                <option value={targetLandingPageId} className="bg-[var(--bd-panel-solid)]">
                  Landing Page đích không còn hợp lệ
                </option>
              )}
              {landingPages.map((landingPage) => (
                <option
                  key={landingPage.id}
                  value={landingPage.id}
                  className="bg-[var(--bd-panel-solid)]"
                >
                  {landingPage.name || 'Landing Page chưa đặt tên'} —{' '}
                  {landingPageStatusLabel(landingPage.status)}
                </option>
              ))}
            </select>

            {landingPagesStatus === 'error' && (
              <div className="mt-2 rounded-lg border border-red-400/20 bg-red-500/[0.06] p-2.5">
                <p className="text-xs leading-relaxed text-[var(--bd-danger)]">
                  {landingPagesError || 'Không tải được danh sách Landing Page.'}
                </p>
                <button
                  type="button"
                  onClick={onRetryLandingPages}
                  className="mt-2 text-xs font-semibold text-[var(--bd-accent)] hover:underline"
                >
                  Thử tải lại
                </button>
              </div>
            )}

            {targetLandingPageMissing && (
              <p className="mt-2 text-xs leading-relaxed text-[var(--bd-warn)]">
                Landing Page đích không còn tồn tại hoặc không thuộc Project hiện tại.
              </p>
            )}
          </div>
        )}

        {linkType === CTA_LINK_TYPE_LANDING_PAGE && targetLandingPage && (
          <>
            <button
              type="button"
              disabled={!targetLandingPage.publicUrl}
              onClick={() => onNavigateToLandingPage(targetLandingPage)}
              className="w-full rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-[var(--bd-accent)] transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-violet-500/10"
            >
              Kiểm tra liên kết
            </button>
            {!targetLandingPage.publicUrl && (
              <p className="text-xs leading-relaxed text-[var(--bd-warn)]">
                {targetLandingPage.status === 'published'
                  ? 'API chưa cung cấp slug công khai hợp lệ cho Landing Page này.'
                  : 'Landing Page đích đang là Draft nên chưa có public link để kiểm tra.'}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default CtaLinkControls
