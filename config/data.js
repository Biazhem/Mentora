export const USER_ROLE = "student"; // "student" | "organization" | "mentors"

export const data = {
  organizations: [
    {
      id: 1,
      name: "Acme Inc",
      description: "A computer science research company",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlhthkE1qWPdzA3HWzdIifMnqqtuwEY_47Bw&s",
      website: "https://acme.com",
      category: "Information Technology",
      location: "Islamabad, G-11",
    },
    {
      id: 2,
      name: "TechNova",
      logo: "https://cdn.dribbble.com/userupload/26694182/file/original-dc8c625e7aadcaec7cc34cd02b6ea171.jpg?format=webp&resize=400x300&vertical=center",
      description: "AI and cloud solutions",
      website: "https://technova.com",
      category: "Artificial Intelligence",
      location: "Islamabad, G-11",
    },
    {
      id: 3,
      name: "DevHub",
      logo: "https://cdn.dribbble.com/userupload/43761307/file/original-720c2a63362bf463692b662538e1bf78.png?format=webp&resize=400x300&vertical=center",
      description: "Developer community and tools",
      website: "https://devhub.com",
      category: "Software",
      location: "Islamabad, G-11",
    },
    {
      id: 4,
      logo: "https://images-platform.99static.com//7wYjfbypjySr9H_-VguhTcjPukg=/720x1171:1223x1674/fit-in/500x500/99designs-contests-attachments/115/115106/attachment_115106589",
      name: "InnoSoft",
      description: "Startup building SaaS products",
      website: "https://innosoft.com",
      category: "SaaS",
      location: "Islamabad, G-11",
    },
  ],

  jobs: [
    {
      org_index: 1,
      title: "Frontend Developer",
      description: "React developer needed",
      type: ["full-time"],
      timing: ["Flexible"],
    },
    {
      org_index: 1,
      title: "AI Engineer",
      description: "Work on ML models",
      type: ["full-time"],
      timing: ["Immediate"],
    },
    {
      org_index: 2,
      title: "Backend Intern",
      description: "Node.js internship",
      type: ["internship"],
      timing: ["Flexible"],
    },
    {
      org_index: 3,
      title: "Full Stack Developer",
      description: "MERN stack role",
      type: ["contract"],
      timing: ["Immediate"],
    },
    {
      org_index: 0,
      title: "Python Developer",
      description: "API development",
      type: ["part-time"],
      timing: ["Flexible"],
    },
  ],

  events: [
    {
      org_index: 0,
      title: "React Webinar",
      description: "Learn React basics",
      type: "Webinar",
      location: "Islamabad",
      start_date: "2026-04-20 10:00:00",
      end_date: "2026-04-20 12:00:00",
    },
    {
      org_index: 1,
      title: "AI Bootcamp",
      description: "Intro to AI",
      type: "Bootcamp",
      location: "Lahore",
      start_date: "2026-05-01 09:00:00",
      end_date: "2026-05-03 17:00:00",
    },
    {
      org_index: 2,
      title: "Hackathon 2026",
      description: "Build cool projects",
      type: "Hackathon",
      location: "Karachi",
      start_date: "2026-06-10 08:00:00",
      end_date: "2026-06-12 20:00:00",
    },
    {
      org_index: 3,
      title: "Startup Meetup",
      description: "Networking event",
      type: "Meetup",
      location: "Islamabad",
      start_date: "2026-04-25 18:00:00",
      end_date: "2026-04-25 21:00:00",
    },
  ],
  mentors: [
    {
      pic: "https://xsgames.co/randomusers/avatar.php?g=male&u=1",
      name: "Ali Khan",
      bio: "Full stack engineer and mentor",
      expertise: ["JavaScript", "React"],
      experience: [
        { title: "Senior Developer", institute: "TechNova", years: 4 },
      ],
    },
    {
      pic: "https://xsgames.co/randomusers/avatar.php?g=female&u=1",
      name: "Sara Ahmed",
      bio: "AI engineer",
      expertise: ["Machine Learning", "Python"],
      experience: [{ title: "ML Engineer", institute: "InnoSoft", years: 3 }],
    },
    {
      pic: "https://xsgames.co/randomusers/avatar.php?g=male&u=2",
      name: "Usman Tariq",
      bio: "Backend specialist",
      expertise: ["Node.js", "Databases"],
      experience: [{ title: "Backend Dev", institute: "DevHub", years: 5 }],
    },
    {
      pic: "https://xsgames.co/randomusers/avatar.php?g=female&u=2",
      name: "Hina Malik",
      bio: "Cloud architect",
      expertise: ["AWS", "DevOps"],
      experience: [
        { title: "Cloud Engineer", institute: "Acme Inc", years: 6 },
      ],
    },
  ],
};

export const JobTypes = [
  "full-time",
  "part-time",
  "freelance",
  "internship",
  "temporary",
  "contract",
];

export const TimingTypes = ["Immediate", "Flexible"];

export const EventTypes = [
  "Workshop",
  "Webinar",
  "Conference",
  "Bootcamp",
  "Hackathon",
  "Seminar",
  "Meetup",
  "Networking",
];

export const participants = [
  { id: 1, name: "You", isMuted: false, isSpeaking: true },
  { id: 2, name: "Sarah", isMuted: false, isSpeaking: false },
  { id: 3, name: "Mike", isMuted: true, isSpeaking: false },
  { id: 4, name: "Emma", isMuted: false, isSpeaking: false },
  { id: 5, name: "Alex", isMuted: false, isSpeaking: true },
  { id: 6, name: "Lisa", isMuted: true, isSpeaking: false },
];


export const tasks = [
  {
    id: 1,
    title: "Build Login Page",
    description:
      "Create a responsive login page with email and password fields, validation, error handling, and integration with authentication API. Ensure proper UI feedback and loading states.",
    status: "In Progress",
    startDate: "2026-02-01",
    dueDate: "2026-02-10",
  },
  {
    id: 2,
    title: "Resume Analyzer Integration",
    description:
      "Integrate resume parsing API to analyze uploaded CVs. Extract skills, experience, and education data, then display structured insights to users in a clean dashboard format.",
    status: "Pending",
    startDate: "2026-02-05",
    dueDate: "2026-02-15",
  },
  {
    id: 3,
    title: "Final Project Report",
    description:
      "Prepare and submit the final project report including system design, implementation details, screenshots, and testing results. Follow proper formatting and documentation standards.",
    status: "Completed",
    startDate: "2026-01-10",
    dueDate: "2026-01-25",
  },
  {
    id: 4,
    title: "Dashboard UI Design",
    description:
      "Design and implement the main dashboard interface with charts, stats cards, and recent activity. Focus on clean layout, responsiveness, and usability.",
    status: "In Progress",
    startDate: "2026-02-08",
    dueDate: "2026-02-18",
  },
  {
    id: 5,
    title: "API Optimization",
    description:
      "Improve backend API performance by reducing response time, optimizing queries, and adding caching where necessary. Test endpoints under load.",
    status: "Pending",
    startDate: "2026-02-12",
    dueDate: "2026-02-20",
  },
];