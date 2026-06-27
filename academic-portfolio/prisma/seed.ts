import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.profile.deleteMany();
  await prisma.course.deleteMany();
  await prisma.researchLab.deleteMany();
  await prisma.project.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.leadership.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.award.deleteMany();
  await prisma.conference.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.book.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.galleryItem.deleteMany();

  await prisma.profile.create({
    data: {
      name: "Your Name",
      tagline: "Pre-law candidate · Psychology major · Aspiring forensic psychologist",
      bio: "Undergraduate researcher focused on the intersection of psychology and the law. Interested in eyewitness testimony, juvenile justice, and the legal system's use of psychological evidence.",
      email: "you@example.edu",
      linkedinUrl: "https://linkedin.com/in/your-handle",
      githubUrl: "https://github.com/your-handle",
      university: "State University",
      major: "Psychology, B.A.",
      minor: "Criminal Justice",
      expectedGrad: "May 2028",
    },
  });

  await prisma.course.createMany({
    data: [
      {
        code: "PSY 320",
        title: "Cognitive Psychology",
        semester: "Fall",
        year: 2025,
        credits: 3,
        instructor: "Dr. Maria Chen",
        description: "Survey of human cognition: attention, memory, language, decision-making.",
        topics: "Working memory; dual-process theories; metacognition; eyewitness memory; heuristics & biases",
        projects: "Replication of Loftus & Palmer (1974) eyewitness paradigm",
        papers: "Final paper: Source-monitoring failures in repeated retrieval (15 pp.)",
        finalGrade: "A",
        reflection:
          "This course reshaped how I think about memory as constructive rather than reproductive. The Loftus replication made me want to pursue eyewitness research seriously and shaped my honors thesis topic.",
        category: "Psychology",
      },
      {
        code: "CRJ 210",
        title: "Introduction to Criminal Law",
        semester: "Fall",
        year: 2025,
        credits: 3,
        instructor: "Prof. James Whitaker, J.D.",
        description: "Substantive criminal law: actus reus, mens rea, defenses, sentencing.",
        topics: "Model Penal Code; affirmative defenses; insanity standards; mitigation",
        projects: "Mock sentencing memo for a juvenile offender",
        papers: "Case brief portfolio (10 briefs)",
        finalGrade: "A-",
        reflection:
          "Doctrinal analysis is harder than it looks. I started seeing legal writing as its own genre and began drafting my own briefs for fun on the weekends.",
        category: "Law",
      },
      {
        code: "PSY 250",
        title: "Research Methods & Statistics",
        semester: "Spring",
        year: 2025,
        credits: 4,
        instructor: "Dr. Lin Park",
        description: "Experimental and quasi-experimental design with SPSS lab.",
        topics: "ANOVA; regression; effect sizes; pre-registration; replication crisis",
        projects: "Group study on framing effects (n=84)",
        papers: "APA-format empirical report",
        finalGrade: "A",
        reflection:
          "Pre-registration changed my view of research integrity. Running my first ANOVA in SPSS gave me confidence to lead analyses in lab.",
        category: "Psychology",
      },
      {
        code: "PHL 201",
        title: "Logic & Reasoning",
        semester: "Spring",
        year: 2025,
        credits: 3,
        instructor: "Dr. Elena Rios",
        description: "Formal and informal logic with applications to argumentation.",
        topics: "Truth tables; syllogisms; fallacies; LSAT-style logic games",
        projects: "Fallacy field journal",
        papers: "Analysis of a Supreme Court oral argument",
        finalGrade: "A",
        reflection:
          "Best preparation for LSAT logic games I could have asked for. Made me much sharper at spotting unsupported leaps in research papers.",
        category: "Pre-Law",
      },
      {
        code: "PSY 410",
        title: "Forensic Psychology",
        semester: "Fall",
        year: 2026,
        credits: 3,
        instructor: "Dr. Aisha Bell",
        description: "Application of psychological science to legal questions.",
        topics: "Competency to stand trial; risk assessment; false confessions; jury decision-making",
        projects: "Mock competency evaluation",
        papers: "Literature review: Reid technique and false confessions",
        finalGrade: "A",
        reflection:
          "Confirmed forensic psych as my path. The mock competency eval was the most challenging applied exercise I've done as an undergrad.",
        category: "Psychology",
      },
    ],
  });

  await prisma.researchLab.create({
    data: {
      name: "Memory & Law Lab",
      mentor: "Dr. Aisha Bell",
      startDate: "Aug 2025",
      endDate: undefined,
      role: "Undergraduate Research Assistant",
      questions:
        "How do post-event suggestions interact with retrieval practice to produce confident misremembering in eyewitnesses?",
      methods: "Qualtrics; SPSS; R (tidyverse, afex); coding of free-recall transcripts; IRB protocol drafting",
      responsibilities:
        "Recruit and run participants; clean and analyze data in R; co-author lit review sections; present at lab meetings",
      skills: "Qualitative coding; mixed-effects models; literature search (PsycINFO); APA writing",
      reflection:
        "First exposure to running a full study end-to-end. Learning to defend analytic choices in lab meetings has been the biggest growth area.",
    },
  });

  await prisma.project.createMany({
    data: [
      {
        title: "Loftus & Palmer Replication",
        course: "PSY 320",
        date: "Nov 2025",
        summary: "Classroom replication of the 1974 leading-question study on speed estimation.",
        goal: "Test whether verb framing (smashed vs. hit) shifts speed estimates in a modern sample.",
        method: "Between-subjects video paradigm with 5 verb conditions; n=72; one-way ANOVA in SPSS.",
        outcome: "Replicated original direction, smaller effect size (η²=.07). Wrote 12-page APA report.",
        skills: "Experimental design; SPSS; APA writing; effect-size interpretation",
      },
      {
        title: "Mock Sentencing Memo",
        course: "CRJ 210",
        date: "Dec 2025",
        summary: "Defense sentencing memorandum for a hypothetical 16-year-old offender.",
        goal: "Argue for downward departure under Miller v. Alabama factors.",
        method: "Case research via Westlaw; integrated developmental neuroscience evidence.",
        outcome: "Received highest grade in the section; instructor used as exemplar.",
        skills: "Legal research; persuasive writing; integrating psych into legal argument",
      },
    ],
  });

  await prisma.paper.createMany({
    data: [
      {
        title: "Source-Monitoring Failures Under Repeated Retrieval",
        type: "Research",
        course: "PSY 320",
        date: "Dec 2025",
        abstract:
          "Examines how repeated retrieval attempts inflate confidence in misattributed source information, with implications for eyewitness interviews.",
        keywords: "memory; source monitoring; eyewitness; retrieval",
        grade: "A",
      },
      {
        title: "Reid Technique and False Confessions: A Literature Review",
        type: "Literature Review",
        course: "PSY 410",
        date: "Nov 2026",
        abstract:
          "Synthesizes 30+ empirical studies on the Reid interrogation technique and its association with false confessions, with policy recommendations.",
        keywords: "interrogation; false confession; Reid; PEACE model",
        grade: "A",
      },
      {
        title: "Reflection: My First IRB Protocol",
        type: "Reflection",
        course: "Memory & Law Lab",
        date: "Oct 2025",
        abstract: "Personal reflection on drafting a Category 2 IRB protocol as an undergraduate.",
        keywords: "research ethics; IRB; reflection",
      },
    ],
  });

  await prisma.internship.create({
    data: {
      organization: "County Public Defender's Office",
      supervisor: "Hon. R. Estrada, Chief Public Defender",
      role: "Investigative Intern",
      startDate: "Jun 2026",
      endDate: "Aug 2026",
      responsibilities:
        "Sat in on client intake; summarized discovery materials; tracked motion deadlines; observed 14 court proceedings.",
      cases: "Misdemeanor arraignments; one juvenile transfer hearing; one motion to suppress",
      skills: "Legal writing; client interviewing; trauma-informed communication",
      reflection:
        "Watching the gap between what statutes say and how real courtrooms run reshaped how I think about access to counsel. Solidified my interest in juvenile defense.",
      hours: 320,
    },
  });

  await prisma.volunteer.createMany({
    data: [
      {
        organization: "Crisis Text Line",
        role: "Crisis Counselor",
        startDate: "Jan 2026",
        hours: 180,
        population: "Adolescents and young adults in mental-health crisis",
        skills: "Active listening; safety planning; trauma-informed support",
        reflection:
          "The training (~30 hours) gave me applied skills I never would have learned in a classroom. Reframed how I think about empathy at scale.",
      },
      {
        organization: "Innocence Project (Student Chapter)",
        role: "Case File Volunteer",
        startDate: "Sep 2025",
        hours: 60,
        population: "Wrongfully convicted clients",
        skills: "Records review; redaction; trial transcript analysis",
        reflection: "Made post-conviction work feel concrete rather than abstract.",
      },
    ],
  });

  await prisma.leadership.createMany({
    data: [
      {
        organization: "Pre-Law Society",
        position: "Vice President",
        startDate: "Aug 2026",
        accomplishments:
          "Grew membership from 42 to 78; launched monthly attorney lunch series; ran a 6-week LSAT logic study group.",
        projectsLed: "Annual mock-trial competition (24 competitors); J.D. application bootcamp.",
      },
      {
        organization: "Psychology Club",
        position: "Outreach Chair",
        startDate: "Aug 2025",
        endDate: "May 2026",
        accomplishments: "Partnered with NAMI for two campus events reaching ~300 students.",
        projectsLed: "Mental Health Awareness Week 2026.",
      },
    ],
  });

  await prisma.certification.createMany({
    data: [
      { name: "CITI Social & Behavioral Research", issuer: "CITI Program", date: "Aug 2025" },
      { name: "Mental Health First Aid", issuer: "National Council for Mental Wellbeing", date: "Sep 2025", expires: "Sep 2028" },
      { name: "Crisis Text Line Crisis Counselor", issuer: "Crisis Text Line", date: "Jan 2026" },
      { name: "HIPAA Privacy & Security", issuer: "University Compliance Office", date: "Aug 2025" },
      { name: "CPR / First Aid", issuer: "American Red Cross", date: "Jul 2025", expires: "Jul 2027" },
    ],
  });

  await prisma.award.createMany({
    data: [
      { title: "Dean's List", issuer: "College of Arts & Sciences", date: "Fall 2025", category: "Academic", description: "GPA 3.95+" },
      { title: "Dean's List", issuer: "College of Arts & Sciences", date: "Spring 2026", category: "Academic", description: "GPA 3.95+" },
      {
        title: "Undergraduate Research Grant",
        issuer: "Office of Undergraduate Research",
        date: "Sep 2026",
        category: "Research",
        description: "$1,500 to support honors thesis pilot study on eyewitness confidence.",
      },
      { title: "Psi Chi Honor Society", issuer: "Psi Chi", date: "Apr 2026", category: "Honor Society", description: "Inducted member." },
    ],
  });

  await prisma.conference.createMany({
    data: [
      {
        name: "Eastern Psychological Association Annual Meeting",
        location: "Boston, MA",
        date: "Mar 2026",
        role: "Poster Presenter",
        posterTitle: "Suggestibility After Spaced Retrieval: A Pilot",
        topics: "Memory; eyewitness; replication",
      },
      {
        name: "American Psychology-Law Society Conference",
        location: "San Diego, CA",
        date: "Mar 2027",
        role: "Attendee",
        topics: "Juvenile justice; false confessions; risk assessment",
      },
    ],
  });

  await prisma.skill.createMany({
    data: [
      { name: "SPSS", category: "Research", level: "Proficient" },
      { name: "R (tidyverse, afex)", category: "Research", level: "Working" },
      { name: "Python (pandas)", category: "Research", level: "Working" },
      { name: "Qualtrics", category: "Research", level: "Proficient" },
      { name: "NVivo", category: "Research", level: "Familiar" },
      { name: "APA Style", category: "Writing", level: "Proficient" },
      { name: "Legal Writing (IRAC)", category: "Writing", level: "Working" },
      { name: "Excel", category: "Technology", level: "Proficient" },
      { name: "Tableau", category: "Technology", level: "Familiar" },
      { name: "Public Speaking", category: "Communication", level: "Proficient" },
      { name: "Active Listening", category: "Communication", level: "Proficient" },
    ],
  });

  await prisma.book.createMany({
    data: [
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        category: "Behavioral Economics",
        rating: 5,
        dateRead: "Jul 2025",
        notes: "System 1 / System 2 framework; prospect theory.",
        takeaways: "Most legal decisions rely on heuristics. Anchoring is everywhere in sentencing.",
        favoriteQuote: "Nothing in life is as important as you think it is, while you are thinking about it.",
      },
      {
        title: "Just Mercy",
        author: "Bryan Stevenson",
        category: "Law",
        rating: 5,
        dateRead: "Aug 2025",
        notes: "Capital defense; Walter McMillian case.",
        takeaways: "The proximity principle: you cannot reform a system you stand far from.",
      },
      {
        title: "The Body Keeps the Score",
        author: "Bessel van der Kolk",
        category: "Psychology",
        rating: 4,
        dateRead: "Nov 2025",
        notes: "Trauma's embodied nature.",
        takeaways: "Trauma-informed defense work is not a soft skill; it's a clinical necessity.",
      },
    ],
  });

  await prisma.timelineEvent.createMany({
    data: [
      { title: "Started undergrad at State University", date: "Aug 2024", year: "Freshman", type: "Education", description: "Declared Psychology major, Criminal Justice minor." },
      { title: "Joined Psychology Club", date: "Sep 2024", year: "Freshman", type: "Leadership", description: "First exposure to department community." },
      { title: "First A in Research Methods", date: "May 2025", year: "Freshman", type: "Academic", description: "Completed PSY 250 with honors." },
      { title: "Joined Memory & Law Lab", date: "Aug 2025", year: "Sophomore", type: "Research", description: "Recruited by Dr. Bell after PSY 320." },
      { title: "Inducted into Psi Chi", date: "Apr 2026", year: "Sophomore", type: "Award", description: "Psychology national honor society." },
      { title: "Public Defender Internship", date: "Jun 2026", year: "Sophomore", type: "Internship", description: "320 hours over summer." },
      { title: "Vice President, Pre-Law Society", date: "Aug 2026", year: "Junior", type: "Leadership", description: "Elected after running on LSAT prep platform." },
      { title: "Poster at EPA Annual Meeting", date: "Mar 2026", year: "Sophomore", type: "Conference", description: "First academic conference presentation." },
    ],
  });

  await prisma.goal.createMany({
    data: [
      { title: "Maintain 3.9+ GPA", description: "Stay on Dean's List for Fall 2026 and Spring 2027.", category: "Semester", status: "Active" },
      { title: "Draft honors thesis proposal", description: "Complete IRB-ready proposal by end of Spring 2027.", category: "Semester", status: "Active" },
      { title: "Score 170+ on LSAT", description: "Targeting June 2027 administration.", category: "Long-term", status: "Active" },
      { title: "Apply to top-15 JD programs", description: "Application cycle Fall 2027.", category: "Long-term", status: "Active" },
      { title: "First peer-reviewed publication", description: "Co-author on lab manuscript currently under review.", category: "Long-term", status: "Active" },
    ],
  });

  console.log("Seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
