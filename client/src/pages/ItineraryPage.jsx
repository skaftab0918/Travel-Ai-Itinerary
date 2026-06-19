import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import { getItinerary, getItineraryStatus, toggleShare, deleteItinerary } from "../services/api";

const EVENT_STYLES = {
  flight:    { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)",  color: "#93c5fd", icon: "✈️" },
  hotel:     { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)",  color: "#6ee7b7", icon: "🏨" },
  activity:  { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)",  color: "#fcd34d", icon: "🎭" },
  transport: { bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.25)",  color: "#c4b5fd", icon: "🚂" },
  meal:      { bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.25)",   color: "#fda4af", icon: "🍽️" },
  other:     { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", color: "#94a3b8", icon: "📍" },
};

const ProcessingState = ({ itineraryId }) => {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const i = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 600);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="starfield" />
      <div className="relative z-10 text-center animate-fade-in max-w-sm mx-auto px-4">
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(244,63,94,0.15))", border: "1px solid rgba(245,158,11,0.2)" }}>
          🤖
        </div>
        <h2 className="font-display text-2xl text-white mb-2">AI is working{dots}</h2>
        <p className="text-night-400 text-sm mb-8 leading-relaxed">
          Gemini is reading your documents and crafting a personalised day-by-day itinerary. This usually takes 15–30 seconds.
        </p>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full shimmer" style={{ width: "60%", background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)" }} />
        </div>
        <p className="text-xs text-night-500 mt-4">
          <Link to="/dashboard" className="hover:text-night-300 transition-colors underline underline-offset-2">
            Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
};

