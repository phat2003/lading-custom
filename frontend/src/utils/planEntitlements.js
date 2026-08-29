export const PLAN_TYPES = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
})

export const FREE_PROJECT_LIMIT = 1
export const FREE_PROJECT_LIMIT_REASON =
  'Gói Free hỗ trợ tối đa 1 Project. Nâng cấp Pro để tạo không giới hạn Project.'
export const PROJECT_LIMIT_ERROR_CODE = 'FREE_PROJECT_LIMIT_REACHED'
export const PROJECT_COUNT_UNAVAILABLE_ERROR_CODE = 'PROJECT_COUNT_UNAVAILABLE'

const readPlanValue = (userOrPlan) => {
  if (typeof userOrPlan === 'string') return userOrPlan
  if (!userOrPlan || typeof userOrPlan !== 'object') return ''
  return userOrPlan.plan_type || userOrPlan.planType || userOrPlan.plan || ''
}

// Giá trị lạ luôn rơi về Free để UI không vô tình mở quyền trả phí.
export const normalizePlan = (userOrPlan) =>
  String(readPlanValue(userOrPlan)).trim().toLowerCase() === PLAN_TYPES.PRO
    ? PLAN_TYPES.PRO
    : PLAN_TYPES.FREE

export const isFreePlan = (userOrPlan) => normalizePlan(userOrPlan) === PLAN_TYPES.FREE

export const isProPlan = (userOrPlan) => normalizePlan(userOrPlan) === PLAN_TYPES.PRO

export const getProjectLimit = (userOrPlan) =>
  isProPlan(userOrPlan) ? Number.POSITIVE_INFINITY : FREE_PROJECT_LIMIT

export const canCreateProject = (userOrPlan, projectCount) => {
  const limit = getProjectLimit(userOrPlan)
  if (!Number.isFinite(limit)) return true
  return Number.isInteger(projectCount) && projectCount >= 0
    ? projectCount < limit
    : false
}

export const createProjectLimitError = () =>
  Object.assign(new Error(FREE_PROJECT_LIMIT_REASON), {
    code: PROJECT_LIMIT_ERROR_CODE,
  })

export const createProjectCountUnavailableError = () =>
  Object.assign(
    new Error(
      'Chưa thể xác định số Project hiện tại. Vui lòng tải lại danh sách và thử lại.',
    ),
    { code: PROJECT_COUNT_UNAVAILABLE_ERROR_CODE },
  )

export const isProjectLimitError = (error) =>
  error?.code === PROJECT_LIMIT_ERROR_CODE

export const isProjectQuotaResponse = (error) => {
  const status = error?.response?.status
  if (![402, 403, 409].includes(status)) return false

  const message = String(
    error?.response?.data?.error || error?.response?.data?.message || '',
  ).toLowerCase()
  const mentionsProject = message.includes('project') || message.includes('dự án')
  const mentionsEntitlement = [
    'giới hạn',
    'quota',
    'plan',
    'gói',
    'nâng cấp',
    'upgrade',
  ].some((term) => message.includes(term))

  return mentionsProject && mentionsEntitlement
}

export const getPlanEntitlements = (userOrPlan) => {
  const pro = isProPlan(userOrPlan)
  return Object.freeze({
    plan: pro ? PLAN_TYPES.PRO : PLAN_TYPES.FREE,
    canUsePremiumTemplates: pro,
    canExportPdf: true,
    canExportHtml: pro,
    canEditSeo: pro,
    hasCustomBranding: pro,
    hasWatermark: !pro,
  })
}

export const canUsePremiumTemplates = (userOrPlan) =>
  getPlanEntitlements(userOrPlan).canUsePremiumTemplates

export const canExportPdf = (userOrPlan) => getPlanEntitlements(userOrPlan).canExportPdf

export const canExportHtml = (userOrPlan) => getPlanEntitlements(userOrPlan).canExportHtml

export const canEditSeo = (userOrPlan) => getPlanEntitlements(userOrPlan).canEditSeo

export const hasCustomBranding = (userOrPlan) =>
  getPlanEntitlements(userOrPlan).hasCustomBranding

export const hasWatermark = (userOrPlan) => getPlanEntitlements(userOrPlan).hasWatermark
