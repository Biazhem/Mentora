export default function OrganizationProfile({ params }) {
  const { slug } = params;

  const data = {
    technova: {
      name: "TechNova",
      description:
        "TechNova works with Mentora to offer internships, mentoring, and career guidance.",
      location: "Remote",
    },
    datasphere: {
      name: "DataSphere",
      description:
        "DataSphere focuses on analytics, data science projects, and mentoring.",
      location: "Islamabad",
    },
    innoworks: {
      name: "InnoWorks",
      description:
        "InnoWorks supports students entering startup ecosystems.",
      location: "Lahore",
    },
  };

  const org = data[slug];

  if (!org) {
    return <p className="p-6">Organization not found</p>;
  }

  return (
    <div className="max-w-4xl mx-aut py-12 px-4">
      <h1 className="text-3xl font-semibold">{org.name}</h1>
      <p className="mt-4 text-muted-foreground">{org.description}</p>
      <p className="mt-2 text-sm">Location: {org.location}</p>
    </div>
  );
}
