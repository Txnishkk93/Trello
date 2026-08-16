import { ArrowRight, Zap, Users, LayoutGrid, CheckCircle, Rocket, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

const features = [
  {
    icon: LayoutGrid,
    title: "Kanban Boards",
    description: "Organize work with intuitive boards, sections, and issues. Visualize progress at a glance.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite members, assign issues, and keep everyone on the same page across organizations.",
  },
  {
    icon: Zap,
    title: "Fast & Responsive",
    description: "Lightning-fast performance with real-time updates. Built for teams that move quickly.",
  },
  {
    icon: CheckCircle,
    title: "Issue Management",
    description: "Create, track, and manage issues with full descriptions and team assignments.",
  },
  {
    icon: Users,
    title: "Multi-Org Support",
    description: "Manage multiple organizations with role-based access control and member management.",
  },
  {
    icon: Rocket,
    title: "Ready to Scale",
    description: "Production-ready infrastructure designed to grow with your team's needs.",
  },
];

const stats = [
  { value: "100%", label: "Feature Complete" },
  { value: "0ms", label: "Latency" },
  { value: "∞", label: "Scalability" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-canvas to-canvas/95">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-line/50 bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent2">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-ink">Flow</span>
          </div>

          <nav className="hidden gap-8 md:flex">
            <a href="#features" className="text-sm text-ink2 transition-colors hover:text-accent">
              Features
            </a>
            <a href="#why" className="text-sm text-ink2 transition-colors hover:text-accent">
              Why Flow
            </a>
            <a href="#stats" className="text-sm text-ink2 transition-colors hover:text-accent">
              Stats
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          {/* Background gradient elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute right-0 top-1/3 w-96 h-96 bg-accent2/10 rounded-full blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-ink">Built for modern teams</span>
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-ink sm:text-6xl">
              Project management{" "}
              <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
                made simple
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink2">
              Keep your team organized with Kanban boards, intuitive issue tracking, and seamless collaboration. 
              No chaos, no complexity—just flow.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup">
                <Button variant="primary" size="md" className="w-full sm:w-auto transform transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-accent/30">
                  <Rocket className="h-4 w-4" />
                  Start Free
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="md" className="w-full sm:w-auto transform transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-accent2/30">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>

            {/* Hero Image/Mockup */}
            <div className="mt-20 rounded-2xl border border-line bg-surface/50 p-4 backdrop-blur-sm sm:p-6">
              <div className="rounded-xl bg-gradient-to-b from-surface to-surface2 p-6 sm:p-8">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Section Column */}
                  <div className="rounded-lg border border-line2 bg-surface p-4">
                    <div className="mb-3 inline-block rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent">
                      To Do
                    </div>
                    <div className="space-y-3">
                      <div className="rounded border border-line2 bg-surface2 p-3 text-sm text-ink">
                        Design landing page
                      </div>
                      <div className="rounded border border-line2 bg-surface2 p-3 text-sm text-ink">
                        Setup database schema
                      </div>
                      <button className="w-full rounded border border-dashed border-line2 py-2 text-xs text-ink3 transition-colors hover:text-ink2">
                        + Add issue
                      </button>
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="rounded-lg border border-line2 bg-surface p-4">
                    <div className="mb-3 inline-block rounded-full bg-accent2/20 px-2.5 py-1 text-xs font-semibold text-accent2">
                      In Progress
                    </div>
                    <div className="space-y-3">
                      <div className="rounded border border-accent2/30 bg-accent2/5 p-3 text-sm text-ink">
                        Build API endpoints
                      </div>
                      <button className="w-full rounded border border-dashed border-line2 py-2 text-xs text-ink3 transition-colors hover:text-ink2">
                        + Add issue
                      </button>
                    </div>
                  </div>

                  {/* Done Column */}
                  <div className="rounded-lg border border-line2 bg-surface p-4">
                    <div className="mb-3 inline-block rounded-full bg-success/20 px-2.5 py-1 text-xs font-semibold text-success">
                      Done
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 rounded border border-success/30 bg-success/5 p-3 text-sm text-ink">
                        <CheckCircle className="h-4 w-4 text-success" />
                        User authentication
                      </div>
                      <div className="flex items-center gap-2 rounded border border-success/30 bg-success/5 p-3 text-sm text-ink">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Organization setup
                      </div>
                      <button className="w-full rounded border border-dashed border-line2 py-2 text-xs text-ink3 transition-colors hover:text-ink2">
                        + Add issue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-ink sm:text-5xl">
                Everything you need to
                <br />
                <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
                  stay organized
                </span>
              </h2>
              <p className="mt-4 text-lg text-ink2">
                Built with teams in mind. Everything from small startups to large enterprises.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-lg border border-line bg-surface/50 p-8 transition-all duration-300 hover:bg-surface hover:border-accent/50"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{feature.title}</h3>
                    <p className="mt-2 text-ink2">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-surface2 p-12">
              <div className="grid gap-8 md:grid-cols-3 text-center">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-4xl font-bold bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent sm:text-5xl">
                      {stat.value}
                    </div>
                    <p className="mt-2 text-ink2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Flow Section */}
        <section id="why" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-4xl font-bold text-ink text-center sm:text-5xl mb-16">
              Why teams choose Flow
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-surface/50 p-8">
                <h3 className="text-xl font-semibold text-ink mb-4"> Lightning Fast</h3>
                <p className="text-ink2">
                  Built with React and modern web technologies. Real-time updates keep your team in sync without delays.
                </p>
              </div>

              <div className="rounded-lg border border-line bg-surface/50 p-8">
                <h3 className="text-xl font-semibold text-ink mb-4"> Secure & Reliable</h3>
                <p className="text-ink2">
                  JWT authentication, role-based access control, and PostgreSQL database ensure your data is safe.
                </p>
              </div>

              <div className="rounded-lg border border-line bg-surface/50 p-8">
                <h3 className="text-xl font-semibold text-ink mb-4"> Built for Teams</h3>
                <p className="text-ink2">
                  Multi-organization support, member management, and issue assignments make collaboration seamless.
                </p>
              </div>

              <div className="rounded-lg border border-line bg-surface/50 p-8">
                <h3 className="text-xl font-semibold text-ink mb-4"> Scale with Ease</h3>
                <p className="text-ink2">
                  Designed to grow with your team. Manage unlimited organizations, boards, and team members.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-0 top-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-accent2/5 rounded-full blur-3xl" />
          </div>

          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Ready to get started?
            </h2>
            <p className="mt-6 text-lg text-ink2">
              Join teams already using Flow to stay organized and ship faster.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup">
                <Button variant="primary" size="md" className="w-full sm:w-auto transform transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-accent/30">
                  <Rocket className="h-4 w-4" />
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="md" className="w-full sm:w-auto transform transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-accent2/30">
                  Already have an account?
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent2">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-ink">Flow</span>
            </div>

            <p className="text-sm text-ink3">
              © 2026 Flow. A modern project management tool for teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

