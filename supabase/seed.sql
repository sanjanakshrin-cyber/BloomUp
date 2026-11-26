-- ============================================================================
-- BloomUp Demo Seed Data
-- All opportunity records are explicitly marked with is_demo = TRUE.
-- No fake authenticated student accounts or fake completed histories are created.
-- ============================================================================

-- Core Skills Catalog
INSERT INTO public.skills (name, category) VALUES
  ('React', 'technical'),
  ('JavaScript', 'technical'),
  ('Python', 'technical'),
  ('UI/UX Design', 'technical'),
  ('Figma', 'technical'),
  ('Data Analysis', 'technical'),
  ('Excel / Spreadsheets', 'technical'),
  ('Content Writing', 'non-technical'),
  ('Social Media Marketing', 'non-technical'),
  ('Public Speaking', 'non-technical'),
  ('Tutoring & Mentoring', 'non-technical'),
  ('Research & Synthesis', 'non-technical'),
  ('Community Outreach', 'non-technical'),
  ('Event Coordination', 'non-technical')
ON CONFLICT (name) DO NOTHING;

-- Achievement Badges
INSERT INTO public.achievements (code, title, description, icon, pillar, points_required) VALUES
  ('first_sprout', 'First Sprout', 'Completed your BloomUp student onboarding profile.', 'sprout', 'grow', 0),
  ('first_earn', 'First Verified Gig', 'Completed your first paid micro-gig on BloomUp.', 'briefcase', 'earn', 1),
  ('impact_starter', 'Community Seed', 'Logged your first verified volunteering hours.', 'heart', 'impact', 10),
  ('goal_crusher', 'Goal Finisher', 'Marked your first personal learning goal as completed.', 'target', 'grow', 1),
  ('eco_champion', 'Eco Champion', 'Earned 250+ verified Impact Points through community action.', 'award', 'impact', 250)
ON CONFLICT (code) DO NOTHING;

-- Demo Paid Micro-Gigs (EARN)
INSERT INTO public.opportunities (
  type, title, description, category, organization, required_skills,
  payment_amount, currency, work_mode, location, deadline, status, is_demo
) VALUES
  (
    'earn',
    'Social Media Content Sprint for EcoCampus',
    '[Demo Opportunity] Create 8 short-form Instagram carousels and captions promoting campus sustainability initiatives.',
    'Social Media',
    'EcoCampus Collective (Demo)',
    ARRAY['Social Media Marketing', 'Content Writing', 'Figma'],
    2500, 'INR', 'remote', 'Remote', NOW() + INTERVAL '12 days', 'open', TRUE
  ),
  (
    'earn',
    'Landing Page Build for Local Bookshop',
    '[Demo Opportunity] Build a responsive 3-section landing page using React and clean CSS for an independent neighborhood bookstore.',
    'Web Development',
    'PageTurners Studio (Demo)',
    ARRAY['React', 'JavaScript', 'UI/UX Design'],
    5500, 'INR', 'remote', 'Remote', NOW() + INTERVAL '18 days', 'open', TRUE
  ),
  (
    'earn',
    'Brand Poster & Flyer Pack Design',
    '[Demo Opportunity] Design 4 print-ready event posters and digital banners for an upcoming student design hackathon.',
    'Graphic Design',
    'Campus Makers Club (Demo)',
    ARRAY['Figma', 'UI/UX Design'],
    3000, 'INR', 'remote', 'Remote', NOW() + INTERVAL '9 days', 'open', TRUE
  ),
  (
    'earn',
    'Survey Data Cleanup & Spreadsheet Modeling',
    '[Demo Opportunity] Clean 600 rows of student survey responses, standardize categories, and produce summary pivot charts.',
    'Data Entry & Analysis',
    'CivicInsights Lab (Demo)',
    ARRAY['Excel / Spreadsheets', 'Data Analysis'],
    1800, 'INR', 'remote', 'Remote', NOW() + INTERVAL '7 days', 'open', TRUE
  ),
  (
    'earn',
    'Weekend Python Basics Peer Tutoring',
    '[Demo Opportunity] Conduct two 90-minute online tutoring sessions for first-year students covering loops, functions, and lists.',
    'Tutoring',
    'PeerLearn Academy (Demo)',
    ARRAY['Python', 'Tutoring & Mentoring', 'Public Speaking'],
    2200, 'INR', 'remote', 'Remote', NOW() + INTERVAL '14 days', 'open', TRUE
  ),
  (
    'earn',
    'Student Career Guide Article Series',
    '[Demo Opportunity] Research and write two 1,000-word practical guides on building a first internship portfolio.',
    'Content Writing',
    'NextStep Editorial (Demo)',
    ARRAY['Content Writing', 'Research & Synthesis'],
    2000, 'INR', 'remote', 'Remote', NOW() + INTERVAL '15 days', 'open', TRUE
  ),
  (
    'earn',
    'EdTech Market Research Assistant',
    '[Demo Opportunity] Compile a structured comparison matrix of 15 student productivity tools with pricing and feature notes.',
    'Research',
    'VenturePulse India (Demo)',
    ARRAY['Research & Synthesis', 'Data Analysis', 'Excel / Spreadsheets'],
    3500, 'INR', 'hybrid', 'Bengaluru / Remote', NOW() + INTERVAL '20 days', 'open', TRUE
  );

