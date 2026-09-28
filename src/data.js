// All site content lives here. Edit freely — the components just render it.
// To swap an image, drop a file in /public/images and update the path below.

export const profile = {
  name: 'Mr. Zeigler',
  title: 'Computer Science & Engineering Teacher',
  school: 'Lakeview High School',
  location: 'Lakeview, USA',
  tagline: 'Teaching students to build things that didn’t exist yesterday.',
  email: 'mr.zeigler@example.com',
  portrait: '/images/portrait.svg',
  classroomPhoto: '/images/classroom.svg',
  socials: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
    { label: 'Bluesky', href: 'https://bsky.app/' },
  ],
}

export const about = {
  paragraphs: [
    'I’ve been teaching computer science for twelve years, and I still get a jolt every time a student’s code runs for the first time and the whole room hears “WAIT. IT WORKED.” That moment is the reason I do this job.',
    'Before teaching, I spent five years as a software developer building logistics dashboards nobody loved. I realized the part of the job I actually enjoyed was explaining things to the new hires — so I traded pull requests for lesson plans and never looked back.',
    'My classroom runs on projects, pair programming, and a very large supply of whiteboard markers. I believe every student can learn to code, that mistakes are data, and that “I don’t know yet” is a complete sentence.',
    'Outside school I tinker with 3D printers, coach the robotics team, host a small podcast about teaching tech, and make a mean batch of Saturday pancakes.',
  ],
  stats: [
    { value: '12', label: 'Years teaching' },
    { value: '1,800+', label: 'Students taught' },
    { value: '94%', label: 'AP CSP pass rate' },
    { value: '3×', label: 'State robotics qualifier' },
  ],
  facts: [
    { icon: '🎓', label: 'M.Ed., Curriculum & Instruction' },
    { icon: '💻', label: 'B.S., Computer Science' },
    { icon: '🏆', label: 'District Teacher of the Year, 2023' },
    { icon: '☕', label: 'Runs on cold brew' },
    { icon: '🎧', label: 'Host of “Office Hours” podcast' },
    { icon: '🖨️', label: 'Owns too many 3D printers' },
  ],
}

export const currentCourses = [
  {
    code: 'CS 201',
    name: 'AP Computer Science Principles',
    level: 'Grades 10–12',
    periods: 'Periods 1 & 3',
    room: 'Room 214',
    image: '/images/course-apcsp.svg',
    description:
      'A college-level intro to how computing shapes the world: algorithms, data, the internet, cybersecurity, and a whole lot of Python. Students finish the year with a portfolio-ready Create Task.',
    topics: ['Python', 'Algorithms', 'Data & Privacy', 'Networks'],
  },
  {
    code: 'CS 150',
    name: 'Web Development I',
    level: 'Grades 9–12',
    periods: 'Periods 2 & 5',
    room: 'Room 214',
    image: '/images/course-webdev.svg',
    description:
      'From a blank HTML file to a deployed, responsive website. We cover HTML, CSS, JavaScript, accessibility, and design fundamentals — and every student launches a real site by winter break.',
    topics: ['HTML', 'CSS', 'JavaScript', 'Accessibility'],
  },
  {
    code: 'ENG 310',
    name: 'Robotics & Engineering Design',
    level: 'Grades 11–12',
    periods: 'Period 6',
    room: 'Makerspace',
    image: '/images/course-robotics.svg',
    description:
      'Hands-on engineering with microcontrollers, sensors, CAD, and a lot of zip ties. Teams design, prototype, and iterate on a robot that competes in our end-of-year challenge.',
    topics: ['Arduino', 'CAD', 'Sensors', 'Design Process'],
  },
  {
    code: 'CLUB',
    name: 'Game Dev Club',
    level: 'All grades',
    periods: 'Thursdays after school',
    room: 'Room 214',
    image: '/images/course-club.svg',
    description:
      'An open, low-pressure space to make games in Godot, Scratch, or whatever you want. We run two game jams a year and play-test each other’s creations with brutal honesty and snacks.',
    topics: ['Godot', 'Pixel Art', 'Game Jams', 'Play-testing'],
  },
]

