import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  HeartHandshake,
  IndianRupee,
  Sprout,
  TrendingUp,
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import { CardSkeleton } from '../components/common/Skeleton'
import {
  TeamPlantingIllustration,
  VolunteerGlobeIllustration,
} from '../components/common/BotanicalIllustrations'
import { useAuth } from '../context/AuthContext'
import {
  listAchievements,
  listActivityLogs,
  listLearningGoals,
  listOpportunities,
  listStudentSkills,
} from '../services/bloomupService'
import { getRecommendedOpportunities } from '../utils/recommendations'
import {
  calculateProfileCompletion,
  formatCurrency,
  formatDate,
} from '../utils/formatters'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [earnOpps, setEarnOpps] = useState([])
  const [impactOpps, setImpactOpps] = useState([])
  const [skills, setSkills] = useState([])
  const [goals, setGoals] = useState([])
  const [activities, setActivities] = useState([])
  const [achievements, setAchievements] = useState({ all: [], earned: [] })

  useEffect(() => {
    if (!user?.id) return
    let active = true

    async function load() {
      try {
        const [oppsData, skillsData, goalsData, logsData, achData] = await Promise.all([
          listOpportunities(),
          listStudentSkills(user.id),
          listLearningGoals(user.id),
          listActivityLogs(user.id, 6),
          listAchievements(user.id),
        ])
        if (!active) return
        setEarnOpps(oppsData.filter((o) => o.type === 'earn'))
        setImpactOpps(oppsData.filter((o) => o.type === 'impact'))
        setSkills(skillsData)
        setGoals(goalsData)
        setActivities(logsData)
        setAchievements(achData)
      } catch (err) {
        console.error('Dashboard load error:', err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [user?.id])

  const firstName = profile?.full_name?.split(' ')[0] || 'Student'
  const completionPct = calculateProfileCompletion(profile, skills.length)
  const recommendedGigs = getRecommendedOpportunities(earnOpps, profile, skills, 2)
  const recommendedImpact = getRecommendedOpportunities(impactOpps, profile, skills, 2)
  const upcomingDeadlines = [...earnOpps, ...impactOpps]
    .filter((o) => o.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3)

  return (
    <AppLayout
      title={`Hello ${firstName}, Welcome!`}
      subtitle="Your Primary Student Dashboard"
    >
      {/* Top KPI Row */}
      <div className="dash-kpi-grid" style={{ marginBottom: 20 }}>
        <div className="bu-card dash-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Verified Earnings
            </span>
            <div
              className="bu-leaf-tile"
              style={{
                width: 36,
                height: 36,
                backgroundColor: 'var(--bg-badge-green)',
                color: '#5c8f1d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IndianRupee size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {formatCurrency(profile?.verified_earnings || 0)}
          </div>
          <Badge tone="green">Earned from verified gigs</Badge>
        </div>

        <div className="bu-card dash-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Impact Points
            </span>
            <div
              className="bu-leaf-tile"
              style={{
                width: 36,
                height: 36,
                backgroundColor: 'var(--bg-badge-orange)',
                color: '#c46b09',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeartHandshake size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {profile?.impact_points || 0} pts
          </div>
          <Badge tone="orange">Verified community score</Badge>
        </div>

        <div className="bu-card dash-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Volunteering Hours
            </span>
            <div
              className="bu-leaf-tile"
              style={{
                width: 36,
                height: 36,
                backgroundColor: 'var(--bg-badge-yellow)',
                color: '#a88108',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {Number(profile?.volunteering_hours || 0)} hrs
          </div>
          <Badge tone="yellow">Verified service hours</Badge>
        </div>

        <div className="bu-card dash-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Completed
            </span>
            <div
              className="bu-leaf-tile"
              style={{
                width: 36,
                height: 36,
                backgroundColor: 'var(--bg-badge-green)',
                color: '#5c8f1d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {profile?.completed_opportunities || 0}
          </div>
          <Badge tone="green">Gigs &amp; Drives finished</Badge>
        </div>
      </div>

      <div className="dash-grid">
        {/* Main Column */}
        <div className="dash-main">
          {/* Hero Banner + Profile Completion */}
          <div className="dash-two-col">
            <div
              className="bu-card"
              style={{
                padding: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h2 style={{ fontSize: '1.15rem' }}>Make an Impact</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Join verified community drives and earn Impact Points.
                </p>
                <Link to="/impact">
                  <Button size="sm" variant="primary">
                    Explore Impact
                  </Button>
                </Link>
              </div>
              <VolunteerGlobeIllustration />
            </div>

            <div className="bu-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem' }}>Profile Completion</h2>
                <Badge tone={completionPct === 100 ? 'green' : 'yellow'}>{completionPct}%</Badge>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: 'var(--border-subtle)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${completionPct}%`,
                    height: '100%',
                    backgroundColor: 'var(--brand-green)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {completionPct < 100
                    ? 'Complete your profile for sharper matches.'
                    : 'Your profile is complete!'}
                </span>
                <Link to="/profile">
                  <Button size="sm" variant="secondary">Edit Profile</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bu-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: '1.08rem' }}>Explore Pillars</h2>
              <Link to="/applications" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-green)' }}>
                View Applications &rarr;
              </Link>
            </div>
            <div className="dash-quick-tiles">
              <Link to="/earn" className="dash-quick-tile">
                <Briefcase size={22} color="#84C233" />
                <span>Earn Gigs</span>
              </Link>
              <Link to="/impact" className="dash-quick-tile">
                <HeartHandshake size={22} color="#F7931E" />
                <span>Volunteering</span>
              </Link>
              <Link to="/grow" className="dash-quick-tile">
                <Sprout size={22} color="#84C233" />
                <span>Grow Skills</span>
              </Link>
              <Link to="/grow" className="dash-quick-tile">
                <TrendingUp size={22} color="#F6C827" />
                <span>Goals ({goals.length})</span>
              </Link>
            </div>
          </div>

          {/* Recommended Gigs & Volunteering */}
          {loading ? (
            <div className="dash-two-col">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="dash-two-col">
              <div className="bu-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontSize: '1.05rem' }}>Recommended Gigs</h2>
                  <Link to="/earn" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-green)' }}>
                    All Gigs
                  </Link>
                </div>
                {recommendedGigs.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="No open gigs found"
                    description="Seed demo opportunities or check back soon."
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendedGigs.map((gig) => (
                      <div
                        key={gig.id}
                        style={{
                          padding: 14,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-alt)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                          <strong style={{ fontSize: '0.94rem' }}>{gig.title}</strong>
                          <Badge tone="green">{formatCurrency(gig.payment_amount, gig.currency)}</Badge>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                          {gig.matchReason}
                        </p>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {gig.organization} • Due {formatDate(gig.deadline)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bu-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontSize: '1.05rem' }}>Recommended Impact</h2>
                  <Link to="/impact" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-green)' }}>
                    All Drives
                  </Link>
                </div>
                {recommendedImpact.length === 0 ? (
                  <EmptyState
                    icon={HeartHandshake}
                    title="No volunteering drives yet"
                    description="Check back soon for new community initiatives."
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendedImpact.map((opp) => (
                      <div
                        key={opp.id}
                        style={{
                          padding: 14,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-alt)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                          <strong style={{ fontSize: '0.94rem' }}>{opp.title}</strong>
                          <Badge tone="orange">+{opp.impact_points} pts</Badge>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                          {opp.matchReason}
                        </p>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {opp.organization} • {opp.location}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills Progress */}
          <div className="bu-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: '1.05rem' }}>Skills &amp; Learning Progress</h2>
              <Link to="/grow" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-green)' }}>
                Manage in Grow &rarr;
              </Link>
            </div>
            {skills.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                You haven&apos;t added skills yet. Add skills in the Grow tab to improve opportunity matching.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.map((s) => (
                  <Badge key={s.id} tone={s.proficiency === 'advanced' ? 'green' : s.proficiency === 'intermediate' ? 'yellow' : 'brown'}>
                    {s.skill_name} • {s.proficiency}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Activity & Badges Column */}
        <aside className="dash-aside">
          <div className="bu-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <CalendarClock size={18} color="#F7931E" />
              <h2 style={{ fontSize: '1.02rem' }}>Upcoming Deadlines</h2>
            </div>
            {upcomingDeadlines.length === 0 ? (
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>No upcoming deadlines.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      paddingBottom: 10,
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {item.type === 'earn' ? 'Paid Gig' : 'Volunteering'}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-orange)', whiteSpace: 'nowrap' }}>
                      {formatDate(item.deadline)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bu-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Award size={18} color="#F6C827" />
              <h2 style={{ fontSize: '1.02rem' }}>Achievement Badges</h2>
            </div>
            {achievements.earned.length === 0 ? (
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Complete gigs, volunteering drives, or learning goals to unlock your first badge.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {achievements.earned.map((ua) => (
                  <Badge key={ua.id} tone="yellow">
                    {ua.achievement?.title}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="bu-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.02rem', marginBottom: 12 }}>Recent Activity</h2>
            {activities.length === 0 ? (
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Your recent applications and milestones will appear here.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activities.map((log) => (
                  <li key={log.id} style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{log.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(log.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className="bu-card"
            style={{
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div>
              <h3 style={{ fontSize: '0.98rem', marginBottom: 4 }}>Keep Growing</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                Set a new skill target in Grow.
              </p>
              <Link to="/grow">
                <Button size="sm" variant="primary">Open Grow</Button>
              </Link>
            </div>
            <TeamPlantingIllustration />
          </div>
        </aside>
      </div>
    </AppLayout>
  )
}
