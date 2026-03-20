import { useEffect, useRef, useState, useCallback } from "react";

const CONFETTI_COLORS = [
  "#FF6B9D", "#FFD93D", "#6BCB77", "#4D96FF", "#FF922B",
  "#CC5DE8", "#FF4757", "#2ED573", "#FFA502", "#1E90FF",
];

const WISHES = [
  { emoji: "🌸", title: "Красота", text: "Ты красивее, чем фильтр в инстаграме — и без него тоже!" },
  { emoji: "🧠", title: "Мудрость", text: "Умная, весёлая, обаятельная. Ладно, мы немного завидуем." },
  { emoji: "🎂", title: "Торт", text: "Пусть торт будет огромным, а талия — прежней. Это наука!" },
  { emoji: "💪", title: "Сила", text: "Ты справляешься со всем! Даже с понедельниками." },
  { emoji: "🦄", title: "Магия", text: "Ты — единственная в своём роде. Буквально как единорог." },
  { emoji: "🚀", title: "Успех", text: "Новый год жизни — новые высоты. Уже летишь к звёздам!" },
  { emoji: "😂", title: "Юмор", text: "Пусть смех не кончается, а морщины — только от улыбок!" },
  { emoji: "💎", title: "Ценность", text: "Ты — как Wi-Fi: все ищут, и все рады, когда находят." },
];

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  type P = { x: number; y: number; w: number; h: number; color: string; vx: number; vy: number; angle: number; spin: number; opacity: number };
  const particlesRef = useRef<P[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const spawn = () => {
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: -10,
          w: Math.random() * 10 + 6,
          h: Math.random() * 6 + 4,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 3 + 2,
          angle: Math.random() * 360,
          spin: (Math.random() - 0.5) * 8,
          opacity: 1,
        });
      }
    };

    const interval = setInterval(spawn, 120);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.y < canvas.height + 20);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.05;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return canvasRef;
}

function burstConfettiAt(x: number, y: number) {
  const canvas = document.getElementById("burst-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  type BP = { x: number; y: number; vx: number; vy: number; color: string; w: number; h: number; angle: number; spin: number; opacity: number; life: number };
  const particles: BP[] = [];
  for (let i = 0; i < 28; i++) {
    const angle = (Math.PI * 2 * i) / 28;
    const speed = Math.random() * 5 + 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.sin(angle) * speed - Math.random() * 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 12,
      opacity: 1,
      life: 60,
    });
  }
  let frame = 0;
  const anim = () => {
    frame++;
    if (frame > 80) return;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.angle += p.spin;
      p.opacity = Math.max(0, 1 - frame / 60);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    requestAnimationFrame(anim);
  };
  anim();
}

function playPop() {
  try {
    const AudioCtx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(520 + Math.random() * 300, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0.35, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.25);
  } catch (e) { console.debug(e); }
}

function playFanfare() {
  try {
    const AudioCtx2 = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx2) return;
    const ctx = new AudioCtx2();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "triangle";
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.start(t);
      o.stop(t + 0.55);
    });
  } catch (e) { console.debug(e); }
}

function BalloonCard({ wish, index }: { wish: typeof WISHES[0]; index: number }) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    playPop();
    burstConfettiAt(e.clientX, e.clientY);
  }, []);

  const colors = [
    "from-pink-400 to-rose-500",
    "from-yellow-400 to-orange-500",
    "from-green-400 to-emerald-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-violet-500",
    "from-red-400 to-pink-500",
    "from-teal-400 to-cyan-500",
    "from-amber-400 to-yellow-500",
  ];

  const delay = index * 0.12;

  return (
    <div
      className="cursor-pointer select-none"
      style={{
        animation: `floatIn 0.7s ease-out ${delay}s both, bobble 3s ease-in-out ${delay}s infinite`,
      }}
      onClick={handleClick}
    >
      <div
        className={`relative bg-gradient-to-br ${colors[index % colors.length]} rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform duration-200`}
        style={{ minHeight: "180px" }}
      >
        <div className="text-5xl mb-3 text-center">{wish.emoji}</div>
        <div
          className="text-white font-bold text-xl mb-2 text-center"
          style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem" }}
        >
          {wish.title}
        </div>
        <p className="text-white/90 text-sm text-center leading-relaxed" style={{ fontFamily: "'Rubik', sans-serif" }}>
          {wish.text}
        </p>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-white/40 rounded-full" />
      </div>
    </div>
  );
}

