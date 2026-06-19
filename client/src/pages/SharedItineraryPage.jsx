import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSharedItinerary } from "../services/api";

const EVENT_STYLES = {
  flight:    { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)",  color: "#93c5fd" },
  hotel:     { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)",  color: "#6ee7b7" },
  activity:  { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)",  color: "#fcd34d" },
  transport: { bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.25)",  color: "#c4b5fd" },
  meal:      { bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.25)",   color: "#fda4af" },
  other:     { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", color: "#94a3b8" },
};

const DaySection = ({ day, index }) => {
  const [expanded, setExpanded] = useState(index === 0);
  return (
    <div className="card animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 text-left"
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(244,63,94,0.15))", border: "1px solid rgba(245,158,11,0.2)" }}>
          <span className="text-xs text-amber-400 font-medium leading-none">Day</span>
          <span className="text-lg font-display text-white leading-tight">{day.dayNumber || index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base text-white leading-snug mb-0.5">{day.title}</h3>
          <p className="text-xs text-night-400 flex items-center gap-2">
            {day.city && <span>📍 {day.city}</span>}
            {day.date && <span>{day.date}</span>}
          </p>
        </div>
        <span className="text-night-400 transition-transform duration-200 flex-shrink-0"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>

      {expanded && day.events?.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/5 space-y-1 animate-fade-in">
          {day.events.map((event, i) => {
            const style = EVENT_STYLES[event.type] || EVENT_STYLES.other;
            const isLast = i === day.events.length - 1;
            return (
              <div key={i} className="relative flex gap-4 pb-5">
                {!isLast && (
                  <div className="absolute left-5 top-10 bottom-0 w-px"
                    style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.07), transparent)" }} />
                )}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg z-10"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                  {event.icon || "📍"}
                </div>
                <div className="flex-1 pt-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-sm font-medium text-white leading-snug">{event.title}</h4>
                    {event.time && (
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                        {event.time}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-xs text-night-400 leading-relaxed mb-2">{event.description}</p>
                  )}
                  {event.location && (
                    <span className="text-xs text-night-500 flex items-center gap-1">
                      <span>📍</span> {event.location}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function SharedItineraryPage() {
  const { token } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSharedItinerary(token)
      .then(res => setItinerary(res.data.itinerary))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="starfield" />
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
        <div className="starfield" />
        <div className="relative z-10 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display text-2xl text-white mb-2">Itinerary not found</h2>
          <p className="text-night-400 text-sm mb-6">This link may be expired or the itinerary has been made private.</p>
          <Link to="/" className="btn-primary">Go to Trrip →</Link>
        </div>
      </div>
    );
  }

  const { itinerary: plan, userId } = itinerary;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="starfield" />

      {/* Shared banner nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
              style={{ background: "linear-gradient(135deg, #f59e0b, #f43f5e)" }}>✈</div>
            <span className="font-display font-semibold text-base text-white">Trrip</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-night-400 hidden sm:block">
              Shared by {userId?.name || "a traveller"}
            </span>
            <Link to="/register" className="btn-primary text-xs px-4 py-2">
              Create yours →
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-24">

        {/* Hero */}
        <div className="mb-8 animate-fade-in">
          {/* Shared by pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fcd34d" }}>
            <span>🔗</span> Shared itinerary from Trrip
          </div>

          {itinerary.destination && (
            <p className="text-xs text-amber-400 font-medium tracking-widest uppercase mb-2 flex items-center gap-1.5">
              <span>📍</span> {itinerary.destination}
            </p>
          )}
          <h1 className="font-display text-3xl sm:text-4xl text-white leading-tight mb-3">
            {itinerary.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-night-400">
            {itinerary.duration && <span>📅 {itinerary.duration} days</span>}
            {itinerary.startDate && (
              <span>{itinerary.startDate}{itinerary.endDate ? ` → ${itinerary.endDate}` : ""}</span>
            )}
            {plan?.totalBudgetEstimate && <span>💰 {plan.totalBudgetEstimate}</span>}
          </div>
        </div>

        {/* Summary + highlights */}
        {(plan?.summary || plan?.highlights?.length > 0) && (
          <div className="glass rounded-2xl p-6 mb-8 animate-slide-up">
            {plan.summary && (
              <p className="text-night-300 text-sm leading-relaxed mb-4">{plan.summary}</p>
            )}
            {plan.highlights?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {plan.highlights.map((h, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(245,158,11,0.1)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.15)" }}>
                    ✦ {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Days */}
        {plan?.days?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-xl text-white mb-5 flex items-center gap-2">
              <span>🗓</span> Day-by-Day Plan
            </h2>
            <div className="space-y-4">
              {plan.days.map((day, i) => (
                <DaySection key={i} day={day} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {plan?.tips?.length > 0 && (
          <div className="card mb-10 animate-slide-up">
            <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
              <span>💡</span> Travel Tips
            </h2>
            <ul className="space-y-3">
              {plan.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-night-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.2)" }}>
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center animate-slide-up"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(244,63,94,0.08))", border: "1px solid rgba(245,158,11,0.15)" }}>
          <div className="text-4xl mb-3">✈️</div>
          <h3 className="font-display text-2xl text-white mb-2">Plan your own trip</h3>
          <p className="text-night-400 text-sm mb-6 max-w-sm mx-auto">
            Upload your flight tickets and hotel bookings — Trrip's AI generates a full itinerary in seconds, for free.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register" className="btn-primary">Get started free →</Link>
            <Link to="/login" className="btn-secondary">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
