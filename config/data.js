export const data = {
  organizations: [
    {
      name: "Acme Inc",
      description: "A computer science research company",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlhthkE1qWPdzA3HWzdIifMnqqtuwEY_47Bw&s",
      website: "https://acme.com",
      category: "Information Technology",
    },
    {
      name: "TechNova",
      logo: "https://cdn.dribbble.com/userupload/26694182/file/original-dc8c625e7aadcaec7cc34cd02b6ea171.jpg?format=webp&resize=400x300&vertical=center",
      description: "AI and cloud solutions",
      website: "https://technova.com",
      category: "Artificial Intelligence",
    },
    {
      name: "DevHub",
      logo: "https://cdn.dribbble.com/userupload/43761307/file/original-720c2a63362bf463692b662538e1bf78.png?format=webp&resize=400x300&vertical=center",
      description: "Developer community and tools",
      website: "https://devhub.com",
      category: "Software",
    },
    {
      logo: "https://images-platform.99static.com//7wYjfbypjySr9H_-VguhTcjPukg=/720x1171:1223x1674/fit-in/500x500/99designs-contests-attachments/115/115106/attachment_115106589",
      name: "InnoSoft",
      description: "Startup building SaaS products",
      website: "https://innosoft.com",
      category: "SaaS",
    },
  ],
  
  jobs: [
    {
      org_index: 0,
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

  tasks: [],
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