// Class calendars — each class shares the school-wide dates below (schoolEvents).
// To give a class its own events later, add an `events` array here in the same
// shape as schoolEvents and merge it in Calendar.jsx.
export const classCalendars = [
  { slug: 'pre-calc', name: 'Pre-Calc' },
  { slug: 'geometry', name: 'Geometry' },
  { slug: 'geometry-honors', name: 'Geometry Honors' },
  { slug: 'statistics', name: 'Statistics' },
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
    title: 'Build first, theory second',
    body: 'Students learn best when they have a reason to learn. We start with something to make, and the concepts show up exactly when they’re needed.',
  },
  {
    title: 'Errors are feedback',
    body: 'A red error message isn’t a failure, it’s the computer telling you something. We read errors out loud, together, without shame.',
  },
  {
    title: 'Code is a team sport',
    body: 'Pair programming, code reviews, and group demos. Professionals don’t code alone, and neither do we.',
  },
  {
    title: 'Everyone belongs here',
    body: 'CS isn’t for “a certain kind of kid.” My classroom is designed so every student sees themselves as someone who builds.',
  },
]

export const blogPosts = [
  {
    slug: 'why-i-ban-copy-paste',
    title: 'Why I (Temporarily) Ban Copy-Paste in September',
    date: '2026-09-14',
    readTime: '5 min read',
    tag: 'Teaching',
    image: '/images/blog-1.svg',
    excerpt:
      'For the first three weeks of Web Dev I, students type every line by hand. They hate it. Then they thank me.',
    body: [
      'Every September I announce the rule and every September I hear the groans: no copy-paste for the first three weeks. Every tag, every semicolon, every curly brace gets typed by hand.',
      'It sounds old-fashioned, but there’s a reason. When you type code yourself, your brain has to process each piece. You notice that a closing tag has a slash. You notice that CSS properties end in a semicolon. You build the muscle memory that makes debugging possible later.',
      'By week four, students can spot a missing bracket from across the room. That’s when I lift the ban — and honestly, most of them keep typing anyway.',
    ],
  },
  {
    slug: 'ai-in-the-cs-classroom',
    title: 'AI Coding Assistants in the Classroom: My Current Rules',
    date: '2026-08-22',
    readTime: '8 min read',
    tag: 'Technology',
    image: '/images/blog-2.svg',
    excerpt:
      'AI tools aren’t going away, so pretending they don’t exist isn’t a strategy. Here’s how I’m handling them this year.',
    body: [
      'Last year I tried pretending AI coding tools didn’t exist. It didn’t work. This year I’m trying something different: clear rules about when and how to use them.',
      'Rule one: you must be able to explain every line you submit. If an AI wrote it and you can’t explain it, it doesn’t count. Rule two: AI is for getting unstuck, not for getting started. Rule three: cite it, just like any other source.',
      'The result so far? Students are using AI more like a tutor and less like a vending machine. I’ll report back at semester’s end.',
    ],
  },
  {
    slug: 'robotics-regionals-recap',
    title: 'Regionals Recap: Zip Ties, Tears, and a Third-Place Trophy',
    date: '2026-04-05',
    readTime: '6 min read',
    tag: 'Robotics',
    image: '/images/blog-3.svg',
    excerpt:
      'Our robot lost a wheel in the quarterfinals. What the team did in the next eleven minutes is the proudest moment of my career.',
    body: [
      'Quarterfinals, match two. Our robot, affectionately named “Gary,” clips the wall and his left drive wheel goes rolling across the arena.',
      'We had eleven minutes before the next match. Nobody panicked. The build lead grabbed a spare hub, the programmer recalibrated the drive code for a slightly different wheel, and two sophomores fabricated a bracket from scrap aluminum.',
      'Gary made it to the semis and we left with third place. But the trophy isn’t what I’ll remember. I’ll remember a team that treated a disaster like a design problem.',
    ],
  },
  {
    slug: 'first-year-teacher-advice',
    title: 'Five Things I Wish I Knew My First Year Teaching CS',
    date: '2026-01-18',
    readTime: '7 min read',
    tag: 'Advice',
    image: '/images/blog-4.svg',
    excerpt:
      'Plan less, demo more, and always have a backup lesson that doesn’t need Wi-Fi.',
    body: [
      '1. The Wi-Fi will go down on the day you planned your most internet-dependent lesson. Always have an unplugged backup.',
      '2. Live-coding (and making mistakes on purpose) teaches more than any slide deck.',
      '3. The quiet kid in the back might be your strongest programmer. Check in with everyone.',
      '4. You don’t need to know everything. “Let’s find out together” is a great answer.',
      '5. Celebrate small wins loudly. A working “Hello, World” deserves applause.',
    ],
  },
]

