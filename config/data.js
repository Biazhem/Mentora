import { Building2 } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { Ticket } from "lucide-react";
import { Presentation } from "lucide-react";
import { CheckCheck } from "lucide-react";
import { Briefcase } from "lucide-react";
import { LayoutDashboard } from "lucide-react";

export const USER_ROLE = "mentors"; // "student" | "organization" | "mentors"

export const navItems = [
  { icon: LayoutDashboard, title: "Dashboard", url: "/dashboard" },
  { icon: Briefcase, title: "Jobs", url: "/job" },
  { icon: Building2, title: "Organizations", url: "/organization" },
  { icon: CheckCheck, title: "Tasks", url: "/tasks" },
  { icon: GraduationCap, title: "Mentors", url: "/mentors" },
  { icon: Presentation, title: "Meetings", url: "/discussion/meetings" },
  { icon: Ticket, title: "Events", url: "/events" },
]

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
      description:
        "We are looking for a frontend developer to build and maintain responsive user interfaces using React and modern JavaScript. You will work closely with product and design teams to turn requirements into reusable components, improve page performance, and deliver polished user experiences across desktop and mobile screens.",
      type: ["full-time"],
      timing: ["Flexible"],
    },
    {
      org_index: 1,
      title: "AI Engineer",
      description:
        "Join our AI team to design, train, and deploy machine learning models for real-world products. The role includes data preprocessing, model evaluation, experimentation with new architectures, and collaboration with backend engineers to integrate intelligent features into scalable production systems.",
      type: ["full-time"],
      timing: ["Immediate"],
    },
    {
      org_index: 2,
      title: "Backend Intern",
      description:
        "This internship is ideal for someone who wants hands-on backend experience with Node.js and APIs. You will assist in building REST endpoints, writing database queries, adding validation and error handling, and supporting testing and documentation efforts while learning production-grade development workflows.",
      type: ["internship"],
      timing: ["Flexible"],
    },
    {
      org_index: 3,
      title: "Full Stack Developer",
      description:
        "We need a full stack developer with strong MERN skills to deliver end-to-end features from UI to database. You will implement frontend views, backend services, authentication flows, and third-party integrations, while ensuring code quality, maintainability, and smooth collaboration with cross-functional teams.",
      type: ["contract"],
      timing: ["Immediate"],
    },
    {
      org_index: 0,
      title: "Python Developer",
      description:
        "Seeking a Python developer to build reliable APIs and automation services for internal and customer-facing tools. You will design clean application logic, optimize data access, integrate external services, and write maintainable tests and documentation to support continuous delivery and long-term platform stability.",
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
      content: "This intensive, project-driven boot camp transforms tech enthusiasts into production-ready AI Engineers. You will master foundational machine learning, design advanced deep learning networks, and build cutting-edge Generative AI applications.By blending rigorous theoretical frameworks with hands-on development, you will learn to train, optimize, and deploy intelligent systems that solve complex, real-world problems.",
      location: "Islamabad",
      start_date: "2026-04-20 10:00:00",
      end_date: "2026-04-20 12:00:00",
    },
    {
      org_index: 1,
      title: "AI Bootcamp",
      description: "Intro to AI",
      type: "Bootcamp",
      constent: "",
      location: "Lahore",
      start_date: "2026-05-01 09:00:00",
      end_date: "2026-05-03 17:00:00",
    },
    {
      org_index: 2,
      title: "Hackathon 2026",
      description: "Build cool projects",
      constent: "",
      type: "Hackathon",
      location: "Karachi",
      start_date: "2026-06-10 08:00:00",
      end_date: "2026-06-12 20:00:00",
    },
    {
      org_index: 3,
      title: "Startup Meetup",
      description: "Networking event",
      constent: "",
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

export const messages = [
  { type: "other", content: "Hey, good to see you online!", avatar: "HS", timestamp: "10:32 AM" },
  { type: "self", content: "Hello! What's up?", avatar: "AB", timestamp: "10:33 AM" },
  { type: "other", content: "Just checking in on the project status. Any updates?", avatar: "HS", timestamp: "10:34 AM" },
  { type: "self", content: "Yeah, finished the API integration. Testing now.", avatar: "AB", timestamp: "10:35 AM" },
  { type: "other", content: "Nice! Send over the repo link when ready.", avatar: "HS", timestamp: "10:36 AM" },
  { type: "self", content: "Here: github.com/your/repo. Pull request incoming.", avatar: "AB", timestamp: "10:37 AM" },
  { type: "other", content: "Looks good. One tweak: add error handling to the realtime subscription.", avatar: "HS", timestamp: "10:40 AM" },
  { type: "self", content: "On it. Supabase channel setup was tricky but sorted.", avatar: "AB", timestamp: "10:41 AM" },
  { type: "other", content: "Cool. Also, team meeting at 2 PM?", avatar: "HS", timestamp: "10:42 AM" },
  { type: "self", content: "Yep, confirmed. Bringing mock data for the members table.", avatar: "AB", timestamp: "10:43 AM" },
  { type: "other", content: "Perfect. See you then! 👍", avatar: "HS", timestamp: "10:44 AM" },
  { type: "self", content: "See you! 👋", avatar: "AB", timestamp: "10:45 AM" }
];
