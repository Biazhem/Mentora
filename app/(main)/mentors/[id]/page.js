"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page({ params }) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/profile/mentor/${id}`);
  }, [id, router]);

  return null;
}
