import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">LLearn</span>
        </Link>
        <nav className="ml-6 flex items-center gap-4 text-sm">
          <Link
            href="/learn"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Modules
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
