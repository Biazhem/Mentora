"use client"
import { SignInButton } from "@clerk/nextjs"

export default function Page(){

    return(
        <>
        <SignInButton forceRedirectUrl="http://localhost:3000/survey"/>
        </>
    )
}