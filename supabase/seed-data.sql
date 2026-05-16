-- ============================================================
-- EDUBUDDI AI — Seed Data (Courses, Lessons, Quizzes)
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────
-- COURSE 1: Cold Calling Mastery
-- ──────────────────────────────────────────────
INSERT INTO public.courses (id, title, description, category, difficulty, estimated_minutes, is_published, xp_reward)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'Cold Calling Mastery',
  'Learn proven techniques to make effective cold calls that convert. From opening lines to closing techniques, master the art of cold outreach.',
  'sales',
  'beginner',
  45,
  true,
  100
);

INSERT INTO public.lessons (id, course_id, title, content_type, content, order_index, estimated_minutes, xp_reward) VALUES
('l1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'The Mindset of a Cold Caller', 'text',
  '{"text": "Cold calling success starts with mindset. The top 1% of cold callers share three key traits:\n\n1. Resilience — They understand that rejection is not personal. Every ''no'' gets them closer to a ''yes.''\n\n2. Curiosity — Instead of pitching immediately, they are genuinely curious about the prospect''s situation.\n\n3. Preparation — They never dial blind. They always have context about who they are calling.\n\nKey Principle: You are not calling to sell. You are calling to see if there is a fit. This subtle shift changes everything about how you sound on the phone.\n\nExercise: Before your next 10 calls, write down one thing you are genuinely curious to learn about each prospect. Notice how this changes the quality of your conversations."}',
  0, 5, 15),

('l1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Crafting Your Opening Line', 'text',
  '{"text": "The first 10 seconds of a cold call determine whether the prospect stays on the line. Here are three proven opening frameworks:\n\nFramework 1: The Pattern Interrupt\n\"Hi [Name], I know this is completely unexpected — do you have 30 seconds so I can tell you why I am calling, and you can decide if it is worth continuing?\"\n\nFramework 2: The Referral Bridge\n\"Hi [Name], I was just speaking with [Colleague/Company in their industry] about [relevant topic], and your name came up.\"\n\nFramework 3: The Insight Lead\n\"Hi [Name], I noticed [specific observation about their company] and had a quick thought that might be relevant.\"\n\nKey Rules:\n- Never ask \"How are you?\" — it signals a sales call\n- State your name and company only after they engage\n- Speak with confidence but not aggression\n- Smile while you dial — they can hear it"}',
  1, 7, 15),

('l1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Handling the Gatekeeper', 'text',
  '{"text": "Gatekeepers are not obstacles — they are allies if you treat them right. Here is how to work with them:\n\nDO:\n- Be polite and professional\n- Use the decision-maker''s first name confidently\n- State a specific, relevant reason for calling\n- Ask for help: \"Could you point me in the right direction?\"\n\nDO NOT:\n- Be vague about why you are calling\n- Talk down to them\n- Try to trick them\n- Leave generic voicemails\n\nPro Script: \"Hi, this is [Your Name]. I am reaching out about [specific topic relevant to their role]. Is [Decision Maker] available, or could you suggest the best time to reach them?\"\n\nVoicemail Template:\n\"Hi [Name], this is [Your Name] from [Company]. I am calling because [one specific reason]. I will try you again on [day/time], or you can reach me at [number]. Looking forward to connecting.\""}',
  2, 5, 15);

-- Quiz for Cold Calling course
INSERT INTO public.quizzes (id, course_id, title, passing_score)
VALUES ('q1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Cold Calling Mastery Quiz', 70);

INSERT INTO public.quiz_questions (quiz_id, question, question_type, options, correct_answer, explanation, order_index) VALUES
('q1000000-0000-0000-0000-000000000001', 'What is the first thing you should do before a cold call?', 'multiple_choice',
  '["Start dialing immediately", "Research the prospect", "Practice your pitch in the mirror", "Send an email first"]',
  'Research the prospect', 'Preparation is one of the three key traits of top cold callers. Always have context about who you are calling.', 0),

('q1000000-0000-0000-0000-000000000001', 'Which opening line is most effective for cold calls?', 'multiple_choice',
  '["How are you today?", "I know this is unexpected — do you have 30 seconds?", "I am calling from XYZ company to tell you about our product", "Can I speak with the person who handles purchasing?"]',
  'I know this is unexpected — do you have 30 seconds?', 'The Pattern Interrupt acknowledges the unexpected nature of the call and asks for a small commitment.', 1),

