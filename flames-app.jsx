import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from "framer-motion";

// ─── FLAMES Logic ────────────────────────────────────────────────────────────
function calculateFlames(n1, n2) {
  const name1 = n1.replace(/\s/g, "").toLowerCase().split("");
  const name2 = n2.replace(/\s/g, "").toLowerCase().split("");
  const n1Copy = [...name1];
  const n2Copy = [...name2];

  for (const ch of name1) {
    const idx = n2Copy.indexOf(ch);
    if (idx !== -1) {
      n1Copy.splice(n1Copy.indexOf(ch), 1);
      n2Copy.splice(idx, 1);
    }
  }

  const count = n1Copy.length + n2Copy.length;
  let flames = ["F", "L", "A", "M", "E", "S"];
  let idx = 0;

  while (flames.length > 1) {
    idx = (idx + count - 1) % flames.length;
    flames.splice(idx, 1);
    if (idx === flames.length) idx = 0;
  }

  const map = {
    F: { label: "Friends", emoji: "🤝", theme: "blue" },
    L: { label: "Love", emoji: "💖", theme: "rose" },
    A: { label: "Affection", emoji: "💜", theme: "purple" },
    M: { label: "Marriage", emoji: "💍", theme: "gold" },
    E: { label: "Enemies", emoji: "❤️‍🔥", theme: "red" },
    S: { label: "Siblings", emoji: "💚", theme: "green" },
  };

  return map[flames[0]];
}

// ─── Theme Configs ────────────────────────────────────────────────────────────
const themes = {
  default: {
    bg: "from-pink-950 via-rose-900 to-purple-950",
    glow: "rgba(244,114,182,0.4)",
    accent: "#f472b6",
    particle: "#f9a8d4",
    glass: "rgba(255,192,203,0.08)",
    border: "rgba(255,192,203,0.2)",
    btn: "from-pink-500 to-rose-500",
    btnGlow: "rgba(244,114,182,0.6)",
    modalBg: "rgba(30,10,20,0.7)",
    highlight: "#fb7185",
  },
  blue: {
    bg: "from-blue-950 via-sky-900 to-indigo-950",
    glow: "rgba(96,165,250,0.4)",
    accent: "#60a5fa",
    particle: "#93c5fd",
    glass: "rgba(147,197,253,0.08)",
    border: "rgba(147,197,253,0.2)",
    btn: "from-blue-500 to-sky-500",
    btnGlow: "rgba(96,165,250,0.6)",
    modalBg: "rgba(5,10,30,0.7)",
    highlight: "#38bdf8",
  },
  rose: {
    bg: "from-pink-950 via-rose-800 to-red-950",
    glow: "rgba(251,113,133,0.5)",
    accent: "#fb7185",
    particle: "#fda4af",
    glass: "rgba(253,164,175,0.1)",
    border: "rgba(253,164,175,0.25)",
    btn: "from-rose-500 to-pink-600",
    btnGlow: "rgba(251,113,133,0.7)",
    modalBg: "rgba(30,5,10,0.75)",
    highlight: "#f43f5e",
  },
  purple: {
    bg: "from-purple-950 via-violet-900 to-fuchsia-950",
    glow: "rgba(192,132,252,0.4)",
    accent: "#c084fc",
    particle: "#d8b4fe",
    glass: "rgba(216,180,254,0.08)",
    border: "rgba(216,180,254,0.2)",
    btn: "from-purple-500 to-violet-500",
    btnGlow: "rgba(192,132,252,0.6)",
    modalBg: "rgba(15,5,30,0.7)",
    highlight: "#a855f7",
  },
  gold: {
    bg: "from-yellow-950 via-amber-900 to-orange-950",
    glow: "rgba(251,191,36,0.4)",
    accent: "#fbbf24",
    particle: "#fcd34d",
    glass: "rgba(252,211,77,0.08)",
    border: "rgba(252,211,77,0.2)",
    btn: "from-amber-400 to-yellow-500",
    btnGlow: "rgba(251,191,36,0.6)",
    modalBg: "rgba(25,15,0,0.75)",
    highlight: "#f59e0b",
  },
  red: {
    bg: "from-red-950 via-rose-900 to-orange-950",
    glow: "rgba(239,68,68,0.4)",
    accent: "#ef4444",
    particle: "#fca5a5",
    glass: "rgba(252,165,165,0.08)",
    border: "rgba(252,165,165,0.2)",
    btn: "from-red-500 to-orange-600",
    btnGlow: "rgba(239,68,68,0.6)",
    modalBg: "rgba(30,5,0,0.75)",
    highlight: "#dc2626",
  },
  green: {
    bg: "from-green-950 via-emerald-900 to-teal-950",
    glow: "rgba(52,211,153,0.4)",
    accent: "#34d399",
    particle: "#6ee7b7",
    glass: "rgba(110,231,183,0.08)",
    border: "rgba(110,231,183,0.2)",
    btn: "from-emerald-500 to-green-500",
    btnGlow: "rgba(52,211,153,0.6)",
    modalBg: "rgba(0,20,10,0.7)",
    highlight: "#10b981",
  },
};

