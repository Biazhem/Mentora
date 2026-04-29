import { data } from "@/config/data";
import { use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link"
import { Separator } from "@/components/ui/separator";

export default function OrganizationProfile({ params }) {
  const { slug } = use(params);

  // Transform mock data to find matching organization
  const NormalizeOrg = data.organizations.filter((item)=> item.id === Number(slug)); // [{}]
  const organization = NormalizeOrg[0]; // {...}

  const jobs = data.jobs.filter((item) => (item.org_index === Number(slug)));


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
        <div>
          <h1 className="text-3xl font-semibold">{organization.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Category: {organization.category}
          </p>
          <a href={organization.website} className="text-blue-500">
            {organization.website.replaceAll("https://", "")}
          </a>
          <br />
          <a href={"#"} className="text-orange-500">
            {organization.location}
          </a>
        </div>
      </div>
      <p className="mt-4 text-muted-foreground">{organization.description}</p>

      <Separator />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job,idx) => (
            <Link key={job.id} href={`/jobs/details?det=${idx+1}`}>
              <Card className="hover:shadow-sm transition w-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription className="text-sm">
                    <Link href={`/organizations/${job.companySlug}`}>
                      {job.company}
                    </Link>
                    , {job.location}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
                    {job.description}
                  </p>

                  <span className="inline-flex text-xs font-medium px-3 py-1 rounded-full bg-secondary">
                    {job.type}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
