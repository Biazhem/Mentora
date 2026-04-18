import { data } from "@/config/data";

export default function OrganizationProfile({ params }) {
  const { slug } = params;

  // Transform mock data to find matching organization
  const organization = data.organizations.find(
    (org) => org.name.toLowerCase().replace(/\s+/g, '-') === slug
  );

  if (!organization) {
    return <p className="p-6">Organization not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold">{organization.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Category: {organization.category}</p>
      <p className="mt-4 text-muted-foreground">{organization.description}</p>
      {organization.website && (
        <p className="mt-2 text-sm">
          Website: <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{organization.website}</a>
        </p>
      )}
    </div>
  );
}