export const pastClasses = [
  {
    years: '2022 – 2025',
    name: 'Intro to Programming with Python',
    school: 'Lakeview High School',
    description: 'A first-programming course for 9th graders. Retired when it merged into the new AP CSP pathway.',
  },
  {
    years: '2021 – 2024',
    name: 'Cybersecurity Fundamentals',
    school: 'Lakeview High School',
    description: 'Capture-the-flag challenges, cryptography, and ethical hacking. Students competed in CyberPatriot two years running.',
  },
  {
    years: '2019 – 2022',
    name: 'Mobile App Design',
    school: 'Lakeview High School',
    description: 'Students designed and built Android apps in MIT App Inventor and later React Native. Two apps landed on the Play Store.',
  },
  {
    years: '2016 – 2019',
    name: 'Digital Literacy & Computing',
    school: 'Maple Grove Middle School',
    description: 'A required 7th grade course covering typing, internet safety, spreadsheets, and a first taste of Scratch.',
  },
  {
    years: '2014 – 2016',
    name: 'Summer Code Camp Instructor',
    school: 'City Library Tech Lab',
    description: 'Week-long summer camps teaching kids ages 10–14 to build games and animations. Where the teaching bug first bit.',
  },
]

export const projects = [
  { title: 'Lunch Line Tracker', author: 'AP CSP, 2026', image: '/images/project-1.svg', blurb: 'A web app that estimates cafeteria wait times from student check-ins.' },
  { title: 'Gary the Robot', author: 'Robotics Team, 2026', image: '/images/project-2.svg', blurb: 'Third-place regional competition robot. Survived losing a wheel.' },
  { title: 'Pixel Dungeon Jam', author: 'Game Dev Club, 2025', image: '/images/project-3.svg', blurb: 'A roguelike built in 48 hours during our spring game jam.' },
  { title: 'Plant Buddy', author: 'Engineering, 2025', image: '/images/project-4.svg', blurb: 'An Arduino soil sensor that texts you when your plant is thirsty.' },
]

export const testimonials = [
  {
    quote: 'Mr. Zeigler made me believe I could actually code. Now I’m majoring in computer science.',
    name: 'Former student',
    role: 'Class of 2023',
  },
  {
    quote: 'My kid comes home talking about algorithms at dinner. I don’t understand any of it, but I love it.',
    name: 'Parent',
    role: 'Web Dev I family',
  },
  {
    quote: 'The most patient teacher I’ve ever had. He never made anyone feel dumb for asking a question.',
    name: 'Former student',
    role: 'Class of 2025',
  },
]

export const officeHours = [
  { day: 'Tuesday', time: '3:00 – 4:00 PM', place: 'Room 214' },
  { day: 'Thursday', time: '7:15 – 7:45 AM', place: 'Room 214' },
  { day: 'By appointment', time: 'Virtual', place: 'Email to schedule' },
]
