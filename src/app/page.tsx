import Link from "next/link";
import { Pencil, Users, Download, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-foreground/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold">Whiteboard</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6">
        <section className="py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Think together,
            <br />
            in real time.
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto mb-8">
            A collaborative whiteboard for brainstorming, diagramming, and
            visual thinking. Draw, add sticky notes, and share with your team.
          </p>
          <Link
            href="/login"
            className="inline-flex px-6 py-3 bg-foreground text-background rounded-lg text-base font-medium hover:opacity-90 transition-opacity"
          >
            Start Drawing
          </Link>
        </section>

        {/* Features */}
        <section className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center mb-3">
              <Pencil className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1">Full Drawing Suite</h3>
            <p className="text-sm text-foreground/60">
              Freehand drawing, shapes, sticky notes, text, arrows, and image
              uploads.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1">Real-time Collaboration</h3>
            <p className="text-sm text-foreground/60">
              See your teammates&apos; cursors and changes as they happen.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1">Export as PNG</h3>
            <p className="text-sm text-foreground/60">
              Download your board as an image to share anywhere.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1">Instant Sharing</h3>
            <p className="text-sm text-foreground/60">
              Share a link and anyone can join your board.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-foreground/40">
          Built with Next.js, tldraw, PostgreSQL, and AWS.
        </div>
      </footer>
    </div>
  );
}
