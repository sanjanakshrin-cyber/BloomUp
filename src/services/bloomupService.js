import { supabase } from '../lib/supabase'

function ensureClient() {
  if (!supabase) throw new Error('Supabase client is not configured.')
  return supabase
}

// ============================================================================
// PROFILES & AVATAR STORAGE
// ============================================================================
export async function updateProfile(userId, updates) {
  const db = ensureClient()
  const { data, error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadAvatar(userId, file) {
  const db = ensureClient()
  const ext = file.name.split('.').pop() || 'png'
  const filePath = `${userId}/avatar-${Date.now()}.${ext}`

  const { error: uploadError } = await db.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })
  if (uploadError) throw uploadError

  const { data } = db.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}

// ============================================================================
// OPPORTUNITIES (EARN & IMPACT)
// ============================================================================
export async function listOpportunities(type = null) {
  const db = ensureClient()
  let query = db
    .from('opportunities')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ============================================================================
// APPLICATIONS
// ============================================================================
export async function listMyApplications(studentId) {
  const db = ensureClient()
  const { data, error } = await db
    .from('applications')
    .select(`
      *,
      opportunity:opportunities(*)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function applyToOpportunity({ studentId, opportunityId, message, opportunityTitle }) {
  const db = ensureClient()
  const { data, error } = await db
    .from('applications')
    .insert({
      student_id: studentId,
      opportunity_id: opportunityId,
      message: message?.trim() || '',
      status: 'pending',
    })
    .select(`*, opportunity:opportunities(*)`)
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already applied to this opportunity.')
    }
    throw error
  }

  await logActivity(studentId, 'application_submitted', `Applied to ${opportunityTitle}`, {
    opportunity_id: opportunityId,
  })

  return data
}

export async function withdrawApplication({ applicationId, studentId, opportunityTitle }) {
  const db = ensureClient()
  const { data, error } = await db
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('id', applicationId)
    .eq('student_id', studentId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw error

  await logActivity(studentId, 'application_withdrawn', `Withdrew application for ${opportunityTitle}`)
  return data
}

// ============================================================================
// SKILLS
// ============================================================================
export async function listSkillsCatalog() {
  const db = ensureClient()
  const { data, error } = await db.from('skills').select('*').order('name')
  if (error) throw error
  return data || []
}

export async function listStudentSkills(studentId) {
  const db = ensureClient()
  const { data, error } = await db
    .from('student_skills')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function upsertStudentSkill({ studentId, skillName, category, proficiency }) {
  const db = ensureClient()
  const { data, error } = await db
    .from('student_skills')
    .upsert(
      {
        student_id: studentId,
        skill_name: skillName.trim(),
        category,
        proficiency,
      },
      { onConflict: 'student_id,skill_name' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStudentSkill(skillId, studentId) {
  const db = ensureClient()
  const { error } = await db
    .from('student_skills')
    .delete()
    .eq('id', skillId)
    .eq('student_id', studentId)
  if (error) throw error
}

// ============================================================================
// LEARNING GOALS
// ============================================================================
export async function listLearningGoals(studentId) {
  const db = ensureClient()
  const { data, error } = await db
    .from('learning_goals')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createLearningGoal({ studentId, title, description, skillTag, targetDate }) {
  const db = ensureClient()
  const { data, error } = await db
    .from('learning_goals')
    .insert({
      student_id: studentId,
      title: title.trim(),
      description: description?.trim() || '',
      skill_tag: skillTag?.trim() || '',
      target_date: targetDate || null,
      progress: 0,
      status: 'in_progress',
    })
    .select()
    .single()
  if (error) throw error

  await logActivity(studentId, 'goal_created', `Created learning goal: ${title.trim()}`)
  return data
}

export async function updateLearningGoal(goalId, studentId, updates) {
  const db = ensureClient()
  const { data, error } = await db
    .from('learning_goals')
    .update(updates)
    .eq('id', goalId)
    .eq('student_id', studentId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLearningGoal(goalId, studentId) {
  const db = ensureClient()
  const { error } = await db
    .from('learning_goals')
    .delete()
    .eq('id', goalId)
    .eq('student_id', studentId)
  if (error) throw error
}

// ============================================================================
// VOLUNTEERING, ACHIEVEMENTS & ACTIVITY LOGS
// ============================================================================
export async function listVolunteeringRecords(studentId) {
  const db = ensureClient()
  const { data, error } = await db
    .from('volunteering_records')
    .select('*, opportunity:opportunities(title, organization)')
    .eq('student_id', studentId)
    .order('verified_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function listAchievements(studentId) {
  const db = ensureClient()
  const [allRes, earnedRes] = await Promise.all([
    db.from('achievements').select('*').order('points_required', { ascending: true }),
    db.from('user_achievements').select('*, achievement:achievements(*)').eq('student_id', studentId),
  ])
  if (allRes.error) throw allRes.error
  if (earnedRes.error) throw earnedRes.error
  return {
    all: allRes.data || [],
    earned: earnedRes.data || [],
  }
}

export async function listActivityLogs(studentId, limit = 10) {
  const db = ensureClient()
  const { data, error } = await db
    .from('activity_logs')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function logActivity(studentId, actionType, title, metadata = {}) {
  const db = ensureClient()
  const { error } = await db.from('activity_logs').insert({
    student_id: studentId,
    action_type: actionType,
    title,
    metadata,
  })
  if (error) {
    console.warn('Activity log failed:', error.message)
  }
}

// ============================================================================
// ADMIN / ORGANIZATION WORKFLOWS
// ============================================================================
export async function listAllOpportunitiesForAdmin() {
  const db = ensureClient()
  const { data, error } = await db
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createOpportunity(payload) {
  const db = ensureClient()
  const { data, error } = await db
    .from('opportunities')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateOpportunityStatus(opportunityId, status) {
  const db = ensureClient()
  const { data, error } = await db
    .from('opportunities')
    .update({ status })
    .eq('id', opportunityId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteOpportunity(opportunityId) {
  const db = ensureClient()
  const { error } = await db
    .from('opportunities')
    .delete()
    .eq('id', opportunityId)
  if (error) throw error
}

export async function listStudentsForAdmin() {
  const db = ensureClient()
  const { data, error } = await db
    .from('profiles')
    .select('id, email, full_name, college, verified_earnings, impact_points, volunteering_hours, completed_opportunities')
    .eq('role', 'student')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function listAllApplicationsForAdmin() {
  const db = ensureClient()
  const { data, error } = await db
    .from('applications')
    .select(`
      *,
      opportunity:opportunities(*),
      student:profiles(id, email, full_name, college, verified_earnings, impact_points)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function assignTaskToStudent({ studentId, opportunityId, opportunityTitle, note }) {
  const db = ensureClient()
  const { data, error } = await db
    .from('applications')
    .upsert(
      {
        student_id: studentId,
        opportunity_id: opportunityId,
        message: note?.trim() || 'Assigned directly by BloomUp Admin',
        status: 'accepted',
      },
      { onConflict: 'student_id,opportunity_id' }
    )
    .select(`
      *,
      opportunity:opportunities(*),
      student:profiles(id, email, full_name, college, verified_earnings, impact_points)
    `)
    .single()
  if (error) throw error

  await logActivity(studentId, 'task_assigned', `Assigned task: ${opportunityTitle}`, {
    opportunity_id: opportunityId,
  })
  return data
}

export async function updateApplicationStatus(applicationId, status) {
  const db = ensureClient()
  const { data, error } = await db
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select(`
      *,
      opportunity:opportunities(*),
      student:profiles(id, email, full_name, college, verified_earnings, impact_points)
    `)
    .single()
  if (error) throw error
  return data
}

export async function verifyAndCompleteApplication(applicationId) {
  const db = ensureClient()
  const { error } = await db.rpc('verify_and_complete_application', {
    p_application_id: applicationId,
  })
  if (error) throw error
}