const EventCard = ({ event, isLast }) => {
  const style = EVENT_STYLES[event.type] || EVENT_STYLES.other;
  const icon = event.icon || style.icon;
  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)" }} />
      )}
      {/* Icon bubble */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg z-10"
        style={{ background: style.bg, border: `1px solid ${style.border}` }}>
        {icon}
      </div>
      {/* Content */}
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
        <div className="flex flex-wrap gap-3">
          {event.location && (
            <span className="text-xs text-night-500 flex items-center gap-1">
              <span className="text-base leading-none">📍</span> {event.location}
            </span>
          )}
          {event.confirmationNumber && (
            <span className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.04)", color: "#829ab1", border: "1px solid rgba(255,255,255,0.06)" }}>
              #{event.confirmationNumber}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const DayCard = ({ day, index }) => {
  const [expanded, setExpanded] = useState(index === 0);
  return (
    <div className="card animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 text-left group"
      >
        {/* Day number */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(244,63,94,0.15))", border: "1px solid rgba(245,158,11,0.2)" }}>
          <span className="text-xs text-amber-400 font-medium leading-none">Day</span>
          <span className="text-lg font-display text-white leading-tight">{day.dayNumber || index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base text-white leading-snug mb-0.5">{day.title}</h3>
          <p className="text-xs text-night-400 flex items-center gap-2">
            {day.city && <span className="flex items-center gap-1"><span>📍</span>{day.city}</span>}
            {day.date && <span>{day.date}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-night-500">{day.events?.length || 0} events</span>
          <span className="text-night-400 transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>
            ▾
          </span>
        </div>
      </button>

      {expanded && day.events?.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/5 animate-fade-in">
          {day.events.map((event, i) => (
            <EventCard key={i} event={event} isLast={i === day.events.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ItineraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Poll status while processing
  useEffect(() => {
    let interval;
    const poll = async () => {
      try {
        const res = await getItineraryStatus(id);
        setStatus(res.data.status);
        if (res.data.status !== "processing") {
          clearInterval(interval);
          if (res.data.status === "completed") loadFull();
          else setLoading(false);
        }
      } catch {
        clearInterval(interval);
        setLoading(false);
      }
    };

    const loadFull = async () => {
      try {
        const res = await getItinerary(id);
        setItinerary(res.data.itinerary);
        setStatus(res.data.itinerary.status);
      } catch {
        toast.error("Could not load itinerary");
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      try {
        const res = await getItinerary(id);
        const s = res.data.itinerary.status;
        setStatus(s);
        if (s === "completed") {
          setItinerary(res.data.itinerary);
          setLoading(false);
        } else if (s === "failed") {
          setLoading(false);
        } else {
          // Still processing, start polling
          interval = setInterval(poll, 4000);
        }
      } catch {
        toast.error("Itinerary not found");
        navigate("/dashboard");
      }
    };

    init();
    return () => clearInterval(interval);
  }, [id]);

  const handleToggleShare = async () => {
    setSharing(true);
    try {
      const res = await toggleShare(id);
      setItinerary(prev => ({ ...prev, isPublic: res.data.isPublic }));
      toast.success(res.data.message);
    } catch {
      toast.error("Could not update sharing settings");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/shared/${itinerary.shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this itinerary?")) return;
    try {
      await deleteItinerary(id);
      toast.success("Itinerary deleted");
      navigate("/dashboard");
    } catch {
      toast.error("Could not delete");
    }
  };

  if (loading && status === "processing") return <ProcessingState itineraryId={id} />;

  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="starfield" />
        <div className="relative z-10 text-center px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-display text-2xl text-white mb-2">Processing failed</h2>
          <p className="text-night-400 text-sm mb-6">The AI couldn't process your documents. Please try again with clearer files.</p>
          <Link to="/upload" className="btn-primary">Try again</Link>
        </div>
      </div>
    );
  }

  if (!itinerary) return null;

  const { itinerary: plan } = itinerary;
  const shareUrl = `${window.location.origin}/shared/${itinerary.shareToken}`;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="starfield" />
      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-20">

        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-night-400 hover:text-white transition-colors mb-8 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          My trips
        </Link>

        {/* Hero header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {itinerary.destination && (
                <p className="text-xs text-amber-400 font-medium tracking-widest uppercase mb-2 flex items-center gap-1.5">
                  <span>📍</span> {itinerary.destination}
                </p>
              )}
              <h1 className="font-display text-3xl sm:text-4xl text-white leading-tight mb-3">
                {itinerary.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-night-400">
                {itinerary.duration && (
                  <span className="flex items-center gap-1.5">
                    <span>📅</span> {itinerary.duration} days
                  </span>
                )}
                {itinerary.startDate && (
                  <span>{itinerary.startDate}{itinerary.endDate ? ` → ${itinerary.endDate}` : ""}</span>
                )}
                {plan?.totalBudgetEstimate && (
                  <span className="flex items-center gap-1.5">
                    <span>💰</span> {plan.totalBudgetEstimate}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleToggleShare}
                disabled={sharing}
                className="btn-secondary text-xs"
              >
                {sharing ? "…" : itinerary.isPublic ? "🔒 Make private" : "🔗 Share"}
              </button>
              {itinerary.isPublic && (
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary text-xs"
                  style={copied ? { borderColor: "rgba(16,185,129,0.4)", color: "#6ee7b7" } : {}}
                >
                  {copied ? "✓ Copied!" : "📋 Copy link"}
                </button>
              )}
              <button onClick={handleDelete} className="btn-secondary text-xs text-coral-400 border-coral-400/20 hover:border-coral-400/40">
                🗑
              </button>
            </div>
          </div>

          {/* Share banner */}
          {itinerary.isPublic && (
            <div className="mt-4 px-4 py-3 rounded-xl text-xs flex items-center gap-3 animate-fade-in"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span>🌍</span>
              <span className="text-emerald-300">Public link active —</span>
              <a href={shareUrl} target="_blank" rel="noreferrer"
                className="text-night-300 hover:text-white font-mono truncate transition-colors">
                {shareUrl}
              </a>
            </div>
          )}
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

        {/* Day-by-day itinerary */}
        {plan?.days?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-xl text-white mb-5 flex items-center gap-2">
              <span>🗓</span> Day-by-Day Plan
            </h2>
            <div className="space-y-4">
              {plan.days.map((day, i) => (
                <DayCard key={i} day={day} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Travel tips */}
        {plan?.tips?.length > 0 && (
          <div className="card animate-slide-up">
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

        {/* Uploaded files */}
        {itinerary.uploadedFiles?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs text-night-500 uppercase tracking-widest font-medium mb-3">Source Documents</h3>
            <div className="flex flex-wrap gap-2">
              {itinerary.uploadedFiles.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#829ab1" }}>
                  <span>{f.fileType === "pdf" ? "📄" : "🖼"}</span>
                  <span className="truncate max-w-[140px]">{f.originalName}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
