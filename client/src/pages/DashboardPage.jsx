import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import { getMyItineraries, deleteItinerary } from "../services/api";
import { useAuth } from "../context/AuthContext";

const StatusBadge = ({ status }) => {
  const styles = {
    completed: { bg: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "rgba(16,185,129,0.2)", label: "Ready" },
    processing: { bg: "rgba(245,158,11,0.12)", color: "#fcd34d", border: "rgba(245,158,11,0.2)", label: "Processing…" },
    failed: { bg: "rgba(244,63,94,0.12)", color: "#fda4af", border: "rgba(244,63,94,0.2)", label: "Failed" },
  };
  const s = styles[status] || styles.processing;
  return (
    <span className="badge text-xs" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status === "processing" && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: s.color }} />
      )}
      {s.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="card">
    <div className="shimmer h-5 rounded-lg w-3/4 mb-3" />
    <div className="shimmer h-3 rounded w-1/2 mb-4" />
    <div className="flex gap-2">
      <div className="shimmer h-6 rounded-full w-16" />
      <div className="shimmer h-6 rounded-full w-20" />
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItineraries = async () => {
    try {
      const res = await getMyItineraries();
      setItineraries(res.data.itineraries);
    } catch {
      toast.error("Could not load itineraries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
    // Poll every 5s if any are processing
    const interval = setInterval(() => {
      if (itineraries.some((i) => i.status === "processing")) {
        fetchItineraries();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [itineraries.length]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this itinerary?")) return;
    try {
      await deleteItinerary(id);
      setItineraries((prev) => prev.filter((i) => i._id !== id));
      toast.success("Itinerary deleted");
    } catch {
      toast.error("Could not delete");
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="starfield" />
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 animate-fade-in">
          <div>
            <p className="text-night-400 text-sm mb-1">Good to see you,</p>
            <h1 className="font-display text-3xl sm:text-4xl text-white">
              {user?.name?.split(" ")[0]}'s trips
            </h1>
          </div>
          <Link to="/upload" className="btn-primary text-sm">
            + New trip
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="text-5xl mb-4">🧳</div>
            <h2 className="font-display text-2xl text-white mb-2">No trips yet</h2>
            <p className="text-night-400 text-sm mb-8">
              Upload your first travel booking to get started
            </p>
            <Link to="/upload" className="btn-primary">
              Upload documents →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-up">
            {itineraries.map((item) => (
              <div
                key={item._id}
                onClick={() => item.status === "completed" && navigate(`/itinerary/${item._id}`)}
                className={`card group relative ${item.status === "completed" ? "cursor-pointer" : ""}`}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, item._id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-night-500 hover:text-coral-400 transition-all text-lg leading-none"
                >
                  ×
                </button>

                {/* Destination icon */}
                <div className="text-2xl mb-3">
                  {item.status === "processing" ? "⏳" :
                   item.status === "failed" ? "❌" : "🗺️"}
                </div>

                <h2 className="font-display text-base text-white mb-1 pr-6 leading-snug line-clamp-2">
                  {item.title}
                </h2>

                {item.destination && (
                  <p className="text-xs text-night-400 mb-3 flex items-center gap-1">
                    <span>📍</span> {item.destination}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <StatusBadge status={item.status} />
                  {item.duration && (
                    <span className="text-xs text-night-500">{item.duration} days</span>
                  )}
                </div>

                {item.startDate && (
                  <p className="text-xs text-night-500 border-t border-white/5 pt-3 mt-auto">
                    {formatDate(item.startDate)}
                    {item.endDate && ` → ${formatDate(item.endDate)}`}
                  </p>
                )}

                {item.status === "processing" && (
                  <div className="mt-3">
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full w-1/2 rounded-full shimmer"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)" }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
