"use client"

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"

export default function SSOCallbackPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="flex flex-col items-center gap-4">
        {/* Simple visual loader while Clerk completes the handshake */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="text-center">
          <p className="text-sm font-medium">Verifying your credentials...</p>
          <p className="text-xs text-muted-foreground mt-1">Completing secure sign-in</p>
        </div>
      </div>
      
      {/* 
        This is the magic Clerk component. It reads the query parameters 
        (like sign_in_force_redirect_url) automatically, finishes the 
        SSO login loop, and then pushes the user to your custom database sync page.
      */}
      <AuthenticateWithRedirectCallback />
    </div>
  )
}