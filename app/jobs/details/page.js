"use client"

import { useSearchParams } from "next/navigation"

export default function Page(){
    const search = useSearchParams();
    const id = search.get("det")
    return(
        <div className="w-full p-2">
            {id}
        </div>
    )
}