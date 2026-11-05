// All site content lives here. Edit freely — the components just render it.
// To swap an image, drop a file in /public/images and update the path below.

export const profile = {
  name: 'Mr. Zeigler',
  title: 'Mathematics Teacher',
  school: 'Bowsher High School',
  location: 'Toledo, OH',
  tagline: 'Helping students find the logic — and the beauty — hiding inside every problem.',
  email: 'mr.zeigler@example.com',
  portrait: '/images/mrzeigler.jpg',
  classroomPhoto: '/images/classroom.jpg',
  socials: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
    { label: 'Bluesky', href: 'https://bsky.app/' },
  ],
}

export const about = {
  paragraphs: [
    'I’ve been teaching math for seventeen years, and I still get a jolt every time a student’s face goes from “I don’t get it” to “oh — OH” in the middle of a problem. That moment is the reason I do this job.',
    'Before teaching, I spent four years as a civil engineer, double-checking load calculations that nobody ever thanked me for. I realized the part of the job I actually loved was explaining the math to the new hires — so I traded blueprints for lesson plans and never looked back.',
    'My classroom runs on think-pair-share, error analysis, and a very large supply of whiteboard markers. I believe every student can learn to do math, that a wrong answer is data, and that “I don’t know yet” is a complete sentence.',
    'Outside school I coach the Bowsher Mathletes, do the crossword and KenKen every morning before first bell, volunteer as a tax-season tutor at the public library, and make a mean batch of Saturday pancakes.',
  ],
  stats: [
    { value: '17', label: 'Years teaching' },
    { value: '2,200+', label: 'Students taught' },
    { value: '91%', label: 'Ohio State Test pass rate' },
    { value: '4×', label: 'Regional Math League champions' },
  ],
  facts: [
    { icon: '🎓', label: 'M.Ed., Curriculum & Instruction' },
    { icon: '📐', label: 'B.S., Mathematics' },
    { icon: '🏆', label: 'District Teacher of the Year, 2023' },
    { icon: '☕', label: 'Runs on cold brew' },
    { icon: '🧩', label: 'Advisor, Bowsher Mathletes' },
    { icon: '🔢', label: 'Can recite pi to 50 digits (has been tested)' },
  ],
}

export const currentCourses = [
  {
    code: 'MATH 401',
    name: 'Pre-Calculus',
    level: 'Grades 11–12',
    periods: 'Period 3',
    room: 'Room 1317',
    image: '/images/course-precalc.svg',
    description:
      'The bridge between algebra and calculus: functions, trig identities, polar coordinates, and sequences. Students leave ready for calculus — or at least no longer afraid of a unit circle.',
    topics: ['Functions', 'Trigonometry', 'Polar Coordinates', 'Sequences'],
  },
  {
    code: 'MATH 201',
    name: 'Geometry',
    level: 'Grades 9–10',
    periods: 'Periods 1 & 7',
    room: 'Room 1317',
    image: '/images/course-geometry.svg',
    description:
      'Proofs, constructions, and a whole lot of “why does that work?” We build spatial reasoning from the ground up, one compass-and-straightedge construction at a time.',
    topics: ['Proofs', 'Constructions', 'Transformations', 'Area & Volume'],
  },
  {
    code: 'MATH 205',
    name: 'Geometry Honors',
    level: 'Grades 9–10',
    periods: 'Period 5',
    room: 'Room 1317',
    image: '/images/course-geometry-honors.svg',
    description:
      'The same core content as Geometry, at a faster pace and with a sharper edge — two-column proofs, coordinate geometry, and problems pulled straight from math competitions.',
    topics: ['Formal Proofs', 'Coordinate Geometry', 'Circles', 'Competition Problems'],
  },
  {
    code: 'MATH 450',
    name: 'Statistics and Analysis',
    level: 'Grades 11–12',
    periods: 'Periods 4',
    room: 'Room 1317',
    image: '/images/course-stats.svg',
    description:
      'How to read a study, spot a misleading graph, and not get fooled by a p-value. We work with real, messy datasets from day one, right up through a self-designed final research project.',
    topics: ['Probability', 'Distributions', 'Regression', 'Data Literacy'],
  },
]

// Class calendars — each class shares the school-wide dates below (schoolEvents).
// To give a class its own events later, add an `events` array here in the same
// shape as schoolEvents and merge it in Calendar.jsx.
export const classCalendars = [
  { slug: 'pre-calc', name: 'Pre-Calculus' },
  { slug: 'geometry', name: 'Geometry' },
  { slug: 'geometry-honors', name: 'Geometry Honors' },
  { slug: 'statistics', name: 'Statistics and Analysis' },
]

