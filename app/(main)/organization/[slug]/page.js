import { data } from "@/config/data";
import { use } from "react";
import { Separator } from "@heroui/react";
import { JobDrawer } from "@/components/custom/drawer-jobs";

export default function OrganizationProfile({ params }) {
  const { slug } = use(params);

  const NormalizeOrg = data.organizations.filter(
    (item) => item.id === Number(slug),
  ); // [{}]
  const organization = NormalizeOrg[0];

  const jobs = data.jobs.filter((item) => item.org_index === Number(slug));

  if (!organization) {
    return <p className="p-6">Organization not found</p>;
  }

  return (
    <div className="py-12 px-4">
      <div className=" w-full flex gap-3">
        <div className="w-32 h-32 rounded-md overflow-hidden bg-gray-100 shrink">
          <img
            src={organization.logo}
            alt={organization.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">{organization.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Category: {organization.category}
          </p>
          <a href={organization.website} className="text-blue-500">
            {organization.website}
          </a>
          <a href={"#"} className="text-orange-500">
            {organization.location}
          </a>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="space-y-1 min-h-32">
        <h1 className="text-2xl font-bold">About</h1>
        <p>
          {organization.description}
        </p>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <div className="grid gap-6 md:grid-cols-3">
          {jobs.map((job, idx) => (
            <JobDrawer key={idx} job={job} showImage={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
