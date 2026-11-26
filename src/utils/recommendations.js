/**
 * Modular Rule-Based Recommendation Engine (AI-Ready Architecture)
 *
 * For the MVP, opportunities are ranked deterministically using:
 *  1. Overlap between opportunity.required_skills and studentSkills
 *  2. Match with profile.preferred_gig_categories / preferred_volunteering_categories
 *  3. Alignment with profile.learning_interests
 *
 * Each recommendation includes a transparent `reason` string explaining why it matched.
 * A future AI provider can replace or augment `scoreOpportunity` without changing callers.
 */

export function scoreOpportunity(opportunity, profile, studentSkills = []) {
  const reasons = []
  let score = 0

  const studentSkillNames = new Set(
    studentSkills.map((s) => s.skill_name.toLowerCase())
  )

  const matchedSkills = (opportunity.required_skills || []).filter((req) =>
    studentSkillNames.has(req.toLowerCase())
  )

  if (matchedSkills.length > 0) {
    score += matchedSkills.length * 30
    reasons.push(`Matches your skill${matchedSkills.length > 1 ? 's' : ''}: ${matchedSkills.join(', ')}`)
  }

  const preferredCategories =
    opportunity.type === 'earn'
      ? profile?.preferred_gig_categories || []
      : profile?.preferred_volunteering_categories || []

  if (
    preferredCategories.some(
      (cat) => cat.toLowerCase() === (opportunity.category || '').toLowerCase()
    )
  ) {
    score += 25
    reasons.push(`Matches your preferred ${opportunity.category} interest`)
  }

  const interests = profile?.learning_interests || []
  const interestHit = interests.find((item) =>
    `${opportunity.title} ${opportunity.description} ${opportunity.category}`
      .toLowerCase()
      .includes(item.toLowerCase())
  )
  if (interestHit) {
    score += 15
    reasons.push(`Aligns with your learning interest in ${interestHit}`)
  }

  if (reasons.length === 0) {
    reasons.push(
      opportunity.type === 'earn'
        ? 'Great starter micro-gig to build verified experience'
        : 'High-impact community opportunity open for student volunteers'
    )
  }

  return {
    ...opportunity,
    matchScore: score,
    matchReason: reasons[0],
  }
}

export function getRecommendedOpportunities(opportunities = [], profile, studentSkills = [], limit = 4) {
  return opportunities
    .map((opp) => scoreOpportunity(opp, profile, studentSkills))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}
