import { useState } from "react";
import { Mascot } from "lively-mascot";
import "lively-mascot/styles.css";
import "./demo.css";

const palettes = [
  { name: "Mint", color: "#48ff42", outline: "#080808" },
  { name: "Sky", color: "#6ec7ff", outline: "#0b1e3a" },
  { name: "Peach", color: "#ffb37a", outline: "#5c2a12" },
  { name: "Lavender", color: "#c9a6ff", outline: "#2e1a4d" },
  { name: "Rose", color: "#ff9fb6", outline: "#5c1f33" },
  { name: "Lemon", color: "#ffe066", outline: "#4d3d00" },
];

export default function App() {
  const [log, setLog] = useState<string>("Move your cursor over a mascot · click to cheer it up");

  const handleClick = (name: string) => setLog(`${name} says: hello! (clicked at ${new Date().toLocaleTimeString()})`);

  return (
    <main className="page">
      <header className="hero">
        <h1>
          <span className="hero__dot">✦</span> lively-mascot
        </h1>
        <p className="hero__tagline">
          Plug-and-play animated mascots for chatbots, desktop pets &amp; web widgets — they blink, breathe,
          follow your cursor, and express emotions.
        </p>
        <p className="hero__hint">{log}</p>
      </header>

      <section className="showcase">
        <Mascot type="sprout" size={180} onMascotClick={() => handleClick("Sprout")} />
      </section>

      <section className="palette">
        {palettes.map((p) => (
          <figure key={p.name} className="palette__item">
            <Mascot type="sprout" size={96} color={p.color} outline={p.outline} onMascotClick={() => handleClick(p.name)} />
            <figcaption>{p.name}</figcaption>
          </figure>
        ))}
      </section>

      <section className="code">
        <pre>
          {`<Mascot
  type="sprout"
  color="#48ff42"
  outline="#080808"
  size={106}
  onMascotClick={() => say("hi")}
/>`}
        </pre>
      </section>
    </main>
  );
}
