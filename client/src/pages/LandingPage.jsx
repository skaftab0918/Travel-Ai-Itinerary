import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const features = [
  { icon: "📄", title: "Upload Any Document", desc: "Flight tickets, hotel bookings, travel passes — PDF or image, we handle it all." },
  { icon: "🤖", title: "AI Extraction", desc: "Gemini AI reads your documents and pulls every booking detail automatically." },
  { icon: "🗺️", title: "Smart Itinerary", desc: "Get a day-by-day plan with local recommendations built around your actual bookings." },
  { icon: "🔗", title: "Share Anywhere", desc: "Generate a public link and share your itinerary with travel companions instantly." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="starfield" />
      <Navbar />

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-24 px-4 text-center">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute top-40 left-1/4 w-64 h-64 rounded-full opacity-8 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)", filter: "blur(60px)" }} />

        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#fcd34d" }}>
            ✨ Powered by Gemini 1.5 Flash
          </span>

          <h1 className="font-display text-5xl sm:text-7xl font-bold text-white leading-tight mb-6">
            Your bookings,<br />
            <span className="gradient-text">turned into a plan.</span>
          </h1>

          <p className="text-night-300 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Upload your flight tickets and hotel bookings. Trrip reads them and builds
            a beautiful, day-by-day travel itinerary in seconds.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">
              Plan my trip →
            </Link>
            <Link to="/login" className="btn-secondary text-base">
              Sign in
            </Link>
          </div>
        </div>

        {/* Floating document preview */}
        <div className="relative mt-20 max-w-2xl mx-auto animate-slide-up">
          <div className="card p-0 overflow-hidden" style={{ border: "1px solid rgba(245,158,11,0.15)" }}>
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-coral-400 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-amber-400 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-teal-400 opacity-70" />
              <div className="flex-1 mx-4 rounded-md py-1 px-3 text-xs text-night-400"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                trrip.live/itinerary/tokyo-adventure
              </div>
            </div>
            <div className="p-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🗾</span>
                <div>
                  <div className="text-white font-display font-semibold text-lg">Tokyo → Kyoto Adventure</div>
                  <div className="text-night-400 text-sm">7 days · Mar 15 – Mar 22, 2025</div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { day: "Day 1", title: "Arrival & Shibuya Nights", icon: "✈️", color: "#3b82f6" },
                  { day: "Day 2", title: "Senso-ji & Akihabara", icon: "⛩️", color: "#f59e0b" },
                  { day: "Day 3", title: "Harajuku & Meiji Shrine", icon: "🌸", color: "#f43f5e" },
                ].map((d) => (
                  <div key={d.day} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-base">{d.icon}</span>
                    <div className="flex-1">
                      <span className="text-xs font-medium" style={{ color: d.color }}>{d.day}</span>
                      <div className="text-sm text-night-200">{d.title}</div>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
                  </div>
                ))}
                <div className="text-center text-night-500 text-xs pt-1">+ 4 more days</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl text-white text-center mb-3">
            How it works
          </h2>
          <p className="text-night-400 text-center mb-14">Four steps from booking chaos to clarity.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className="card text-center group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-night-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-3xl text-white mb-4">Ready to plan smarter?</h2>
          <p className="text-night-400 mb-8">Free to use. No credit card required.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4">
            Start for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-night-500 text-xs">© 2025 Trrip · Built with Gemini AI</p>
      </footer>
    </div>
  );
}