export default function Index() {
  const [started, setStarted] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const canvasRef = useConfetti(started);

  useEffect(() => {
    const canvas = document.getElementById("burst-canvas") as HTMLCanvasElement;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const onResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    playFanfare();
    setStarted(true);
    setTimeout(() => setShowCards(true), 800);
  };

  const handleBurst = (e: React.MouseEvent) => {
    if (!started) return;
    playPop();
    burstConfettiAt(e.clientX, e.clientY);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FF6B9D 0%, #FFD93D 30%, #6BCB77 60%, #4D96FF 100%)" }}
      onClick={handleBurst}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
        style={{ width: "100vw", height: "100vh" }}
      />
      <canvas
        id="burst-canvas"
        className="fixed inset-0 pointer-events-none z-20"
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${60 + (i * 37) % 120}px`,
              height: `${60 + (i * 37) % 120}px`,
              left: `${(i * 83) % 100}%`,
              top: `${(i * 61) % 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animation: `drift ${6 + (i % 4)}s ease-in-out ${i * 0.5}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="relative z-30 min-h-screen flex flex-col items-center justify-start px-4 py-10">
        <div className="text-center mb-10" style={{ animation: "dropIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both" }}>
          <div className="text-8xl mb-4 inline-block" style={{ animation: "spin3d 4s linear infinite" }}>
            🎂
          </div>
          <h1
            className="text-white drop-shadow-lg mb-2"
            style={{
              fontFamily: "'Pacifico', cursive",
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              textShadow: "3px 3px 0 rgba(0,0,0,0.15)",
              lineHeight: 1.2,
            }}
          >
            С Днём Рождения!
          </h1>
          <div
            className="text-white/95 drop-shadow"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              fontWeight: 700,
            }}
          >Дорогая Катя Широкова! 🌸</div>
        </div>

        <div
          className="flex flex-wrap justify-center gap-4 text-4xl mb-8"
          style={{ animation: "floatIn 0.6s ease-out 0.3s both" }}
        >
          {["🎈", "🥳", "🎉", "✨", "🦋", "🎊", "💫", "🎈"].map((e, i) => (
            <span
              key={i}
              className="cursor-pointer hover:scale-125 transition-transform inline-block"
              style={{ animation: `bobble ${2 + (i % 3) * 0.4}s ease-in-out ${i * 0.1}s infinite` }}
              onClick={(ev) => {
                ev.stopPropagation();
                playPop();
                burstConfettiAt(ev.clientX, ev.clientY);
              }}
            >
              {e}
            </span>
          ))}
        </div>

        {!started && (
          <button
            onClick={handleStart}
            className="relative z-40 mb-10"
            style={{ animation: "pulsebtn 1.5s ease-in-out infinite" }}
          >
            <div
              className="bg-white text-pink-500 font-black px-10 py-5 rounded-full shadow-2xl text-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              style={{ fontFamily: "'Rubik', sans-serif", fontSize: "1.4rem" }}
            >
              🎉 Поздравить Катю!
            </div>
          </button>
        )}

        {showCards && (
          <div className="w-full max-w-5xl">
            <h2
              className="text-white text-center mb-8 drop-shadow"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                fontWeight: 700,
                animation: "floatIn 0.5s ease-out both",
              }}
            >
              Нажимай на карточки — там сюрпризы! 👇
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {WISHES.map((wish, i) => (
                <BalloonCard key={i} wish={wish} index={i} />
              ))}
            </div>

            <div
              className="text-center mb-10"
              style={{ animation: "floatIn 0.8s ease-out 1s both" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inline-block bg-white/25 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-2xl border border-white/40 max-w-2xl">
                <p
                  className="text-white leading-relaxed"
                  style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: "clamp(1.2rem, 3vw, 1.6rem)" }}
                >
                  Катя Широкова, с днюхой! 🥳
                  <br /><br />
                  Желаю тебе, чтобы:
                  <br /><br />
                  Лид на хайп был вечным,
                  <br />
                  Кринж обходил стороной,
                  <br />
                  Челленджи были только лёгкими (типа «съесть тортик и не потолстеть»),
                  <br />
                  А вайб был таким, что все вокруг говорили: «Это же шик! Это же Широкова!»
                  <br /><br />
                  Пусть твой кринж-метр всегда будет на нуле, а уровень рофла зашкаливает! И помни: ты настолько имба, что даже баги судьбы облетают тебя стороной. Короче с др
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-6 text-6xl mb-6">
              {["🎈", "🎈", "🎈", "🎈", "🎈"].map((b, i) => (
                <span
                  key={i}
                  className="cursor-pointer hover:text-7xl transition-all duration-200 inline-block"
                  style={{
                    animation: `floatUpDown ${2.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite alternate`,
                    filter: `hue-rotate(${i * 72}deg)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playPop();
                    burstConfettiAt(e.clientX, e.clientY);
                  }}
                >
                  {b}
                </span>
              ))}
            </div>

            <p
              className="text-white/80 text-center text-sm"
              style={{ fontFamily: "'Rubik', sans-serif" }}
            >
              Кликай куда угодно — везде хлопушки! 🎊
            </p>

            <div className="text-center mt-8 pb-10" onClick={(e) => e.stopPropagation()}>
              <div
                className="inline-block bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-3"
                style={{ animation: "floatIn 0.6s ease-out 1.5s both" }}
              >
                <p
                  className="text-white/70 text-sm tracking-widest uppercase"
                  style={{ fontFamily: "'Rubik', sans-serif", letterSpacing: "0.15em" }}
                >
                  с любовью от
                </p>
                <p
                  className="text-white font-bold mt-0.5"
                  style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem" }}
                >
                  timohin kot 🐱
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-60px) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bobble {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes floatUpDown {
          from { transform: translateY(0); }
          to { transform: translateY(-18px); }
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(20px, -30px) scale(1.1); }
        }
        @keyframes spin3d {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes pulsebtn {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }
      `}</style>
    </div>
  );
}