-- Demo Volunteering Opportunities (IMPACT)
INSERT INTO public.opportunities (
  type, title, description, category, organization, required_skills,
  impact_points, duration_hours, available_slots, work_mode, location, event_date, deadline, status, is_demo
) VALUES
  (
    'impact',
    'Lakeside Urban Clean-Up Drive',
    '[Demo Opportunity] Join student volunteers for a morning lakeside waste-sorting and plastic-free awareness drive.',
    'Environment',
    'GreenRoots Foundation (Demo)',
    ARRAY['Community Outreach', 'Event Coordination'],
    120, 4, 25, 'in-person', 'Pune, MH', NOW() + INTERVAL '10 days', NOW() + INTERVAL '8 days', 'open', TRUE
  ),
  (
    'impact',
    'Weekend Math & Reading Mentorship',
    '[Demo Opportunity] Mentor middle-school students from underserved neighborhoods in foundational math and English reading.',
    'Education',
    'BrightBridge Trust (Demo)',
    ARRAY['Tutoring & Mentoring', 'Public Speaking'],
    150, 5, 12, 'in-person', 'Mumbai, MH', NOW() + INTERVAL '11 days', NOW() + INTERVAL '9 days', 'open', TRUE
  ),
  (
    'impact',
    'Digital Literacy Awareness Campaign',
    '[Demo Opportunity] Create simple bilingual guides helping senior citizens recognize online scams and use digital payments safely.',
    'Community Awareness',
    'SafeNet Volunteers (Demo)',
    ARRAY['Content Writing', 'Community Outreach'],
    100, 3, 20, 'remote', 'Remote', NOW() + INTERVAL '16 days', NOW() + INTERVAL '14 days', 'open', TRUE
  ),
  (
    'impact',
    'Neighborhood Food Distribution Support',
    '[Demo Opportunity] Assist local community kitchens with meal packing, inventory tracking, and zero-waste distribution.',
    'Food Security',
    'SharePlate Initiative (Demo)',
    ARRAY['Event Coordination', 'Community Outreach'],
    140, 4.5, 15, 'in-person', 'New Delhi, IN', NOW() + INTERVAL '13 days', NOW() + INTERVAL '10 days', 'open', TRUE
  ),
  (
    'impact',
    'Campus & Park Tree Plantation Morning',
    '[Demo Opportunity] Plant and tag 100 native saplings with local botanists and record GPS locations for long-term care.',
    'Environment',
    'CanopyProject (Demo)',
    ARRAY['Community Outreach', 'Event Coordination'],
    180, 6, 30, 'in-person', 'Bengaluru, KA', NOW() + INTERVAL '19 days', NOW() + INTERVAL '15 days', 'open', TRUE
  ),
  (
    'impact',
    'Open-Source Study Notes Accessibility',
    '[Demo Opportunity] Convert scanned STEM lecture handouts into accessible, screen-reader-friendly markdown notes for learners.',
    'Educational Support',
    'OpenEdu Commons (Demo)',
    ARRAY['Content Writing', 'Research & Synthesis'],
    110, 3.5, 18, 'remote', 'Remote', NOW() + INTERVAL '22 days', NOW() + INTERVAL '18 days', 'open', TRUE
  );
