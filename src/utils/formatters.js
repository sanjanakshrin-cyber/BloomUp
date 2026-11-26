export function formatCurrency(amount, currency = 'INR') {
  const value = Number(amount) || 0
  if (currency === 'INR') {
    return `₹${value.toLocaleString('en-IN')}`
  }
  return `${currency} ${value.toLocaleString()}`
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Flexible'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return 'Flexible'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function calculateProfileCompletion(profile, skillsCount = 0) {
  if (!profile) return 0
  const checks = [
    Boolean(profile.full_name?.trim()),
    Boolean(profile.location?.trim()),
    Boolean(profile.college?.trim()),
    Boolean(profile.course?.trim()),
    Boolean(profile.academic_year?.trim()),
    skillsCount > 0,
    (profile.preferred_gig_categories?.length || 0) > 0,
    (profile.preferred_volunteering_categories?.length || 0) > 0,
    Boolean(profile.career_goals?.trim()),
  ]
  const done = checks.filter(Boolean).length
  return Math.round((done / checks.length) * 100)
}