('q1000000-0000-0000-0000-000000000001', 'How should you treat gatekeepers?', 'multiple_choice',
  '["As obstacles to bypass", "As allies who can help you", "Ignore them and call back later", "Demand to speak with the boss"]',
  'As allies who can help you', 'Gatekeepers are allies if you treat them with respect and professionalism.', 2);


-- ──────────────────────────────────────────────
-- COURSE 2: Objection Handling Pro
-- ──────────────────────────────────────────────
INSERT INTO public.courses (id, title, description, category, difficulty, estimated_minutes, is_published, xp_reward)
VALUES (
  'c1000000-0000-0000-0000-000000000002',
  'Objection Handling Pro',
  'Turn objections into opportunities. Learn the frameworks used by top performers to address concerns and move deals forward.',
  'negotiation',
  'intermediate',
  60,
  true,
  150
);

INSERT INTO public.lessons (id, course_id, title, content_type, content, order_index, estimated_minutes, xp_reward) VALUES
('l1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Why Prospects Object', 'text',
  '{"text": "Objections are not rejections — they are requests for more information. Understanding why prospects object is the first step to handling them effectively.\n\nThe 5 Root Causes of Objections:\n\n1. Lack of Trust — They don''t trust you or your company yet\n2. Lack of Need — They don''t see how you solve their problem\n3. Lack of Urgency — They don''t feel the pain strongly enough\n4. Lack of Budget — They can''t justify the investment\n5. Lack of Authority — They can''t make the decision alone\n\nKey Insight: Most objections are symptoms, not root causes. When someone says \"It''s too expensive,\" they might really mean \"I don''t see enough value\" or \"I can''t justify this to my boss.\"\n\nYour job is to dig deeper and find the real concern underneath the surface objection."}',
  0, 8, 20),

('l1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'The LAER Framework', 'text',
  '{"text": "LAER is one of the most effective objection handling frameworks. It stands for:\n\nL — Listen\nLet them finish completely. Don''t interrupt. Show you are engaged.\n\nA — Acknowledge\n\"I completely understand why you feel that way\" or \"That''s a fair point.\"\n\nE — Explore\nAsk clarifying questions: \"Help me understand — when you say it''s too expensive, compared to what?\" or \"What would need to be true for this to make sense?\"\n\nR — Respond\nOnly after you fully understand the real objection should you respond with your solution.\n\nCommon Mistake: Most reps jump straight from Listen to Respond, skipping Acknowledge and Explore. This makes the prospect feel unheard and defensive.\n\nPractice Drill: For the next week, force yourself to ask at least 2 questions before responding to any objection."}',
  1, 10, 20),

('l1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'Top 5 Objections and How to Handle Them', 'text',
  '{"text": "Here are the 5 most common objections and proven responses:\n\n1. \"It''s too expensive\"\nResponse: \"I understand budget is important. Let me ask — if money weren''t a factor, would this solution solve your problem? [If yes] Then let''s figure out together how to make the numbers work.\"\n\n2. \"We''re happy with our current solution\"\nResponse: \"That''s great to hear. Most of our best customers were happy with their previous solution too. They switched because [specific improvement]. Would you be open to seeing how that might apply to you?\"\n\n3. \"Send me some information\"\nResponse: \"I''d be happy to. To make sure I send you the most relevant info, can I ask — what specific challenges are you looking to address?\"\n\n4. \"I need to think about it\"\nResponse: \"Of course. What specific aspects would you like to think through? I might be able to provide some additional context that helps.\"\n\n5. \"We don''t have the budget right now\"\nResponse: \"When does your new budget cycle start? And in the meantime, would it be helpful to see the ROI data so you can build a case?\""}',
  2, 10, 20);


-- ──────────────────────────────────────────────
-- COURSE 3: Product Knowledge Essentials
-- ──────────────────────────────────────────────
INSERT INTO public.courses (id, title, description, category, difficulty, estimated_minutes, is_published, xp_reward)
VALUES (
  'c1000000-0000-0000-0000-000000000003',
  'Product Knowledge Essentials',
  'Deep dive into your product portfolio. Learn features, benefits, and competitive advantages to sell with confidence.',
  'product',
  'beginner',
  30,
  true,
  75
);

INSERT INTO public.lessons (id, course_id, title, content_type, content, order_index, estimated_minutes, xp_reward) VALUES
('l1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003', 'Features vs Benefits', 'text',
  '{"text": "The #1 mistake in sales is talking about features instead of benefits.\n\nFeatures = What your product does\nBenefits = What it means for the customer\n\nExample:\nFeature: \"Our platform has AI-powered analytics\"\nBenefit: \"You will know exactly which deals to focus on, saving you 5 hours a week\"\n\nThe Translation Framework:\nFor every feature, ask: \"So what? Why does the customer care?\"\n\nExercise: List your top 5 product features. For each one, write the benefit using this template:\n\"Because we have [feature], you will [benefit], which means [outcome].\""}',
  0, 10, 15),