export const schoolEvents = [
  { start: '2026-12-21', end: '2027-01-01', label: 'Winter Break', type: 'winter' },
  { start: '2027-03-26', end: '2027-04-02', label: 'Spring Break', type: 'spring' },
  { start: '2026-12-15', end: '2026-12-17', label: 'Exams', type: 'exams' },
  { start: '2027-05-26', end: '2027-05-28', label: 'Exams', type: 'exams' },
  { start: '2026-10-16', end: '2026-10-16', label: 'End Q1', type: 'quarter' },
  { start: '2027-03-12', end: '2027-03-12', label: 'End Q3', type: 'quarter' },
  { start: '2026-09-07', end: '2026-09-07', label: 'No School', type: 'holiday' },
  { start: '2026-11-03', end: '2026-11-03', label: 'No School', type: 'holiday' },
  { start: '2027-01-04', end: '2027-01-04', label: 'No School', type: 'holiday' },
  { start: '2027-01-18', end: '2027-01-18', label: 'No School', type: 'holiday' },
  { start: '2027-02-12', end: '2027-02-12', label: 'No School', type: 'holiday' },
  { start: '2027-02-15', end: '2027-02-15', label: 'No School', type: 'holiday' },
  { start: '2027-05-31', end: '2027-05-31', label: 'No School', type: 'holiday' },
]

export const philosophy = [
  {
    title: 'Problem first, formula second',
    body: 'Students learn best when they have a reason to learn. We start with a real problem, and the formula shows up exactly when it’s needed to solve it.',
  },
  {
    title: 'A wrong answer is feedback',
    body: 'A wrong answer isn’t a failure, it’s data. We find the mistake together, out loud, without shame — and figure out what it’s telling us.',
  },
  {
    title: 'Math is a team sport',
    body: 'Whiteboard work, think-pair-share, and group proofs. Mathematicians don’t work alone, and neither do we.',
  },
  {
    title: 'Everyone belongs here',
    body: 'Math isn’t for “a certain kind of kid.” My classroom is designed so every student sees themselves as someone who can do math.',
  },
]

export const blogPosts = [
  {
    slug: 'why-i-ban-calculators-in-september',
    title: 'Why I (Temporarily) Ban Calculators in September',
    date: '2026-09-14',
    readTime: '5 min read',
    tag: 'Teaching',
    image: '/images/calculator.jpg',
    excerpt:
      'For the first three weeks of Pre-Calc, students solve everything by hand. They hate it. Then they thank me.',
    body: [
      'Every September I announce the rule and every September I hear the groans: no calculators for the first three weeks. Every trig identity, every factoring problem, every system of equations gets worked out by hand.',
      'It sounds old-fashioned, but there’s a reason. When you work through a problem by hand, your brain has to sit with each step. You notice that a negative sign got dropped. You notice when an answer doesn’t make sense before the calculator tells you it does. You build the number sense that makes the harder material possible later.',
      'By week four, students can spot a sign error from across the room. That’s when I lift the ban — and honestly, a few of them keep reaching for scratch paper first anyway.',
    ],
  },
  {
    slug: 'ai-homework-helpers-my-current-rules',
    title: 'AI Homework Helpers in the Math Classroom: My Current Rules',
    date: '2026-08-22',
    readTime: '7 min read',
    tag: 'Technology',
    image: '/images/AIclassroom.jpg',
    excerpt:
      'Photomath and ChatGPT aren’t going away, so pretending they don’t exist isn’t a strategy. Here’s how I’m handling them this year.',
    body: [
      'Last year I tried pretending homework-solving apps didn’t exist. It didn’t work. This year I’m trying something different: clear rules about when and how they’re allowed.',
      'Rule one: you must be able to explain every step on your own, out loud, without the app in front of you. If you can’t, it doesn’t count. Rule two: use it to check your work, not to skip doing the work. Rule three: show your own steps on paper regardless of what the app says.',
      'The result so far? Students are using these tools more like a tutor and less like an answer key. I’ll report back at semester’s end.',
    ],
  },
  {
    slug: 'math-league-regionals-recap',
    title: 'Math League Regionals: A Blown Tiebreaker and a Comeback for the Ages',
    date: '2026-04-05',
    readTime: '6 min read',
    tag: 'Math Team',
    image: '/images/mathCompetition.jpg',
    excerpt:
      'Our top scorer bubbled in the wrong column on the final answer sheet. What the team did in the next ten minutes is the proudest moment of my career.',
    body: [
      'Final round, regionals. Our top scorer — the one who never misses a tiebreaker — fills in the wrong column on the answer sheet. We watch the score post as a zero.',
      'We had ten minutes before the awards ceremony. Nobody panicked. The rest of the team huddled around the practice set one more time, our alternate talked through every proof out loud, and two freshmen started coaching each other through the mistakes from round three.',
      'We still finished third. But the trophy isn’t what I’ll remember. I’ll remember a team that treated a disaster like a problem to be solved.',
    ],
  },
  {
    slug: 'first-year-teacher-advice',
    title: 'Five Things I Wish I Knew My First Year Teaching Math',
    date: '2026-01-18',
    readTime: '7 min read',
    tag: 'Advice',
    image: '/images/firstYearTeacher.jpg',
    excerpt:
      'Plan less, model more, and always have a backup lesson that doesn’t need the good calculators.',
    body: [
      '1. The class set of graphing calculators will not all have working batteries on the day you need them. Always have a backup plan that doesn’t depend on them.',
      '2. Working a problem wrong on purpose, out loud, teaches more than any perfectly clean example ever will.',
      '3. The quiet kid in the back might be your strongest problem-solver. Check in with everyone, not just the hands that go up.',
      '4. You don’t need a faster method memorized. “Let’s find out together” is a great answer.',
      '5. Celebrate small wins loudly. A correctly factored trinomial deserves applause.',
    ],
  },
]

