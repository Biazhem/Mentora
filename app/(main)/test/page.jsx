"use client"

import { useOrgSelectorStore } from "@/stores/org-selector";
function Button1({ title, children }) {
  return <button className=" p-2 bg-blue-200">{children}</button>;
}
export default function Page() {
  const Org = useOrgSelectorStore((s) => s.selectedOrganizationId);
  return (
    <>
      <Button1>hello</Button1>
      <Button1>hello 3<span className="text-red-500">35</span></Button1>
      {JSON.stringify(Org)}
    </>
  );
}