('l1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000003', 'Competitive Positioning', 'text',
  '{"text": "Knowing your competition is as important as knowing your product.\n\nThe Competitive Matrix:\n1. Identify your top 3 competitors\n2. Map out where you win and where they win\n3. Develop pivot phrases for each competitor\n\nPivot Phrase Template:\n\"Unlike [Competitor], we [unique advantage], which means [customer benefit].\"\n\nGolden Rules of Competitive Selling:\n- Never trash-talk competitors\n- Focus on your unique strengths, not their weaknesses\n- Use third-party validation (case studies, reviews)\n- If you don''t know the answer, say so and follow up\n\nKey Principle: Prospects respect honesty. If a competitor does something better, acknowledge it and redirect to where you excel."}',
  1, 10, 15);


-- ──────────────────────────────────────────────
-- COURSE 4: Discovery Call Mastery
-- ──────────────────────────────────────────────
INSERT INTO public.courses (id, title, description, category, difficulty, estimated_minutes, is_published, xp_reward)
VALUES (
  'c1000000-0000-0000-0000-000000000004',
  'Discovery Call Mastery',
  'Master the art of discovery. Learn SPIN selling, MEDDPICC, and other frameworks to uncover needs and qualify opportunities.',
  'sales',
  'intermediate',
  50,
  true,
  125
);

INSERT INTO public.lessons (id, course_id, title, content_type, content, order_index, estimated_minutes, xp_reward) VALUES
('l1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000004', 'SPIN Selling Framework', 'text',
  '{"text": "SPIN is one of the most researched and proven sales methodologies. It stands for:\n\nS — Situation Questions\nUnderstand their current state: \"Walk me through your current process for X\"\n\nP — Problem Questions\nUncover pain points: \"Where do you see the biggest bottlenecks?\"\n\nI — Implication Questions\nAmplify the pain: \"What happens if this issue continues for another 6 months?\"\n\nN — Need-Payoff Questions\nGet them to sell themselves: \"If you could solve this, what would that mean for your team?\"\n\nKey Insight: The magic of SPIN is that you are not telling the prospect they have a problem — you are helping them discover it themselves. People are more motivated by self-discovered insights than by being told what to do."}',
  0, 12, 20),

('l1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000004', 'MEDDPICC Qualification', 'text',
  '{"text": "MEDDPICC is the gold standard for deal qualification:\n\nM — Metrics: What measurable outcomes does the prospect expect?\nE — Economic Buyer: Who controls the budget?\nD — Decision Criteria: How will they evaluate solutions?\nD — Decision Process: What are the steps to a decision?\nP — Paper Process: What legal/procurement steps are needed?\nI — Identify Pain: What is the core business pain?\nC — Champion: Who internally will advocate for you?\nC — Competition: Who else are they considering?\n\nFor each deal in your pipeline, score each element 1-3:\n1 = Unknown/Weak\n2 = Partially identified\n3 = Fully validated\n\nIf your total score is below 16, the deal is at risk. Focus your next interaction on filling in the gaps."}',
  1, 12, 20);


-- ──────────────────────────────────────────────
-- COURSE 5: Effective Communication
-- ──────────────────────────────────────────────
INSERT INTO public.courses (id, title, description, category, difficulty, estimated_minutes, is_published, xp_reward)
VALUES (
  'c1000000-0000-0000-0000-000000000005',
  'Effective Communication for Sales',
  'Communicate with impact. Learn active listening, storytelling, and persuasion techniques that build trust and close deals.',
  'communication',
  'beginner',
  35,
  true,
  90
);

INSERT INTO public.lessons (id, course_id, title, content_type, content, order_index, estimated_minutes, xp_reward) VALUES
('l1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000005', 'Active Listening', 'text',
  '{"text": "Active listening is the most underrated sales skill. Studies show top performers listen 60-70% of the time.\n\nThe 4 Levels of Listening:\n\n1. Cosmetic Listening — Pretending to listen while planning your response\n2. Conversational Listening — Hearing words but missing meaning\n3. Active Listening — Fully engaged, asking clarifying questions\n4. Deep Listening — Understanding emotions, concerns, and what is NOT being said\n\nTechniques to improve:\n- Paraphrase: \"So what I am hearing is...\"\n- Reflect feelings: \"It sounds like that was frustrating\"\n- Ask follow-up questions: \"Tell me more about that\"\n- Take notes and reference them later\n- Resist the urge to jump in with solutions\n\nChallenge: In your next 5 conversations, try to speak no more than 40% of the time."}',
  0, 10, 15),