// ─── Floating Particle ────────────────────────────────────────────────────────
function Particle({ color, delay, x, size, duration }) {
  const icons = ["❤️", "✨", "💫", "⭐", "🌸", "💕"];
  const icon = icons[Math.floor(Math.random() * icons.length)];
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, bottom: "-10%", fontSize: size, opacity: 0 }}
      animate={{ y: [0, -window.innerHeight - 100], opacity: [0, 0.7, 0.7, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      {icon}
    </motion.div>
  );
}

// ─── Ripple Effect ────────────────────────────────────────────────────────────
function useRipple() {
  const [ripples, setRipples] = useState([]);
  const addRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { x, y, id }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
  }, []);
  return { ripples, addRipple };
}

// ─── Glass Input ──────────────────────────────────────────────────────────────
function GlassInput({ label, value, onChange, placeholder, theme }) {
  const [focused, setFocused] = useState(false);
  const t = themes[theme];
  return (
    <div className="relative w-full">
      <label
        className="block text-xs font-semibold tracking-widest uppercase mb-2"
        style={{ color: t.accent, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.2em" }}
      >
        {label}
      </label>
      <motion.div
        animate={{ boxShadow: focused ? `0 0 0 2px ${t.accent}, 0 0 20px ${t.glow}` : `0 0 0 1px ${t.border}` }}
        transition={{ duration: 0.3 }}
        style={{
          borderRadius: 16,
          background: `linear-gradient(135deg, ${t.glass}, rgba(255,255,255,0.04))`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <input
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-white/90 placeholder-white/20 px-5 py-4"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", borderRadius: 16 }}
        />
      </motion.div>
    </div>
  );
}

// ─── Result Modal ─────────────────────────────────────────────────────────────
function ResultModal({ result, name1, name2, theme, onClose }) {
  const t = themes[theme];
  const sparkles = Array.from({ length: 18 }, (_, i) => i);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        initial={{ backdropFilter: "blur(0px)" }}
        animate={{ backdropFilter: "blur(24px)" }}
        style={{ background: t.modalBg }}
      />

      {/* Sparkles burst */}
      {sparkles.map((i) => (
        <motion.div
          key={i}
          className="absolute text-xl pointer-events-none"
          style={{ left: "50%", top: "50%", zIndex: 60 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: Math.cos((i / sparkles.length) * Math.PI * 2) * (80 + Math.random() * 120),
            y: Math.sin((i / sparkles.length) * Math.PI * 2) * (80 + Math.random() * 120),
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        >
          {["✨", "💫", "⭐", "🌟"][i % 4]}
        </motion.div>
      ))}

      {/* Modal Card */}
      <motion.div
        className="relative z-50 w-full max-w-md"
        initial={{ scale: 0.4, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.4, y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          borderRadius: 32,
          background: `linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))`,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: `1px solid ${t.border}`,
          boxShadow: `0 0 80px ${t.glow}, 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`,
          padding: "48px 40px",
        }}
      >
        {/* Top reflection line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)` }}
        />

        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
            className="text-7xl mb-4"
          >
            {result.emoji}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p className="text-white/50 text-sm tracking-widest uppercase mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              The stars reveal
            </p>
            <h2
              className="font-bold mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.5rem, 10vw, 4rem)",
                color: t.accent,
                textShadow: `0 0 30px ${t.glow}`,
                lineHeight: 1,
              }}
            >
              {result.label}
            </h2>
            <p className="text-white/60 mt-4 text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <span style={{ color: t.accent }}>{name1}</span>
              <span className="text-white/40 mx-2">&</span>
              <span style={{ color: t.accent }}>{name2}</span>
            </p>
          </motion.div>

          <motion.button
            className="mt-8 px-8 py-3 rounded-2xl text-sm font-semibold tracking-widest uppercase text-white/90"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              background: `linear-gradient(135deg, ${t.glass}, rgba(255,255,255,0.06))`,
              border: `1px solid ${t.border}`,
              backdropFilter: "blur(10px)",
              letterSpacing: "0.15em",
            }}
            whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${t.glow}` }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FlamesApp() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState(null);
  const [theme, setTheme] = useState("default");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const { ripples, addRipple } = useRipple();
  const t = themes[theme];

  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: `${0.9 + Math.random() * 1.2}rem`,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 8,
  }));

  const handleCheck = (e) => {
    addRipple(e);
    if (!name1.trim() || !name2.trim()) {
      setError("Please enter both names ✨");
      return;
    }
    setError("");
    const res = calculateFlames(name1, name2);
    setResult(res);
    setTheme(res.theme);
    setTimeout(() => setShowModal(true), 150);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${t.bg}`}
        animate={{ background: undefined }}
        transition={{ duration: 1.2 }}
        key={theme}
        style={{ zIndex: 0 }}
      />

      {/* Mesh orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          top: "10%", left: "15%",
          background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
          filter: "blur(60px)",
          zIndex: 1,
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={{
          bottom: "10%", right: "10%",
          background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
          filter: "blur(60px)",
          zIndex: 1,
        }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {particles.map((p) => (
          <Particle key={p.id} color={t.particle} {...p} />
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        className="relative w-full max-w-md mx-4"
        style={{ zIndex: 10 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          key={theme + "-card"}
          animate={{ boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)` }}
          transition={{ duration: 0.8 }}
          style={{
            borderRadius: 32,
            background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: `1px solid ${t.border}`,
            padding: "48px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Inner glass shine */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
          />
          <div
            className="absolute top-0 left-0 w-px"
            style={{ height: "40%", background: "linear-gradient(180deg, rgba(255,255,255,0.3), transparent)" }}
          />

          {/* Header */}
          <div className="text-center mb-10">
            <motion.h1
              className="font-bold"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.8rem, 10vw, 4.5rem)",
                background: `linear-gradient(135deg, #fff 30%, ${t.accent})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              FLAMES ❤️
            </motion.h1>
            <p
              className="text-white/40 text-sm mt-2 tracking-widest"
              style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.25em" }}
            >
              DISCOVER YOUR RELATIONSHIP DESTINY
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-5">
            <GlassInput
              label="✦ First Name"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="Enter first name..."
              theme={theme}
            />
            <GlassInput
              label="✦ Second Name"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="Enter second name..."
              theme={theme}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-sm mt-3"
                style={{ color: t.accent, fontFamily: "'Cormorant Garamond', serif" }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.button
            className="relative w-full mt-8 py-4 rounded-2xl font-bold text-white overflow-hidden"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.1rem",
              letterSpacing: "0.15em",
              background: `linear-gradient(135deg, ${t.accent}, ${t.highlight})`,
              boxShadow: `0 0 30px ${t.btnGlow}`,
            }}
            whileHover={{ scale: 1.02, boxShadow: `0 0 50px ${t.btnGlow}` }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCheck}
          >
            {/* Ripples */}
            {ripples.map((r) => (
              <motion.span
                key={r.id}
                className="absolute rounded-full pointer-events-none"
                style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20, background: "rgba(255,255,255,0.4)" }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 12, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ))}
            {/* Shine */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
            CHECK RELATIONSHIP ✨
          </motion.button>

          {/* FLAMES letters */}
          <div className="flex justify-center gap-3 mt-6">
            {["F","L","A","M","E","S"].map((l, i) => (
              <motion.span
                key={l}
                className="text-xs font-bold"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: result?.label?.[0] === l ? t.accent : "rgba(255,255,255,0.2)",
                  letterSpacing: "0.1em",
                  transition: "color 0.5s",
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              >
                {l}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Result Modal */}
      <AnimatePresence>
        {showModal && result && (
          <ResultModal
            result={result}
            name1={name1}
            name2={name2}
            theme={theme}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0010; }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}