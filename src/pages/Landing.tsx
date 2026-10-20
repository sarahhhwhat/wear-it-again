import { OrbitCanvas } from "@/components/OrbitCanvas";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import "./landing.css";

const BANDS = [
  { label: "Tops", color: "#ff595e" },
  { label: "Bottoms", color: "#ff9e1c" },
  { label: "Dresses", color: "#2747d8" },
  { label: "Outerwear", color: "#7b4dff" },
  { label: "Shoes & accessories", color: "#0fb5a0" },
];

const FEATURES = [
  {
    to: "/swap-board",
    tag: "swap board",
    title: "Pass it on",
    desc: "List what you no longer wear and claim what you will. Every swap keeps a garment in circulation.",
  },
  {
    to: "/rewear",
    tag: "rewear challenge",
    title: "Keep a streak",
    desc: "One logged rewear a day, ten points each. Watch your streak and the leaderboard climb.",
  },
  {
    to: "/calculator",
    tag: "impact calculator",
    title: "Count what you saved",
    desc: "Turn rewears into the litres of water and kilograms of CO₂ you never spent.",
  },
  {
    to: "/greenwash-check",
    tag: "greenwash checker",
    title: "Read the claim twice",
    desc: "Paste a brand's sustainability claim and spot the vague wording before you buy into it.",
  },
  {
    to: "/ai-chat",
    tag: "ask ai",
    title: "Ask a straight question",
    desc: "Wondering if a brand is actually sustainable? Get a straight answer instead of a slogan.",
  },
];

const NUMBERS = [
  {
    roman: "I",
    title: "Water",
    desc: "Making one new garment takes thousands of litres of water. Wearing something you already own takes none.",
    spec: "2,700 L · per new garment skipped",
  },
  {
    roman: "II",
    title: "Carbon",
    desc: "A reworn garment is CO₂ that never enters the air. It adds up faster than you would think.",
    spec: "8 kg CO₂ · per garment reworn",
  },
  {
    roman: "III",
    title: "Wears",
    desc: "The clothes already hanging in your wardrobe still have plenty of wears left in them. That is the whole idea.",
    spec: "10 points · per logged rewear",
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primary = isAuthenticated ? "/dashboard" : "/auth";
  const clockRef = useRef<HTMLElement>(null);
  const [count, setCount] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  // hold the preloader until the first frame, with 5.2 s of patience
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 5200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="orrery">
      <div className="orr-bg" />
      <OrbitCanvas
        clockRef={clockRef}
        onReady={setCount}
        onFirstFrame={() => setReady(true)}
      />
      <div className="orr-vignette" />

      <div className={`orr-loader orr-mono ${ready ? "done" : ""}`} aria-hidden={ready}>
        <div className="ring" />
        <span>Winding the orbits</span>
      </div>

      <div className="orr-page">
        <nav className="orr-nav orr-mono" aria-label="Main">
          <div className="links">
            <a href="#how">What you can do</a>
            <a href="#numbers">The numbers</a>
          </div>
          <Link to="/" className="orr-brand">
            Wear It Again
          </Link>
          <Link to={primary} className="join">
            {isAuthenticated ? "Dashboard" : "Join"}
          </Link>
        </nav>

        <div className="orr-col">
          <section className="orr-hero">
            <p className="orr-eyebrow orr-mono">
              <span className="orr-dot" />A student project, built from a survey at Royal College
            </p>
            <h1 className="orr-h1">
              <span>The most sustainable</span>
              <span>outfit is the one</span>
              <span>you already own,</span>
              <span>so keep it</span>
              <span>in orbit</span>
            </h1>
            <p className="orr-sub">
              Every garment can circle back. Swap clothes with other students,
              log each day you rewear something, and check a brand's claim
              before you buy. Free, and made for campus.
            </p>
            <div className="orr-cta-row">
              <Link to={primary} className="orr-cta">
                {isAuthenticated ? "Back to your dashboard" : "Start rewearing"}
              </Link>
              <span className="orr-hint orr-mono">Drag the orbits</span>
            </div>
          </section>

          <dl className="orr-eph orr-mono">
            <div>
              <dt>Garments in orbit</dt>
              <dd>{count ? count.toLocaleString("en-US") : "…"}</dd>
            </div>
            <div>
              <dt>Orbit clock</dt>
              <dd>
                <span ref={clockRef}>Day 0.0</span>
              </dd>
            </div>
            <div>
              <dt>Water per garment</dt>
              <dd>2,700 L</dd>
            </div>
            <div>
              <dt>CO₂ per garment</dt>
              <dd>8 kg</dd>
            </div>
          </dl>

          <div className="orr-legend orr-mono" aria-label="Orbit key">
            {BANDS.map((b) => (
              <span key={b.label}>
                <i style={{ background: b.color }} />
                {b.label}
              </span>
            ))}
          </div>
          <p className="orr-legend-note">
            Each shape is a garment, and the fine dust is the rest of the
            wardrobe. Inner orbits are what you wear every week, and outer
            orbits are what travels from person to person. An illustration,
            not live data.
          </p>

          <section id="how" className="orr-sec">
            <h2 className="orr-h2">
              <span>If you own a</span>
              <span>wardrobe, you are</span>
              <span>already in</span>
            </h2>
            <p className="orr-lede">
              Make a free account, list what you no longer wear, and log the
              days you rewear what you do. There is no shop window and no
              checkout queue, only clothes finding their next person.
            </p>
            <ul className="orr-list">
              {FEATURES.map((f) => (
                <li key={f.to}>
                  <span className="orr-tag orr-mono">{f.tag}</span>
                  <Link to={f.to} className="orr-item-title">
                    {f.title}
                  </Link>
                  <p className="orr-item-desc">{f.desc}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="numbers" className="orr-sec">
            <h2 className="orr-h2">
              <span>Three numbers</span>
              <span>and one habit</span>
            </h2>
            <ul className="orr-list">
              {NUMBERS.map((n) => (
                <li key={n.roman}>
                  <span className="orr-roman orr-mono">{n.roman}</span>
                  <span className="orr-item-title">{n.title}</span>
                  <p className="orr-item-desc">{n.desc}</p>
                  <p className="orr-spec orr-mono">{n.spec}</p>
                </li>
              ))}
            </ul>
            <p className="orr-legend-note">
              Estimates are industry averages, the same ones the calculator
              uses. Real numbers vary by fabric, size and washing habits.
            </p>
          </section>

          <section className="orr-sec orr-final">
            <h2 className="orr-h2">
              <span>Free, and a</span>
              <span>login away</span>
            </h2>
            <p className="orr-lede">
              Members get a swap board, a rewear streak, a place on the
              leaderboard, and an AI that will tell you when a brand's claim
              does not hold up.
            </p>
            <div className="orr-cta-row">
              <Link to={primary} className="orr-cta">
                {isAuthenticated ? "Open your dashboard" : "Join free"}
              </Link>
            </div>
          </section>
        </div>

        <footer className="orr-footer orr-mono">
          <div className="orr-col">
            Wear It Again · A Royal College student project
            <br />
            Reworn, not reborn · © {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
}
