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
        style={{\n          borderRadius: 16,\n          background: `linear-gradient(135deg, ${t.glass}, rgba(255,255,255,0.04))`,\n          backdropFilter: \"blur(20px)\",\n          WebkitBackdropFilter: \"blur(20px)\",\n        }}\n      >\n        <input\n          value={value}\n          onChange={onChange}\n          onFocus={() => setFocused(true)}\n          onBlur={() => setFocused(false)}\n          placeholder={placeholder}\n          className=\"w-full bg-transparent outline-none text-white/90 placeholder-white/20 px-5 py-4\"\n          style={{ fontFamily: \"'Cormorant Garamond', serif\", fontSize: \"1.1rem\", borderRadius: 16 }}\n        />\n      </motion.div>\n    </div>\n  );\n}\n\n// ─── Result Modal ─────────────────────────────────────────────────────────────\nfunction ResultModal({ result, name1, name2, theme, onClose }) {\n  const t = themes[theme];\n  const sparkles = Array.from({ length: 18 }, (_, i) => i);\n\n  return (\n    <motion.div\n      className=\"fixed inset-0 z-50 flex items-center justify-center p-4\"\n      initial={{ opacity: 0 }}\n      animate={{ opacity: 1 }}\n      exit={{ opacity: 0 }}\n      onClick={onClose}\n    >\n      {/* Backdrop */}\n      <motion.div\n        className=\"absolute inset-0\"\n        initial={{ backdropFilter: \"blur(0px)\" }}\n        animate={{ backdropFilter: \"blur(24px)\" }}\n        style={{ background: t.modalBg }}\n      />\n\n      {/* Sparkles burst */}\n      {sparkles.map((i) => (\n        <motion.div\n          key={i}\n          className=\"absolute text-xl pointer-events-none\"\n          style={{ left: \"50%\", top: \"50%\", zIndex: 60 }}\n          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}\n          animate={{\n            x: Math.cos((i / sparkles.length) * Math.PI * 2) * (80 + Math.random() * 120),\n            y: Math.sin((i / sparkles.length) * Math.PI * 2) * (80 + Math.random() * 120),\n            opacity: [1, 1, 0],\n            scale: [0, 1, 0.5],\n          }}\n          transition={{ duration: 1.2, delay: 0.3, ease: \"easeOut\" }}\n        >\n          {[\"✨\", \"💫\", \"⭐\", \"🌟\"][i % 4]}\n        </motion.div>\n      ))}\n\n      {/* Modal Card */}\n      <motion.div\n        className=\"relative z-50 w-full max-w-md\"\n        initial={{ scale: 0.4, y: 60, opacity: 0 }}\n        animate={{ scale: 1, y: 0, opacity: 1 }}\n        exit={{ scale: 0.4, y: 60, opacity: 0 }}\n        transition={{ type: \"spring\", stiffness: 300, damping: 25 }}\n        onClick={(e) => e.stopPropagation()}\n        style={{\n          borderRadius: 32,\n          background: `linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))`,\n          backdropFilter: \"blur(40px)\",\n          WebkitBackdropFilter: \"blur(40px)\",\n          border: `1px solid ${t.border}`,\n          boxShadow: `0 0 80px ${t.glow}, 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`,\n          padding: \"48px 40px\",\n        }}\n      >\n        {/* Top reflection line */}\n        <div\n          className=\"absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 rounded-full\"\n          style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)` }}\n        />\n\n        <div className=\"text-center\">\n          <motion.div\n            initial={{ scale: 0 }}\n            animate={{ scale: 1 }}\n            transition={{ type: \"spring\", stiffness: 400, delay: 0.2 }}\n            className=\"text-7xl mb-4\"\n          >\n            {result.emoji}\n          </motion.div>\n\n          <motion.div\n            initial={{ opacity: 0, y: 10 }}\n            animate={{ opacity: 1, y: 0 }}\n            transition={{ delay: 0.35 }}\n          >\n            <p className=\"text-white/50 text-sm tracking-widest uppercase mb-2\"\n              style={{ fontFamily: \"'Cormorant Garamond', serif\" }}>\n              The stars reveal\n            </p>\n            <h2\n              className=\"font-bold mb-2\"\n              style={{\n                fontFamily: \"'Cormorant Garamond', serif\",\n                fontSize: \"clamp(2.5rem, 10vw, 4rem)\",\n                color: t.accent,\n                textShadow: `0 0 30px ${t.glow}`,\n                lineHeight: 1,\n              }}\n            >\n              {result.label}\n            </h2>\n            <p className=\"text-white/60 mt-4 text-base\" style={{ fontFamily: \"'Cormorant Garamond', serif\" }}>\n              <span style={{ color: t.accent }}>{name1}</span>\n              <span className=\"text-white/40 mx-2\">&</span>\n              <span style={{ color: t.accent }}>{name2}</span>\n            </p>\n          </motion.div>\n\n          <motion.button\n            className=\"mt-8 px-8 py-3 rounded-2xl text-sm font-semibold tracking-widest uppercase text-white/90\"\n            style={{\n              fontFamily: \"'Cormorant Garamond', serif\",\n              background: `linear-gradient(135deg, ${t.glass}, rgba(255,255,255,0.06))`,\n              border: `1px solid ${t.border}`,\n              backdropFilter: \"blur(10px)\",\n              letterSpacing: \"0.15em\",\n            }}\n            whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${t.glow}` }}\n            whileTap={{ scale: 0.97 }}\n            onClick={onClose}\n            initial={{ opacity: 0 }}\n            animate={{ opacity: 1 }}\n            transition={{ delay: 0.5 }}\n          >\n            Try Again\n          </motion.button>\n        </div>\n      </motion.div>\n    </motion.div>\n  );\n}\n\n// ─── Main App ─────────────────────────────────────────────────────────────────\nexport default function FlamesApp() {\n  const [name1, setName1] = useState(\"\");\n  const [name2, setName2] = useState(\"\");\n  const [result, setResult] = useState(null);\n  const [theme, setTheme] = useState(\"default\");\n  const [showModal, setShowModal] = useState(false);\n  const [error, setError] = useState(\"\");\n  const { ripples, addRipple } = useRipple();\n  const t = themes[theme];\n\n  const particles = Array.from({ length: 16 }, (_, i) => ({\n    id: i,\n    x: Math.random() * 100,\n    size: `${0.9 + Math.random() * 1.2}rem`,\n    delay: Math.random() * 8,\n    duration: 6 + Math.random() * 8,\n  }));\n\n  const handleCheck = (e) => {\n    addRipple(e);\n    if (!name1.trim() || !name2.trim()) {\n      setError(\"Please enter both names ✨\");\n      return;\n    }\n    setError(\"\");\n    const res = calculateFlames(name1, name2);\n    setResult(res);\n    setTheme(res.theme);\n    setTimeout(() => setShowModal(true), 150);\n  };\n\n  const handleClose = () => {\n    setShowModal(false);\n  };\n\n  return (\n    <div className=\"relative min-h-screen overflow-hidden flex items-center justify-center\">\n      {/* Animated Background */}\n      <motion.div\n        className={`absolute inset-0 bg-gradient-to-br ${t.bg}`}\n        animate={{ background: undefined }}\n        transition={{ duration: 1.2 }}\n        key={theme}\n        style={{ zIndex: 0 }}\n      />\n\n      {/* Mesh orbs */}\n      <motion.div\n        className=\"absolute w-96 h-96 rounded-full pointer-events-none\"\n        style={{\n          top: \"10%\", left: \"15%\",\n          background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,\n          filter: \"blur(60px)\",\n          zIndex: 1,\n        }}\n        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}\n        transition={{ duration: 6, repeat: Infinity, ease: \"easeInOut\" }}\n      />\n      <motion.div\n        className=\"absolute w-80 h-80 rounded-full pointer-events-none\"\n        style={{\n          bottom: \"10%\", right: \"10%\",\n          background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,\n          filter: \"blur(60px)\",\n          zIndex: 1,\n        }}\n        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.9, 0.5] }}\n        transition={{ duration: 8, repeat: Infinity, ease: \"easeInOut\" }}\n      />\n\n      {/* Particles */}\n      <div className=\"absolute inset-0 pointer-events-none\" style={{ zIndex: 2 }}>\n        {particles.map((p) => (\n          <Particle key={p.id} color={t.particle} {...p} />\n        ))}\n      </div>\n\n      {/* Main Card */}\n      <motion.div\n        className=\"relative w-full max-w-md mx-4\"\n        style={{ zIndex: 10 }}\n        animate={{ y: [0, -10, 0] }}\n        transition={{ duration: 5, repeat: Infinity, ease: \"easeInOut\" }}\n      >\n        <motion.div\n          key={theme + \"-card\"}\n          animate={{ boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)` }}\n          transition={{ duration: 0.8 }}\n          style={{\n            borderRadius: 32,\n            background: \"linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))\",\n            backdropFilter: \"blur(40px)\",\n            WebkitBackdropFilter: \"blur(40px)\",\n            border: `1px solid ${t.border}`,\n            padding: \"48px 40px\",\n            position: \"relative\",\n            overflow: \"hidden\",\n          }}\n        >\n          {/* Inner glass shine */}\n          <div\n            className=\"absolute top-0 left-0 right-0 h-px\"\n            style={{ background: \"linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)\" }}\n          />\n          <div\n            className=\"absolute top-0 left-0 w-px\"\n            style={{ height: \"40%\", background: \"linear-gradient(180deg, rgba(255,255,255,0.3), transparent)\" }}\n          />\n\n          {/* Header */}\n          <div className=\"text-center mb-10\">\n            <motion.h1\n              className=\"font-bold\"\n              style={{\n                fontFamily: \"'Cormorant Garamond', serif\",\n                fontSize: \"clamp(2.8rem, 10vw, 4.5rem)\",\n                background: `linear-gradient(135deg, #fff 30%, ${t.accent})`,\n                WebkitBackgroundClip: \"text\",\n                WebkitTextFillColor: \"transparent\",\n                lineHeight: 1.1,\n                letterSpacing: \"-0.01em\",\n              }}\n            >\n              FLAMES ❤️\n            </motion.h1>\n            <p\n              className=\"text-white/40 text-sm mt-2 tracking-widest\"\n              style={{ fontFamily: \"'Cormorant Garamond', serif\", letterSpacing: \"0.25em\" }}\n            >\n              DISCOVER YOUR RELATIONSHIP DESTINY\n            </p>\n          </div>\n\n          {/* Inputs */}\n          <div className=\"space-y-5\">\n            <GlassInput\n              label=\"✦ First Name\"\n              value={name1}\n              onChange={(e) => setName1(e.target.value)}\n              placeholder=\"Enter first name...\"\n              theme={theme}\n            />\n            <GlassInput\n              label=\"✦ Second Name\"\n              value={name2}\n              onChange={(e) => setName2(e.target.value)}\n              placeholder=\"Enter second name...\"\n              theme={theme}\n            />\n          </div>\n\n          {/* Error */}\n          <AnimatePresence>\n            {error && (\n              <motion.p\n                initial={{ opacity: 0, y: -4 }}\n                animate={{ opacity: 1, y: 0 }}\n                exit={{ opacity: 0 }}\n                className=\"text-center text-sm mt-3\"\n                style={{ color: t.accent, fontFamily: \"'Cormorant Garamond', serif\" }}\n              >\n                {error}\n              </motion.p>\n            )}\n          </AnimatePresence>\n\n          {/* Button */}\n          <motion.button\n            className=\"relative w-full mt-8 py-4 rounded-2xl font-bold text-white overflow-hidden\"\n            style={{\n              fontFamily: \"'Cormorant Garamond', serif\",\n              fontSize: \"1.1rem\",\n              letterSpacing: \"0.15em\",\n              background: `linear-gradient(135deg, ${t.accent}, ${t.highlight})`,\n              boxShadow: `0 0 30px ${t.btnGlow}`,\n            }}\n            whileHover={{ scale: 1.02, boxShadow: `0 0 50px ${t.btnGlow}` }}\n            whileTap={{ scale: 0.97 }}\n            onClick={handleCheck}\n          >\n            {/* Ripples */}\n            {ripples.map((r) => (\n              <motion.span\n                key={r.id}\n                className=\"absolute rounded-full pointer-events-none\"\n                style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20, background: \"rgba(255,255,255,0.4)\" }}\n                initial={{ scale: 0, opacity: 1 }}\n                animate={{ scale: 12, opacity: 0 }}\n                transition={{ duration: 0.7, ease: \"easeOut\" }}\n              />\n            ))}\n            {/* Shine */}\n            <motion.div\n              className=\"absolute inset-0 pointer-events-none\"\n              style={{ background: \"linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)\" }}\n              animate={{ x: [\"-100%\", \"200%\"] }}\n              transition={{ duration: 2.5, repeat: Infinity, ease: \"linear\", repeatDelay: 1 }}\n            />\n            CHECK RELATIONSHIP ✨\n          </motion.button>\n\n          {/* FLAMES letters */}\n          <div className=\"flex justify-center gap-3 mt-6\">\n            {[\"F\",\"L\",\"A\",\"M\",\"E\",\"S\"].map((l, i) => (\n              <motion.span\n                key={l}\n                className=\"text-xs font-bold\"\n                style={{\n                  fontFamily: \"'Cormorant Garamond', serif\",\n                  color: result?.label?.[0] === l ? t.accent : \"rgba(255,255,255,0.2)\",\n                  letterSpacing: \"0.1em\",\n                  transition: \"color 0.5s\",\n                }}\n                animate={{ opacity: [0.4, 1, 0.4] }}\n                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}\n              >\n                {l}\n              </motion.span>\n            ))}\n          </div>\n        </motion.div>\n      </motion.div>\n\n      {/* Result Modal */}\n      <AnimatePresence>\n        {showModal && result && (\n          <ResultModal\n            result={result}\n            name1={name1}\n            name2={name2}\n            theme={theme}\n            onClose={handleClose}\n          />\n        )}\n      </AnimatePresence>\n\n      {/* Google Font */}\n      <style>{`\n        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');\n        * { box-sizing: border-box; margin: 0; padding: 0; }\n        body { background: #0a0010; }\n        input::placeholder { color: rgba(255,255,255,0.2); }\n      `}</style>\n    </div>\n  );\n}