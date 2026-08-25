export const PLAN_TYPES = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
})

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

export const getPlanEntitlements = (userOrPlan) => {
  const pro = isProPlan(userOrPlan)
  return Object.freeze({
    plan: pro ? PLAN_TYPES.PRO : PLAN_TYPES.FREE,
    canUsePremiumTemplates: pro,
    canExportPdf: true,
    canExportHtml: pro,
    hasCustomBranding: pro,
    hasWatermark: !pro,
  })
}

export const canUsePremiumTemplates = (userOrPlan) =>
  getPlanEntitlements(userOrPlan).canUsePremiumTemplates

export const canExportPdf = (userOrPlan) => getPlanEntitlements(userOrPlan).canExportPdf

export const canExportHtml = (userOrPlan) => getPlanEntitlements(userOrPlan).canExportHtml

export const hasCustomBranding = (userOrPlan) =>
  getPlanEntitlements(userOrPlan).hasCustomBranding

export const hasWatermark = (userOrPlan) => getPlanEntitlements(userOrPlan).hasWatermark
