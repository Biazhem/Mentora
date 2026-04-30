

import { use } from "react";

export default function Page({ params }) {
  const { id } = use(params);

  console.log()
  return(<>
    {id} hello
    </>);
}