export const pastClasses = [
  {
    years: '2021 – 2025',
    name: 'Functions and Trigonometry',
    school: 'Woodward High School',
    description: 'An upper-level elective bridging Algebra II and Pre-Calc, built around modeling real-world periodic and exponential behavior. Retired when Bowsher’s schedule brought Pre-Calc back into that slot.',
  },
  {
    years: '2018 – 2021',
    name: 'Algebra II',
    school: 'Woodward High School',
    description: 'The traditional sophomore/junior sequence: polynomials, rational functions, logarithms, and conics. Taught four sections a year for three years running.',
  },
  {
    years: '2014 – 2018',
    name: 'Transitional Geometry',
    school: 'Scott High School',
    description: 'A support-paced geometry course for students who needed an extra semester to build confidence before the standard track. Small classes, a lot of patience, and some of my favorite “aha” moments.',
  },
  {
    years: '2011 – 2014',
    name: 'Algebra I',
    school: 'East Broadway Middle School',
    description: 'My very first classroom: eighth graders meeting variables for the first time. Where I learned that “why do we need to know this” is a question worth actually answering.',
  },
]

export const projects = [
  { title: 'Statistics & Analysis Course', author: 'Bowsher Math Dept, 2026', image: '/images/statisticsProject.jpg', blurb: 'Co-wrote the district’s new Statistics & Analysis curriculum from scratch, built around real, messy public datasets instead of textbook examples.' },
  { title: 'Bowsher Mathletes', author: 'Toledo Public Schools, 2025', image: '/images/mathCompetitionProject.jpg', blurb: 'Founded the school’s first competition math team from a roster of six students. Three years later, we’re a regular at regionals.' },
  { title: 'Algebra Readiness Program', author: 'Toledo Public Schools, 2023', image: '/images/algebraReadinessProject.jpg', blurb: 'Designed a summer bridge program for incoming freshmen who tested below grade level in math. Piloted district-wide across three TPS schools.' },
  { title: 'Proof-Writing Workshop', author: 'Ohio Math Educators Conf., 2024', image: '/images/geometryProofProject.jpg', blurb: 'Led a professional-development workshop for fellow teachers on making two-column proofs less terrifying for freshmen.' },
]

export const testimonials = [
  {
    quote: 'He’s the teacher other teachers send their own kids to. That tells you everything.',
    name: 'Dana Whitfield',
    role: 'Math Department Chair, Bowsher HS',
  },
  {
    quote: 'Every new hire in our department gets paired with him for a reason. He makes hard material sound obvious.',
    name: 'Marcus Reyes',
    role: 'Principal, Bowsher HS',
  },
  {
    quote: 'I’ve co-taught with a lot of people. Nobody makes a whiteboard proof feel like a group sport quite like he does.',
    name: 'Priya Anand',
    role: 'Geometry Co-Teacher, Bowsher HS',
  },
]

export const officeHours = [
  { day: 'Tuesday', time: '3:00 – 4:00 PM', place: 'Room 118' },
  { day: 'Thursday', time: '7:15 – 7:45 AM', place: 'Room 118' },
  { day: 'By appointment', time: 'Virtual', place: 'Email to schedule' },
]
