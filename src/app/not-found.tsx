"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Oops! This page doesn&apos;t exist.</p>
        <Link 
          href="/" 
          className="inline-block text-primary underline hover:text-primary/80 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

