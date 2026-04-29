

import { use } from "react";

export default function Page({ params }) {
  const { id } = use(params);

  return(<>
    {id} hello
    </>);
}