('l1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000005', 'The Power of Storytelling', 'text',
  '{"text": "Stories are 22x more memorable than facts. In sales, the right story at the right time can be the difference between winning and losing.\n\nThe 3-Act Story Framework:\n\nAct 1 — The Situation\n\"We worked with a company just like yours...\"\nSet the scene with relatable context.\n\nAct 2 — The Challenge\n\"They were struggling with [same problem your prospect has]...\"\nShow you understand their pain.\n\nAct 3 — The Resolution\n\"After implementing our solution, they saw [specific results]...\"\nPaint a picture of success.\n\nRules for Sales Stories:\n- Keep them under 90 seconds\n- Use specific numbers and results\n- Make the customer the hero, not your product\n- Have 3-5 stories ready for different situations\n- Practice until they feel natural, not scripted"}',
  1, 10, 15);


-- ──────────────────────────────────────────────
-- COURSE 6: Advanced Negotiation
-- ──────────────────────────────────────────────
INSERT INTO public.courses (id, title, description, category, difficulty, estimated_minutes, is_published, xp_reward)
VALUES (
  'c1000000-0000-0000-0000-000000000006',
  'Advanced Negotiation Tactics',
  'Go beyond basic negotiation. Learn advanced techniques for complex deals, multi-stakeholder scenarios, and win-win outcomes.',
  'negotiation',
  'advanced',
  55,
  true,
  175
);

INSERT INTO public.lessons (id, course_id, title, content_type, content, order_index, estimated_minutes, xp_reward) VALUES
('l1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000006', 'Anchoring and Framing', 'text',
  '{"text": "Anchoring is the most powerful negotiation technique. The first number mentioned in a negotiation tends to become the anchor around which all subsequent discussion revolves.\n\nHow to use anchoring:\n1. Always present your price first (with confidence)\n2. Start high but justifiable\n3. Never give a range — they will anchor to the low end\n4. Frame the price in context: daily cost, per-user cost, ROI multiple\n\nFraming Example:\n\"Our platform is EUR 399 per month. That is less than EUR 16 per user per day — roughly the cost of a coffee. And based on similar companies, you should see a 3x return within 90 days.\"\n\nAdvanced Technique: The Bracket\nIf they push back on price, don''t just go lower. Instead, offer 3 options:\n- Option A: Full package (highest value, highest price)\n- Option B: Core package (recommended, medium price)\n- Option C: Basic package (limited, lowest price)\n\nMost people choose the middle option, which should be your target."}',
  0, 15, 25),

('l1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000006', 'Multi-Stakeholder Deals', 'text',
  '{"text": "Enterprise deals involve multiple stakeholders, each with different priorities. Here is how to navigate them:\n\nThe Power Map:\nDraw a diagram of everyone involved in the decision:\n- Economic Buyer (controls budget)\n- Technical Buyer (evaluates capabilities)\n- User Buyer (will use the product daily)\n- Coach/Champion (your internal advocate)\n- Blocker (opposes the deal)\n\nStrategy for each stakeholder:\n\nEconomic Buyer: Talk ROI, risk mitigation, strategic alignment\nTechnical Buyer: Talk integration, security, scalability\nUser Buyer: Talk ease of use, time savings, daily workflow\nChampion: Arm them with materials, talking points, ROI data\nBlocker: Understand their concerns, find common ground\n\nGolden Rule: Never do a demo or proposal for just one stakeholder. Always ensure the economic buyer and at least one other stakeholder are present for key meetings."}',
  1, 15, 25);


-- ──────────────────────────────────────────────
-- Update RLS to allow managers to see all profiles
-- ──────────────────────────────────────────────
CREATE POLICY "Managers can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin'))
  );

CREATE POLICY "Managers can view all revenue" ON public.revenue_data
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin'))
  );

CREATE POLICY "Managers can view all leaks" ON public.money_leaks
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin'))
  );

CREATE POLICY "Managers can view all skills" ON public.user_skills
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin'))
  );

CREATE POLICY "Managers can view all alerts" ON public.performance_alerts
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin'))
  );


-- ──────────────────────────────────────────────
-- DONE! Seed data loaded.
-- ──────────────────────────────────────────────
