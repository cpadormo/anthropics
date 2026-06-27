export type FieldType = "text" | "textarea" | "number" | "url" | "select" | "file" | "json-array";

export type EntityField = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  hint?: string;
  accept?: string;
};

export type EntityConfig = {
  key: string;
  label: string;
  plural: string;
  listUrl: string;
  prismaModel:
    | "profile"
    | "course"
    | "researchLab"
    | "project"
    | "paper"
    | "internship"
    | "volunteer"
    | "leadership"
    | "certification"
    | "award"
    | "conference"
    | "skill"
    | "book"
    | "timelineEvent"
    | "goal"
    | "galleryItem";
  fields: EntityField[];
};

const linesHelp = "One item per line.";

export const entities: Record<string, EntityConfig> = {
  profile: {
    key: "profile",
    label: "Profile",
    plural: "Profile",
    listUrl: "/admin",
    prismaModel: "profile",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "tagline", label: "Tagline", type: "text", required: true },
      { name: "bio", label: "Bio", type: "textarea", required: true },
      { name: "email", label: "Email", type: "text", required: true },
      { name: "university", label: "University", type: "text", required: true },
      { name: "major", label: "Major", type: "text", required: true },
      { name: "minor", label: "Minor", type: "text" },
      { name: "expectedGrad", label: "Expected Graduation", type: "text" },
      { name: "linkedinUrl", label: "LinkedIn URL", type: "url" },
      { name: "githubUrl", label: "GitHub URL", type: "url" },
      { name: "resumePdfUrl", label: "Resume PDF", type: "file", accept: "application/pdf" },
      { name: "cvPdfUrl", label: "CV PDF", type: "file", accept: "application/pdf" },
    ],
  },
  course: {
    key: "course",
    label: "Course",
    plural: "Courses",
    listUrl: "/coursework",
    prismaModel: "course",
    fields: [
      { name: "code", label: "Course code", type: "text", required: true, placeholder: "PSY 320" },
      { name: "title", label: "Course title", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ["Psychology", "Law", "Pre-Law", "Research", "General Education", "Elective", "General"],
        required: true,
      },
      {
        name: "semester",
        label: "Semester",
        type: "select",
        options: ["Fall", "Spring", "Summer", "Winter"],
        required: true,
      },
      { name: "year", label: "Year", type: "number", required: true, placeholder: "2026" },
      { name: "credits", label: "Credits", type: "number", required: true },
      { name: "instructor", label: "Instructor", type: "text", required: true },
      { name: "description", label: "Course description", type: "textarea", required: true },
      { name: "topics", label: "Important topics", type: "textarea", help: linesHelp },
      { name: "projects", label: "Projects completed", type: "textarea", help: linesHelp },
      { name: "papers", label: "Research papers written", type: "textarea", help: linesHelp },
      { name: "finalGrade", label: "Final grade", type: "text", placeholder: "A" },
      { name: "reflection", label: "Reflection", type: "textarea", required: true },
      { name: "syllabusUrl", label: "Syllabus PDF", type: "file", accept: "application/pdf" },
    ],
  },
  lab: {
    key: "lab",
    label: "Research lab",
    plural: "Research labs",
    listUrl: "/research",
    prismaModel: "researchLab",
    fields: [
      { name: "name", label: "Lab name", type: "text", required: true },
      { name: "mentor", label: "Faculty mentor", type: "text", required: true },
      { name: "startDate", label: "Start date", type: "text", required: true, placeholder: "Aug 2025" },
      { name: "endDate", label: "End date", type: "text", placeholder: "Leave blank if ongoing" },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "questions", label: "Research questions", type: "textarea", required: true },
      { name: "methods", label: "Methods learned", type: "textarea", help: linesHelp },
      { name: "responsibilities", label: "Responsibilities", type: "textarea", help: linesHelp },
      { name: "skills", label: "Skills gained", type: "textarea", help: linesHelp },
      { name: "reflection", label: "Reflection", type: "textarea", required: true },
    ],
  },
  project: {
    key: "project",
    label: "Project",
    plural: "Projects",
    listUrl: "/projects",
    prismaModel: "project",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "course", label: "Course (optional)", type: "text" },
      { name: "date", label: "Date", type: "text", required: true, placeholder: "Nov 2025" },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "goal", label: "Goal", type: "textarea", required: true },
      { name: "method", label: "Method", type: "textarea", required: true },
      { name: "outcome", label: "Outcome", type: "textarea", required: true },
      { name: "skills", label: "Skills learned", type: "textarea", help: linesHelp },
    ],
  },
  paper: {
    key: "paper",
    label: "Paper",
    plural: "Writing",
    listUrl: "/writing",
    prismaModel: "paper",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: ["Research", "Literature Review", "Legal Analysis", "Case Study", "Essay", "Reflection", "Capstone"],
        required: true,
      },
      { name: "course", label: "Course", type: "text" },
      { name: "date", label: "Date", type: "text", required: true },
      { name: "abstract", label: "Abstract", type: "textarea", required: true },
      { name: "keywords", label: "Keywords", type: "textarea", help: "Comma- or newline-separated." },
      { name: "grade", label: "Grade (optional)", type: "text" },
      { name: "pdfUrl", label: "PDF", type: "file", accept: "application/pdf" },
    ],
  },
  internship: {
    key: "internship",
    label: "Internship",
    plural: "Internships",
    listUrl: "/internships",
    prismaModel: "internship",
    fields: [
      { name: "organization", label: "Organization", type: "text", required: true },
      { name: "supervisor", label: "Supervisor", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "startDate", label: "Start date", type: "text", required: true },
      { name: "endDate", label: "End date", type: "text" },
      { name: "responsibilities", label: "Responsibilities", type: "textarea", help: linesHelp, required: true },
      { name: "cases", label: "Cases observed", type: "textarea" },
      { name: "skills", label: "Skills", type: "textarea", help: linesHelp },
      { name: "reflection", label: "Reflection", type: "textarea", required: true },
      { name: "hours", label: "Total hours", type: "number", required: true },
      { name: "recLetterUrl", label: "Recommendation letter", type: "file", accept: "application/pdf" },
    ],
  },
  volunteer: {
    key: "volunteer",
    label: "Volunteer entry",
    plural: "Volunteer",
    listUrl: "/volunteer",
    prismaModel: "volunteer",
    fields: [
      { name: "organization", label: "Organization", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "startDate", label: "Start date", type: "text", required: true },
      { name: "endDate", label: "End date", type: "text" },
      { name: "hours", label: "Total hours", type: "number", required: true },
      { name: "population", label: "Population served", type: "text", required: true },
      { name: "skills", label: "Skills developed", type: "textarea", help: linesHelp },
      { name: "reflection", label: "Reflection", type: "textarea", required: true },
    ],
  },
  leadership: {
    key: "leadership",
    label: "Leadership role",
    plural: "Leadership",
    listUrl: "/leadership",
    prismaModel: "leadership",
    fields: [
      { name: "organization", label: "Organization", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "startDate", label: "Start date", type: "text", required: true },
      { name: "endDate", label: "End date", type: "text" },
      { name: "accomplishments", label: "Accomplishments", type: "textarea", help: linesHelp, required: true },
      { name: "projectsLed", label: "Projects led", type: "textarea", help: linesHelp },
    ],
  },
  cert: {
    key: "cert",
    label: "Certification",
    plural: "Certifications",
    listUrl: "/certifications",
    prismaModel: "certification",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "issuer", label: "Issuer", type: "text", required: true },
      { name: "date", label: "Date earned", type: "text", required: true },
      { name: "expires", label: "Expires", type: "text" },
      { name: "credentialUrl", label: "Credential URL", type: "url" },
    ],
  },
  award: {
    key: "award",
    label: "Award",
    plural: "Awards",
    listUrl: "/awards",
    prismaModel: "award",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "issuer", label: "Issuer", type: "text", required: true },
      { name: "date", label: "Date", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ["Academic", "Research", "Scholarship", "Honor Society", "Competition", "Service"],
        required: true,
      },
      { name: "description", label: "Description", type: "textarea", required: true },
    ],
  },
  conference: {
    key: "conference",
    label: "Conference",
    plural: "Conferences",
    listUrl: "/conferences",
    prismaModel: "conference",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "date", label: "Date", type: "text", required: true },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: ["Attendee", "Poster Presenter", "Speaker", "Panelist", "Volunteer"],
        required: true,
      },
      { name: "posterTitle", label: "Poster title", type: "text" },
      { name: "presentationTitle", label: "Presentation title", type: "text" },
      { name: "topics", label: "Topics / research discussed", type: "textarea", help: linesHelp },
    ],
  },
  skill: {
    key: "skill",
    label: "Skill",
    plural: "Skills",
    listUrl: "/skills",
    prismaModel: "skill",
    fields: [
      { name: "name", label: "Skill", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ["Research", "Writing", "Technology", "Communication", "Languages"],
        required: true,
      },
      {
        name: "level",
        label: "Level",
        type: "select",
        options: ["Familiar", "Working", "Proficient", "Advanced"],
        required: true,
      },
      { name: "notes", label: "Notes", type: "text" },
    ],
  },
  book: {
    key: "book",
    label: "Book",
    plural: "Reading log",
    listUrl: "/reading",
    prismaModel: "book",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "author", label: "Author", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ["Psychology", "Law", "Criminology", "Behavioral Economics", "Memoir", "Other"],
        required: true,
      },
      { name: "rating", label: "Rating (1-5)", type: "number", required: true },
      { name: "dateRead", label: "Date finished", type: "text", required: true },
      { name: "notes", label: "Notes", type: "textarea", required: true },
      { name: "takeaways", label: "Takeaways", type: "textarea", required: true },
      { name: "favoriteQuote", label: "Favorite quote", type: "textarea" },
    ],
  },
  timeline: {
    key: "timeline",
    label: "Timeline event",
    plural: "Timeline",
    listUrl: "/timeline",
    prismaModel: "timelineEvent",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "date", label: "Date", type: "text", required: true },
      {
        name: "year",
        label: "Year of study",
        type: "select",
        options: ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
        required: true,
      },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: ["Education", "Research", "Internship", "Conference", "Award", "Leadership", "Volunteer", "Academic", "Publication"],
        required: true,
      },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "link", label: "Related link", type: "url" },
    ],
  },
  goal: {
    key: "goal",
    label: "Goal",
    plural: "Goals",
    listUrl: "/goals",
    prismaModel: "goal",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ["Semester", "Long-term", "Graduate School", "Research", "Personal"],
        required: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Active", "Completed", "Paused"],
        required: true,
      },
      { name: "targetDate", label: "Target date", type: "text" },
    ],
  },
  gallery: {
    key: "gallery",
    label: "Photo",
    plural: "Gallery",
    listUrl: "/gallery",
    prismaModel: "galleryItem",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "caption", label: "Caption", type: "text" },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ["Conference", "Lab", "Presentation", "Volunteer", "Campus", "Other"],
        required: true,
      },
      { name: "date", label: "Date", type: "text", required: true },
      { name: "imageUrl", label: "Image", type: "file", required: true, accept: "image/*" },
    ],
  },
};

export const entityList = Object.values(entities);
