import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import katex from "katex";
import "katex/dist/katex.min.css";

// ── Firebase config ──
const firebaseConfig = {
  apiKey: "AIzaSyCly4zuGcx8FoS_87NJz1dzYh1ERjg_pIU",
  authDomain: "mathwize-d235f.firebaseapp.com",
  projectId: "mathwize-d235f",
  storageBucket: "mathwize-d235f.firebasestorage.app",
  messagingSenderId: "1017910249121",
  appId: "1:1017910249121:web:61119b648541666ee652e0",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ── Colors ──
const C = {
  bg: "#F7F6F3",
  panel: "#FFFFFF",
  border: "#E4E2DC",
  ink: "#1A1916",
  sub: "#6B6860",
  muted: "#A8A59E",
  accent: "#2D6A4F",
  accentL: "#E8F4EF",
  tag: "#F0EEE9",
  red: "#DC2626",
  redL: "#FEE2E2",
};

// ── KaTeX ──
function Tex({ tex, block = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !tex) return;
    try {
      katex.render(tex, ref.current, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      ref.current.textContent = tex;
    }
  }, [tex, block]);
  return (
    <span
      ref={ref}
      style={{
        display: block ? "block" : "inline",
        margin: block ? "6px 0" : "0 1px",
      }}
    />
  );
}

function MathText({ text }) {
  if (!text) return null;
  const parts = text.split(/((?:\$\$)[\s\S]*?(?:\$\$)|\$[^\n$]*?\$)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("$$") && p.endsWith("$$"))
          return <Tex key={i} tex={p.slice(2, -2).trim()} block />;
        if (p.startsWith("$") && p.endsWith("$"))
          return <Tex key={i} tex={p.slice(1, -1).trim()} />;
        return p.split(/(\*\*[^*]+\*\*)/g).map((b, j) =>
          b.startsWith("**") && b.endsWith("**") ? (
            <strong key={j}>{b.slice(2, -2)}</strong>
          ) : (
            <span key={j} style={{ whiteSpace: "pre-wrap" }}>
              {b}
            </span>
          )
        );
      })}
    </>
  );
}

// ── Built-in exercises ──
const BUILTIN = [
  {
    id: 1,
    part: "I",
    topic: "Definición",
    label: "Derivada por definición",
    latex: "f(x)=3x^2-2x",
  },
  {
    id: 2,
    part: "I",
    topic: "Definición",
    label: "Derivada por definición",
    latex: "g(x)=\\sqrt{x-1}",
  },
  {
    id: 3,
    part: "I",
    topic: "Definición",
    label: "Derivada por definición",
    latex: "h(x)=\\sqrt{x^2-2}",
  },
  { id: 4, part: "I", topic: "Trig", label: "Trig", latex: "j(x)=\\cos(3x+2)" },
  { id: 5, part: "I", topic: "Trig", label: "Trig", latex: "k(x)=\\sin(-6x)" },
  {
    id: 6,
    part: "I",
    topic: "Tangente",
    label: "Pendiente tangente",
    latex: "l(x)=\\tfrac{x^2}{2},\\;A(2,2)",
  },
  {
    id: 7,
    part: "I",
    topic: "Tangente",
    label: "Pendiente tangente",
    latex: "m(x)=\\tfrac{x+2}{x+1},\\;x=1",
  },
  {
    id: 8,
    part: "I",
    topic: "Tangente",
    label: "Ecuación tangente",
    latex: "n(x)=\\tfrac{x}{x+1},\\;(4,\\tfrac{4}{5})",
  },
  {
    id: 9,
    part: "I",
    topic: "Tangente",
    label: "Ecuación tangente",
    latex: "p(x)=x^2+4x,\\;x=1",
  },
  {
    id: 10,
    part: "II",
    topic: "Potencia",
    label: "Regla potencia",
    latex: "f(x)=9x^8-7x^4-2x",
  },
  {
    id: 11,
    part: "II",
    topic: "Potencia",
    label: "Regla potencia",
    latex: "g(x)=\\tfrac{1}{x^7}",
  },
  {
    id: 12,
    part: "II",
    topic: "Producto",
    label: "Producto",
    latex: "h(x)=(x^3+2x)(x^2-5)",
  },
  {
    id: 13,
    part: "II",
    topic: "Cociente",
    label: "Cociente",
    latex: "j(x)=\\tfrac{-x^3+2x}{x^2-1}",
  },
  {
    id: 14,
    part: "II",
    topic: "Cadena",
    label: "Cadena",
    latex: "y=\\sqrt{\\sin(x)+x^7}",
  },
  {
    id: 15,
    part: "II",
    topic: "Cadena",
    label: "Cadena",
    latex: "k(x)=(3x+5)^4",
  },
  {
    id: 16,
    part: "II",
    topic: "Log/Exp",
    label: "Log / Exp",
    latex: "y=\\ln(x)+e^{x^2}",
  },
  {
    id: 17,
    part: "II",
    topic: "Log/Exp",
    label: "Base arbitraria",
    latex: "l(x)=4\\cdot5^x+\\log_5(x)",
  },
  {
    id: 18,
    part: "II",
    topic: "Tangente",
    label: "Ecuación tangente",
    latex: "y=\\tfrac{2x^2-4x+3}{2-3x},\\;x=2",
  },
  {
    id: 19,
    part: "III",
    topic: "Orden sup.",
    label: "Segunda derivada",
    latex: "y=-x^4+2x^3+x+4",
  },
  {
    id: 20,
    part: "III",
    topic: "Orden sup.",
    label: "3ª derivada en punto",
    latex: "f(x)=\\ln(x^2+1),\\;f'''(5)",
  },
  {
    id: 21,
    part: "III",
    topic: "Orden sup.",
    label: "Tercera derivada",
    latex: "g(x)=-\\cos(x)",
  },
  {
    id: 22,
    part: "III",
    topic: "Orden sup.",
    label: "Quinta derivada",
    latex: "h(x)=\\ln(x)",
  },
  {
    id: 23,
    part: "III",
    topic: "Orden sup.",
    label: "Tercera derivada",
    latex: "y=x^2\\cos(x)",
  },
  {
    id: 24,
    part: "III",
    topic: "Aplicada",
    label: "Cohete – cinemática",
    latex: "s(t)=2t^4-12t^3+18t^2+5",
  },
  {
    id: 25,
    part: "III",
    topic: "Aplicada",
    label: "Auto autónomo",
    latex: "x(t)=t^3-4t^2+3t",
  },
  {
    id: 26,
    part: "III",
    topic: "Aplicada",
    label: "Caída libre",
    latex: "h(t)=-24t^2+96t+200",
  },
  {
    id: 27,
    part: "IV",
    topic: "Implícita",
    label: "Dif. implícita",
    latex: "x^3+y^3=6xy",
  },
  {
    id: 28,
    part: "IV",
    topic: "Implícita",
    label: "Dif. implícita",
    latex: "x^7+\\tfrac{x}{y}+y^2=7",
  },
  {
    id: 29,
    part: "IV",
    topic: "Implícita",
    label: "Dif. implícita",
    latex: "\\sin(xy)=x+y",
  },
  {
    id: 30,
    part: "IV",
    topic: "Implícita",
    label: "Dif. implícita",
    latex: "e^{xy}=x^2-y",
  },
  {
    id: 31,
    part: "IV",
    topic: "Implícita",
    label: "Dif. implícita",
    latex: "\\sqrt{x+y}=1+5y",
  },
  {
    id: 32,
    part: "IV",
    topic: "Implícita",
    label: "2ª der. implícita",
    latex: "x^2+y^2=16",
  },
  {
    id: 33,
    part: "IV",
    topic: "Implícita",
    label: "3ª der. implícita",
    latex: "x^3+y^2=-2xy",
  },
  {
    id: 34,
    part: "IV",
    topic: "Implícita",
    label: "2ª der. implícita",
    latex: "\\ln(x+y)=x^2-y",
  },
];

const SOLUTIONS = {
  1: {
    answer: "**Respuesta:** $f'(x)=6x-2$",
    step: "**1.** $f(x+h)=3x^2+6xh+3h^2-2x-2h$\n\n**2.** $f(x+h)-f(x)=h(6x+3h-2)$\n\n**3.** $\\lim_{h\\to0}(6x+3h-2)=\\boxed{6x-2}$",
    teach:
      "La derivada por definición usa:\n$$f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}$$\nExpande, factoriza $h$ y toma el límite.\n\n$$f'(x)=6x-2$$",
    exam: "**Pista:** Expande $(x+h)^2$, resta $f(x)$ y factoriza $h$.",
    practice: "1. $f(x)=2x^2+5x$\n2. $g(x)=x^2-4x+1$\n3. $h(x)=3x^3-x^2$",
  },
  2: {
    answer: "**Respuesta:** $g'(x)=\\dfrac{1}{2\\sqrt{x-1}}$",
    step: "**1.** Planear límite\n**2.** Racionalizar con conjugado\n**3.** $$g'=\\frac{1}{2\\sqrt{x-1}}$$",
    teach:
      "Racionaliza con el conjugado $\\sqrt{x+h-1}+\\sqrt{x-1}$ para cancelar $h$.\n$$g'=\\frac{1}{2\\sqrt{x-1}}$$",
    exam: "**Pista:** Multiplica por el conjugado $\\sqrt{x+h-1}+\\sqrt{x-1}$.",
    practice: "1. $\\sqrt{x}$\n2. $\\sqrt{2x+3}$\n3. $\\sqrt{x^2+1}$",
  },
  3: {
    answer: "**Respuesta:** $h'(x)=\\dfrac{x}{\\sqrt{x^2-2}}$",
    step: "Racionalizar. Numerador: $h(2x+h)$\n$$h'=\\frac{x}{\\sqrt{x^2-2}}$$",
    teach:
      "Igual que #2: racionaliza con conjugado.\n$$h'=\\frac{x}{\\sqrt{x^2-2}}$$",
    exam: "**Pista:** Expande $(x+h)^2$ y racionaliza.",
    practice: "1. $\\sqrt{x^2+1}$\n2. $\\sqrt{x^2-5}$",
  },
  4: {
    answer: "**Respuesta:** $j'(x)=-3\\sin(3x+2)$",
    step: "Cadena: $u=3x+2$, $u'=3$\n$$j'=-3\\sin(3x+2)$$",
    teach: "$[\\cos u]'=-\\sin u\\cdot u'$. Con $u=3x+2$: $j'=-3\\sin(3x+2)$",
    exam: "**Pista:** Derivada de $\\cos$ es $-\\sin$, multiplica por $u'$.",
    practice: "1. $\\cos(5x)$\n2. $\\cos(x^2)$",
  },
  5: {
    answer: "**Respuesta:** $k'(x)=-6\\cos(-6x)$",
    step: "$u=-6x$, $u'=-6$\n$$k'=-6\\cos(-6x)$$",
    teach: "$[\\sin u]'=\\cos u\\cdot u'$. Con $u=-6x$: $k'=-6\\cos(-6x)$",
    exam: "**Pista:** Derivada de $\\sin$ es $\\cos$, multiplica por $-6$.",
    practice: "1. $\\sin(4x)$\n2. $\\sin(x^3)$",
  },
  6: {
    answer: "**Respuesta:** $m=2$",
    step: "$l'(x)=x \\Rightarrow l'(2)=2$",
    teach: "Pendiente tangente = $f'(x_0)$. $l'(x)=x$, en $x=2$: $m=2$",
    exam: "**Pista:** Deriva y evalúa en $x=2$.",
    practice: "1. $x^2$ en $x=3$\n2. $x^3/3$ en $x=2$",
  },
  7: {
    answer: "**Respuesta:** $m=-\\dfrac{1}{4}$",
    step: "Cociente: $m'(x)=\\frac{-1}{(x+1)^2}$\n$m'(1)=-\\frac{1}{4}$",
    teach: "Regla del cociente, evalúa en $x=1$: $m=-1/4$",
    exam: "**Pista:** Aplica cociente y evalúa en $x=1$.",
    practice: "1. $\\frac{x+1}{x-1}$ en $x=2$",
  },
  8: {
    answer: "**Respuesta:** $y=\\dfrac{x}{25}+\\dfrac{16}{25}$",
    step: "$n'(4)=\\frac{1}{25}$\n$y=\\frac{x}{25}+\\frac{16}{25}$",
    teach: "$m=n'(4)=1/25$, punto $(4,4/5)$: $y=x/25+16/25$",
    exam: "**Pista:** Halla $n'(4)$ y usa punto-pendiente.",
    practice: "1. $\\frac{1}{x}$ en $(2,1/2)$",
  },
  9: {
    answer: "**Respuesta:** $y=6x-1$",
    step: "$p'(1)=6$, $p(1)=5$\n$y=6x-1$",
    teach: "Deriva, $m=6$, punto $(1,5)$: $y=6x-1$",
    exam: "**Pista:** Calcula $p'(1)$ y $p(1)$.",
    practice: "1. $x^2-3x$ en $x=2$",
  },
  10: {
    answer: "**Respuesta:** $f'(x)=72x^7-28x^3-2$",
    step: "Potencia término a término:\n$$72x^7-28x^3-2$$",
    teach: "$9x^8\\to72x^7$, $-7x^4\\to-28x^3$, $-2x\\to-2$",
    exam: "**Pista:** $nx^{n-1}$ a cada término.",
    practice: "1. $5x^4-3x^2$\n2. $x^6-2x^5$",
  },
  11: {
    answer: "**Respuesta:** $g'=-\\dfrac{7}{x^8}$",
    step: "$x^{-7}\\Rightarrow -7x^{-8}$",
    teach: "$1/x^7=x^{-7}\\Rightarrow g'=-7x^{-8}$",
    exam: "**Pista:** Reescribe como $x^{-7}$.",
    practice: "1. $1/x^3$\n2. $1/x^5$",
  },
  12: {
    answer: "**Respuesta:** $h'=5x^4-9x^2-10$",
    step: "Expandir: $x^5-3x^3-10x$\n$h'=5x^4-9x^2-10$",
    teach: "Expande o usa producto. $h'=5x^4-9x^2-10$",
    exam: "**Pista:** Expande primero.",
    practice: "1. $(x^2+1)(x^3-2)$",
  },
  13: {
    answer: "**Respuesta:** $j'=\\dfrac{-x^4+x^2-2}{(x^2-1)^2}$",
    step: "Cociente: numerador $-x^4+x^2-2$",
    teach: "$(f/g)'=(f'g-fg')/g^2$",
    exam: "**Pista:** Identifica $f$, $g$ y aplica cociente.",
    practice: "1. $\\frac{x^2+1}{x-1}$",
  },
  14: {
    answer: "**Respuesta:** $y'=\\dfrac{\\cos x+7x^6}{2\\sqrt{\\sin x+x^7}}$",
    step: "$u=\\sin x+x^7$, $u'=\\cos x+7x^6$\n$$y'=\\frac{u'}{2\\sqrt{u}}$$",
    teach: "$[\\sqrt{u}]'=u'/(2\\sqrt{u})$",
    exam: "**Pista:** $u=\\sin x+x^7$, aplica cadena.",
    practice: "1. $\\sqrt{\\cos x+x^2}$",
  },
  15: {
    answer: "**Respuesta:** $k'=12(3x+5)^3$",
    step: "$u=3x+5$, $u'=3$: $k'=12(3x+5)^3$",
    teach: "$[u^n]'=nu^{n-1}u'$",
    exam: "**Pista:** $u=3x+5$, $u'=3$.",
    practice: "1. $(2x+1)^5$\n2. $(x^2-3)^4$",
  },
  16: {
    answer: "**Respuesta:** $y'=\\dfrac{1}{x}+2xe^{x^2}$",
    step: "$[\\ln x]'=1/x$, $[e^{x^2}]'=2xe^{x^2}$",
    teach: "Dos reglas: $[\\ln x]'=1/x$ y $[e^u]'=e^u u'$",
    exam: "**Pista:** Usa cadena para $e^{x^2}$.",
    practice: "1. $\\ln x+e^{3x}$",
  },
  17: {
    answer: "**Respuesta:** $l'=4\\cdot5^x\\ln5+\\dfrac{1}{x\\ln5}$",
    step: "$[a^x]'=a^x\\ln a$, $[\\log_a x]'=\\frac{1}{x\\ln a}$",
    teach: "Base arbitraria: $[5^x]'=5^x\\ln5$",
    exam: "**Pista:** Usa $[a^x]'=a^x\\ln a$.",
    practice: "1. $3^x+\\log_3 x$",
  },
  18: {
    answer: "**Respuesta:** Aplica cociente en $x=2$.",
    step: "Cociente→ $y'(2)$→ $y(2)$→ tangente",
    teach: "Regla del cociente + punto-pendiente.",
    exam: "**Pista:** Evalúa en $x=2$.",
    practice: "1. $\\frac{x^2+1}{x-2}$ en $x=3$",
  },
  19: {
    answer: "**Respuesta:** $y''=-12x^2+12x$",
    step: "$y'=-4x^3+6x^2+1$\n$y''=-12x^2+12x$",
    teach: "Dos derivadas con potencia.",
    exam: "**Pista:** Deriva dos veces.",
    practice: "1. $x^5-3x^3$",
  },
  20: {
    answer: "**Respuesta:** $f'''(5)=\\dfrac{220}{2197}$",
    step: "$f'=\\frac{2x}{x^2+1}$, $f''=\\frac{2-2x^2}{(x^2+1)^2}$, $f'''(5)=\\frac{220}{2197}$",
    teach: "Tres derivadas con cadena y cociente.",
    exam: "**Pista:** $f'=\\frac{2x}{x^2+1}$.",
    practice: "1. $\\ln(x+1)$, halla $f'''$",
  },
  21: {
    answer: "**Respuesta:** $g'''=-\\sin x$",
    step: "$g'=\\sin x$, $g''=\\cos x$, $g'''=-\\sin x$",
    teach: "Ciclo: $-\\cos\\to\\sin\\to\\cos\\to-\\sin$",
    exam: "**Pista:** Ciclo de derivadas trig.",
    practice: "1. $\\sin x$, halla $f'''$",
  },
  22: {
    answer: "**Respuesta:** $h^{(5)}=\\dfrac{24}{x^5}$",
    step: "Patrón: $h^{(n)}=\\frac{(-1)^{n-1}(n-1)!}{x^n}$\nPara $n=5$: $\\frac{24}{x^5}$",
    teach: "$[\\ln x]^{(n)}=\\frac{(-1)^{n-1}(n-1)!}{x^n}$",
    exam: "**Pista:** Primera derivada es $x^{-1}$.",
    practice: "1. $\\ln x$, halla $f^{(4)}$",
  },
  23: {
    answer: "**Respuesta:** $y'''=-6\\sin x-6x\\cos x+x^2\\sin x$",
    step: "$y'=2x\\cos x-x^2\\sin x$\n$y''=2\\cos x-4x\\sin x-x^2\\cos x$\n$y'''=-6\\sin x-6x\\cos x+x^2\\sin x$",
    teach: "Tres aplicaciones de regla del producto.",
    exam: "**Pista:** Empieza con $y'$ usando producto.",
    practice: "1. $x\\sin x$, halla $y'''$",
  },
  24: {
    answer: "**Respuesta:** $v=8t^3-36t^2+36t$, $a=24t^2-72t+36$",
    step: "$v=s'=8t^3-36t^2+36t$\n$a=v'=24t^2-72t+36$",
    teach: "$v=s'$, $a=s''$",
    exam: "**Pista:** $v=s'$, $a=s''$.",
    practice: "1. $s=t^3-6t^2+9t$",
  },
  25: {
    answer: "**Respuesta:** $v=3t^2-8t+3$, $a=6t-8$",
    step: "$v=x'=3t^2-8t+3$\n$a=x''=6t-8$",
    teach: "$v=x'$, $a=x''$",
    exam: "**Pista:** Deriva una y dos veces.",
    practice: "1. $x=2t^3-t^2+5t$",
  },
  26: {
    answer: "**Respuesta:** $v=-48t+96$, $a=-48$",
    step: "$v=h'=-48t+96$\n$a=h''=-48$",
    teach: "Aceleración constante = caída libre.",
    exam: "**Pista:** Deriva dos veces.",
    practice: "1. $h=-16t^2+64t+100$",
  },
  27: {
    answer: "**Respuesta:** $y'=\\dfrac{2y-x^2}{y^2-2x}$",
    step: "$3x^2+3y^2y'=6y+6xy'$\n$$y'=\\frac{2y-x^2}{y^2-2x}$$",
    teach: "Derivar ambos lados, despejar $y'$.",
    exam: "**Pista:** Al derivar $y^3$ obtienes $3y^2y'$.",
    practice: "1. $x^2+y^2=25$",
  },
  28: {
    answer: "**Respuesta:** $y'=\\dfrac{7x^6y^2+y}{x-2y^3}$",
    step: "$7x^6+\\frac{y-xy'}{y^2}+2yy'=0$\n$$y'=\\frac{7x^6y^2+y}{x-2y^3}$$",
    teach: "Al derivar $x/y$ usa cociente implícito.",
    exam: "**Pista:** $d/dx[x/y]=(y-xy')/y^2$.",
    practice: "1. $x^2+y/x=5$",
  },
  29: {
    answer: "**Respuesta:** $y'=\\dfrac{1-y\\cos(xy)}{x\\cos(xy)-1}$",
    step: "$\\cos(xy)(y+xy')=1+y'$\n$$y'=\\frac{1-y\\cos(xy)}{x\\cos(xy)-1}$$",
    teach: "$[\\sin(xy)]'=\\cos(xy)(y+xy')$",
    exam: "**Pista:** Cadena: $[\\sin(xy)]'=\\cos(xy)(y+xy')$.",
    practice: "1. $\\cos(xy)=x-y$",
  },
  30: {
    answer: "**Respuesta:** $y'=\\dfrac{2x-ye^{xy}}{xe^{xy}+1}$",
    step: "$e^{xy}(y+xy')=2x-y'$\n$$y'=\\frac{2x-ye^{xy}}{xe^{xy}+1}$$",
    teach: "$[e^{xy}]'=e^{xy}(y+xy')$",
    exam: "**Pista:** Deriva $e^{xy}$ con cadena.",
    practice: "1. $e^{x+y}=x^2$",
  },
  31: {
    answer: "**Respuesta:** $y'=\\dfrac{1}{10\\sqrt{x+y}-1}$",
    step: "$\\frac{1+y'}{2\\sqrt{x+y}}=5y'$\n$$y'=\\frac{1}{10\\sqrt{x+y}-1}$$",
    teach: "$[\\sqrt{x+y}]'=\\frac{1+y'}{2\\sqrt{x+y}}$",
    exam: "**Pista:** Derivada de $\\sqrt{x+y}$ es $\\frac{1+y'}{2\\sqrt{x+y}}$.",
    practice: "1. $\\sqrt{x+y}=x+1$",
  },
  32: {
    answer: "**Respuesta:** $y''=-\\dfrac{16}{y^3}$",
    step: "$y'=-x/y$\n$y''=-(x^2+y^2)/y^3=-16/y^3$",
    teach: "Derivar dos veces, usar $x^2+y^2=16$.",
    exam: "**Pista:** Halla $y'=-x/y$ primero.",
    practice: "1. $x^2-y^2=1$",
  },
  33: {
    answer: "**Tres derivadas implícitas** de $x^3+y^2=-2xy$.",
    step: "$y'=\\frac{-3x^2-2y}{2(x+y)}$\nLuego derivar dos veces más.",
    teach: "Cada orden superior deriva el resultado previo.",
    exam: "**Pista:** Halla $y'$ primero.",
    practice: "1. $x^2+y^2=1$, halla $y'''$",
  },
  34: {
    answer: "**Respuesta:** $y'=\\dfrac{2x(x+y)-1}{1+x+y}$",
    step: "$\\frac{1+y'}{x+y}=2x-y'$\n$$y'=\\frac{2x(x+y)-1}{1+x+y}$$",
    teach: "$[\\ln(x+y)]'=\\frac{1+y'}{x+y}$",
    exam: "**Pista:** Derivada de $\\ln(x+y)$ es $\\frac{1+y'}{x+y}$.",
    practice: "1. $\\ln(x+y)=x+y$",
  },
};

const MODES = [
  { id: "answer", label: "Respuesta" },
  { id: "step", label: "Paso a paso" },
  { id: "teach", label: "Enséñame" },
  { id: "exam", label: "Pista" },
  { id: "practice", label: "Práctica" },
];
function getSolution(id, mode) {
  const s = SOLUTIONS[id];
  if (!s) return "Solución no disponible.";
  return s[mode] || s.step;
}
function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: C.muted,
            display: "inline-block",
            animation: `mwDot 1s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

// ════════════════════════════════════════
// LOGIN SCREEN
// ════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleGoogle() {
    setLoading(true);
    setErr("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if user exists in Firestore
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        // New user — needs to choose role
        onLogin(user, null);
      } else {
        onLogin(user, snap.data().role);
      }
    } catch (e) {
      setErr("Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia',serif",
      }}
    >
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes mwDot{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
      <div
        style={{
          background: C.panel,
          border: "1px solid " + C.border,
          borderRadius: 8,
          padding: "48px 40px",
          textAlign: "center",
          width: "100%",
          maxWidth: 380,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-1px",
            marginBottom: 6,
          }}
        >
          MathWise
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 36 }}>
          Cálculo Diferencial
        </div>
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 20px",
            borderRadius: 6,
            border: "1px solid " + C.border,
            background: C.panel,
            color: C.ink,
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all .15s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          {loading ? "Cargando..." : "Continuar con Google"}
        </button>
        {err && (
          <div style={{ marginTop: 12, fontSize: 12, color: C.red }}>{err}</div>
        )}
        <div
          style={{
            marginTop: 24,
            fontSize: 11,
            color: C.muted,
            lineHeight: 1.6,
          }}
        >
          Al iniciar sesión aceptas usar esta plataforma con fines educativos.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// ROLE PICKER
// ════════════════════════════════════════
function RolePicker({ user, onRoleSaved }) {
  const [loading, setLoading] = useState(false);

  async function pick(role) {
    setLoading(true);
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      role,
      createdAt: new Date().toISOString(),
    });
    onRoleSaved(role);
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia',serif",
      }}
    >
      <div
        style={{
          background: C.panel,
          border: "1px solid " + C.border,
          borderRadius: 8,
          padding: "48px 40px",
          textAlign: "center",
          width: "100%",
          maxWidth: 420,
        }}
      >
        <img
          src={user.photoURL}
          alt=""
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            marginBottom: 16,
          }}
        />
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          Hola, {user.displayName.split(" ")[0]}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 32 }}>
          ¿Cómo vas a usar MathWise?
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            {
              role: "tutor",
              icon: "👨‍🏫",
              title: "Soy Tutor",
              desc: "Subo guías y las asigno a estudiantes",
            },
            {
              role: "student",
              icon: "👨‍🎓",
              title: "Soy Estudiante",
              desc: "Resuelvo los ejercicios asignados",
            },
          ].map((r) => (
            <button
              key={r.role}
              onClick={() => pick(r.role)}
              disabled={loading}
              style={{
                flex: 1,
                padding: "20px 12px",
                borderRadius: 8,
                border: "1px solid " + C.border,
                background: C.bg,
                cursor: "pointer",
                transition: "all .15s",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{r.icon}</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.ink,
                  marginBottom: 4,
                }}
              >
                {r.title}
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                {r.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TUTOR DASHBOARD
// ════════════════════════════════════════
function TutorDashboard({ user }) {
  const [tab, setTab] = useState("guides"); // guides | students | assign
  const [guides, setGuides] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [newGuide, setNewGuide] = useState({
    title: "",
    description: "",
    exercises: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [selGuide, setSelGuide] = useState("");
  const [selStudent, setSelStudent] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Load guides by this tutor
    const gSnap = await getDocs(
      query(collection(db, "guides"), where("tutorId", "==", user.uid))
    );
    setGuides(gSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    // Load all students
    const sSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "student"))
    );
    setStudents(sSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    // Load assignments
    const aSnap = await getDocs(
      query(collection(db, "assignments"), where("tutorId", "==", user.uid))
    );
    setAssignments(aSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function saveGuide() {
    if (!newGuide.title.trim() || !newGuide.exercises.trim()) {
      setMsg("Completa el título y los ejercicios.");
      return;
    }
    setSaving(true);
    await addDoc(collection(db, "guides"), {
      tutorId: user.uid,
      tutorName: user.displayName,
      title: newGuide.title,
      description: newGuide.description,
      exercises: newGuide.exercises,
      createdAt: new Date().toISOString(),
    });
    setMsg("¡Guía guardada!");
    setNewGuide({ title: "", description: "", exercises: "" });
    setSaving(false);
    loadData();
  }

  async function assign() {
    if (!selGuide || !selStudent) {
      setMsg("Selecciona guía y estudiante.");
      return;
    }
    const g = guides.find((x) => x.id === selGuide);
    const s = students.find((x) => x.id === selStudent);
    await addDoc(collection(db, "assignments"), {
      tutorId: user.uid,
      tutorName: user.displayName,
      studentId: selStudent,
      studentName: s.name,
      guideId: selGuide,
      guideTitle: g.title,
      assignedAt: new Date().toISOString(),
      status: "pending",
    });
    setMsg("¡Asignado a " + s.name + "!");
    setSelGuide("");
    setSelStudent("");
    loadData();
  }

  const inp = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 4,
    border: "1px solid " + C.border,
    background: C.bg,
    color: C.ink,
    fontSize: 13,
    fontFamily: "'Georgia',serif",
    marginBottom: 10,
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        fontFamily: "'Georgia',serif",
        color: C.ink,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid " + C.border,
          background: C.panel,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>MathWise</span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 99,
              background: C.accentL,
              color: C.accent,
              fontWeight: 700,
            }}
          >
            TUTOR
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={user.photoURL}
            alt=""
            style={{ width: 28, height: 28, borderRadius: "50%" }}
          />
          <span style={{ fontSize: 12, color: C.sub }}>{user.displayName}</span>
          <button
            onClick={() => signOut(auth)}
            style={{
              fontSize: 11,
              color: C.muted,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid " + C.border,
          background: C.panel,
          flexShrink: 0,
        }}
      >
        {[
          { id: "guides", label: "📚 Mis Guías" },
          { id: "create", label: "➕ Nueva Guía" },
          { id: "assign", label: "📋 Asignar" },
          { id: "students", label: "👥 Estudiantes" },
        ].map((t) => {
          const a = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setMsg("");
              }}
              style={{
                padding: "10px 18px",
                fontSize: 13,
                border: "none",
                borderBottom: "2px solid " + (a ? C.accent : "transparent"),
                background: "transparent",
                color: a ? C.accent : C.sub,
                fontWeight: a ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {msg && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 4,
              background: C.accentL,
              color: C.accent,
              fontSize: 13,
              border: "1px solid " + C.accent + "40",
            }}
          >
            {msg}
          </div>
        )}

        {/* My Guides */}
        {tab === "guides" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Mis guías ({guides.length})
            </div>
            {guides.length === 0 && (
              <div style={{ color: C.muted, fontSize: 13 }}>
                Aún no has creado ninguna guía. Ve a "Nueva Guía".
              </div>
            )}
            {guides.map((g) => (
              <div
                key={g.id}
                style={{
                  background: C.panel,
                  border: "1px solid " + C.border,
                  borderRadius: 6,
                  padding: "16px",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {g.title}
                </div>
                {g.description && (
                  <div style={{ fontSize: 12, color: C.sub, marginBottom: 8 }}>
                    {g.description}
                  </div>
                )}
                <div style={{ fontSize: 11, color: C.muted }}>
                  {g.exercises.split("\n").filter(Boolean).length} ejercicios ·{" "}
                  {new Date(g.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Guide */}
        {tab === "create" && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Nueva guía
            </div>
            <label
              style={{
                fontSize: 12,
                color: C.sub,
                display: "block",
                marginBottom: 4,
              }}
            >
              Título *
            </label>
            <input
              value={newGuide.title}
              onChange={(e) =>
                setNewGuide((g) => ({ ...g, title: e.target.value }))
              }
              placeholder="Ej: Guía de Derivadas — Parcial 1"
              style={inp}
            />
            <label
              style={{
                fontSize: 12,
                color: C.sub,
                display: "block",
                marginBottom: 4,
              }}
            >
              Descripción (opcional)
            </label>
            <input
              value={newGuide.description}
              onChange={(e) =>
                setNewGuide((g) => ({ ...g, description: e.target.value }))
              }
              placeholder="Ej: Ejercicios para preparar el parcial del viernes"
              style={inp}
            />
            <label
              style={{
                fontSize: 12,
                color: C.sub,
                display: "block",
                marginBottom: 4,
              }}
            >
              Ejercicios * (uno por línea, empieza con número)
            </label>
            <textarea
              value={newGuide.exercises}
              onChange={(e) =>
                setNewGuide((g) => ({ ...g, exercises: e.target.value }))
              }
              placeholder={
                "1. f(x) = 3x² - 2x, halla f'(x)\n2. g(x) = √(x-1), halla g'(x)\n3. h(x) = cos(3x+2), halla h'(x)"
              }
              rows={8}
              style={{ ...inp, resize: "vertical" }}
            />
            <button
              onClick={saveGuide}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: 4,
                border: "none",
                background: C.ink,
                color: "#fff",
                fontSize: 13,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Guardar guía"}
            </button>
          </div>
        )}

        {/* Assign */}
        {tab === "assign" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Asignar guía a estudiante
            </div>
            <label
              style={{
                fontSize: 12,
                color: C.sub,
                display: "block",
                marginBottom: 4,
              }}
            >
              Selecciona guía
            </label>
            <select
              value={selGuide}
              onChange={(e) => setSelGuide(e.target.value)}
              style={{ ...inp, cursor: "pointer" }}
            >
              <option value="">-- Elige una guía --</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
            <label
              style={{
                fontSize: 12,
                color: C.sub,
                display: "block",
                marginBottom: 4,
              }}
            >
              Selecciona estudiante
            </label>
            <select
              value={selStudent}
              onChange={(e) => setSelStudent(e.target.value)}
              style={{ ...inp, cursor: "pointer" }}
            >
              <option value="">-- Elige un estudiante --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
            <button
              onClick={assign}
              style={{
                padding: "10px 24px",
                borderRadius: 4,
                border: "none",
                background: C.ink,
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Asignar
            </button>

            {assignments.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}
                >
                  Asignaciones recientes
                </div>
                {assignments
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((a) => (
                    <div
                      key={a.id}
                      style={{
                        padding: "8px 12px",
                        background: C.panel,
                        border: "1px solid " + C.border,
                        borderRadius: 4,
                        marginBottom: 6,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{a.studentName}</span> →{" "}
                      {a.guideTitle}
                      <span style={{ color: C.muted, marginLeft: 8 }}>
                        {new Date(a.assignedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Students */}
        {tab === "students" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Estudiantes registrados ({students.length})
            </div>
            {students.length === 0 && (
              <div style={{ color: C.muted, fontSize: 13 }}>
                Aún no hay estudiantes registrados.
              </div>
            )}
            {students.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px",
                  background: C.panel,
                  border: "1px solid " + C.border,
                  borderRadius: 6,
                  marginBottom: 8,
                }}
              >
                {s.photo && (
                  <img
                    src={s.photo}
                    alt=""
                    style={{ width: 36, height: 36, borderRadius: "50%" }}
                  />
                )}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{s.email}</div>
                </div>
                <div
                  style={{ marginLeft: "auto", fontSize: 11, color: C.accent }}
                >
                  {assignments.filter((a) => a.studentId === s.id).length} guías
                  asignadas
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// STUDENT DASHBOARD
// ════════════════════════════════════════
function StudentDashboard({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [activeGuide, setActiveGuide] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [exercise, setExercise] = useState(null);
  const [mode, setMode] = useState("step");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showing, setShowing] = useState(false);
  const [solved, setSolved] = useState(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("mw_s_" + user.uid) || "[]")
      );
    } catch {
      return new Set();
    }
  });
  const [tab, setTab] = useState("assigned"); // assigned | builtin
  const [filter, setFilter] = useState("all");
  const chatEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadAssignments();
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("mw_s_" + user.uid, JSON.stringify([...solved]));
    } catch {}
  }, [solved]);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showing]);

  async function loadAssignments() {
    const snap = await getDocs(
      query(collection(db, "assignments"), where("studentId", "==", user.uid))
    );
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setAssignments(list);
  }

  async function openGuide(a) {
    // Load guide exercises
    const snap = await getDoc(doc(db, "guides", a.guideId));
    if (snap.exists()) {
      const data = snap.data();
      const lines = data.exercises
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const exs = [];
      lines.forEach((line, i) => {
        exs.push({
          id: "custom_" + (i + 1),
          part: "—",
          topic: "Guía",
          label: line.slice(0, 80),
          latex: null,
          raw: line,
        });
      });
      setExercises(exs);
      setActiveGuide({ ...a, guideData: data });
      setTab("guide");
    }
  }

  function openExercise(ex) {
    setExercise(ex);
    setShowing(false);
    setMessages([
      {
        role: "assistant",
        content:
          "Ejercicio: " +
          ex.label +
          (ex.latex ? "\n\n$$" + ex.latex + "$$" : "") +
          "\n\nSelecciona un modo y presiona **Resolver**.",
      },
    ]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 150);
  }

  function resolve() {
    if (!exercise || showing) return;
    setShowing(true);
    setTimeout(() => {
      let content;
      if (exercise.part === "—") {
        content =
          "**Ejercicio de tu guía:**\n\n" +
          exercise.raw +
          "\n\nEscribe tu duda y te guío.";
      } else {
        content = getSolution(exercise.id, mode);
      }
      setMessages((h) => [...h, { role: "assistant", content }]);
      setSolved((s) => new Set([...s, exercise.id]));
      setShowing(false);
    }, 600);
  }

  function handleUserMsg(text) {
    if (!exercise || !text.trim()) return;
    setMessages((h) => [...h, { role: "user", content: text }]);
    setInput("");
    setShowing(true);
    setTimeout(() => {
      const t = text.toLowerCase();
      let reply = "";
      if (t.includes("no entend") || t.includes("confund"))
        reply =
          exercise.part !== "—"
            ? getSolution(exercise.id, "teach")
            : "Describe cuál parte no entendiste.";
      else if (t.includes("pista") || t.includes("ayuda"))
        reply =
          exercise.part !== "—"
            ? getSolution(exercise.id, "exam")
            : "Escríbeme más detalles.";
      else if (t.includes("práctica") || t.includes("similar"))
        reply =
          exercise.part !== "—"
            ? getSolution(exercise.id, "practice")
            : "¿Cuál es el tema?";
      else if (t.includes("respuesta") || t.includes("resultado"))
        reply =
          exercise.part !== "—"
            ? getSolution(exercise.id, "answer")
            : "Escríbeme el enunciado completo.";
      else
        reply =
          exercise.part !== "—"
            ? "Aquí el desarrollo:\n\n" + getSolution(exercise.id, "step")
            : "Escríbeme el enunciado completo del ejercicio.";
      setMessages((h) => [...h, { role: "assistant", content: reply }]);
      setSolved((s) => new Set([...s, exercise.id]));
      setShowing(false);
    }, 500);
  }

  const currentExercises =
    tab === "builtin"
      ? filter === "all"
        ? BUILTIN
        : BUILTIN.filter((e) => e.topic === filter)
      : exercises;
  const topics = [...new Set(BUILTIN.map((e) => e.topic))];
  const pct = Math.floor((solved.size / BUILTIN.length) * 100);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        fontFamily: "'Georgia',serif",
        color: C.ink,
        overflow: "hidden",
      }}
    >
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes mwDot{0%,100%{opacity:.3}50%{opacity:1}}@keyframes mwIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}button,textarea,select{font-family:inherit;}textarea:focus{outline:none;}`}</style>

      {/* Header */}
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid " + C.border,
          background: C.panel,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>MathWise</span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 99,
              background: "#EEF2FF",
              color: "#4338CA",
              fontWeight: 700,
            }}
          >
            ESTUDIANTE
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: C.sub }}>
            {solved.size}/{BUILTIN.length}
          </span>
          <div
            style={{
              width: 60,
              height: 3,
              borderRadius: 2,
              background: C.border,
            }}
          >
            <div
              style={{
                height: "100%",
                width: pct + "%",
                background: C.accent,
                borderRadius: 2,
              }}
            />
          </div>
          <img
            src={user.photoURL}
            alt=""
            style={{ width: 28, height: 28, borderRadius: "50%" }}
          />
          <button
            onClick={() => signOut(auth)}
            style={{
              fontSize: 11,
              color: C.muted,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Salir
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 224,
            flexShrink: 0,
            background: C.panel,
            borderRight: "1px solid " + C.border,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{ display: "flex", borderBottom: "1px solid " + C.border }}
          >
            {[
              { id: "assigned", label: "📋 Asignadas" },
              { id: "builtin", label: "📚 Guía 12°" },
            ].map((t) => {
              const a = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setExercise(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "9px 4px",
                    fontSize: 11,
                    border: "none",
                    borderBottom: "2px solid " + (a ? C.accent : "transparent"),
                    background: "transparent",
                    color: a ? C.accent : C.muted,
                    fontWeight: a ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === "assigned" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {assignments.length === 0 ? (
                <div
                  style={{
                    padding: "20px 14px",
                    textAlign: "center",
                    color: C.muted,
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Tu tutor aún no te ha asignado ninguna guía.
                </div>
              ) : (
                <>
                  <div
                    style={{
                      padding: "10px 14px 4px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.muted,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Guías asignadas
                  </div>
                  {assignments.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => openGuide(a)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background:
                          activeGuide?.id === a.id ? C.accentL : "transparent",
                        border: "none",
                        borderLeft:
                          "2px solid " +
                          (activeGuide?.id === a.id ? C.accent : "transparent"),
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{ fontSize: 12, fontWeight: 600, color: C.ink }}
                      >
                        {a.guideTitle}
                      </div>
                      <div
                        style={{ fontSize: 10, color: C.muted, marginTop: 2 }}
                      >
                        de {a.tutorName}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted }}>
                        {new Date(a.assignedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                  {activeGuide && exercises.length > 0 && (
                    <>
                      <div
                        style={{
                          padding: "10px 14px 4px",
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.muted,
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                          marginTop: 8,
                        }}
                      >
                        Ejercicios
                      </div>
                      {exercises.map((ex) => {
                        const a = exercise?.id === ex.id;
                        return (
                          <button
                            key={ex.id}
                            onClick={() => openExercise(ex)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: a ? C.accentL : "transparent",
                              border: "none",
                              borderLeft:
                                "2px solid " + (a ? C.accent : "transparent"),
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                color: a ? C.accent : C.ink,
                                fontWeight: a ? 600 : 400,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ex.label}
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "builtin" && (
            <>
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid " + C.border,
                }}
              >
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 4,
                    border: "1px solid " + C.border,
                    background: C.bg,
                    color: C.ink,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <option value="all">Todos los temas</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {["I", "II", "III", "IV"].map((part) => {
                  const items = currentExercises.filter((e) => e.part === part);
                  if (!items.length) return null;
                  return (
                    <div key={part}>
                      <div
                        style={{
                          padding: "10px 14px 4px",
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.muted,
                          letterSpacing: ".12em",
                          textTransform: "uppercase",
                        }}
                      >
                        Parte {part}
                      </div>
                      {items.map((ex) => {
                        const a = exercise?.id === ex.id,
                          done = solved.has(ex.id);
                        return (
                          <button
                            key={ex.id}
                            onClick={() => openExercise(ex)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: a ? C.accentL : "transparent",
                              border: "none",
                              borderLeft:
                                "2px solid " + (a ? C.accent : "transparent"),
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: a ? C.accent : C.ink,
                                  fontWeight: a ? 600 : 400,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {"#" + ex.id + " " + ex.label}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: C.muted,
                                  marginTop: 1,
                                }}
                              >
                                {ex.topic}
                              </div>
                            </div>
                            {done && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: C.accent,
                                  flexShrink: 0,
                                  marginLeft: 4,
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Chat */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 2,
              padding: "8px 16px",
              borderBottom: "1px solid " + C.border,
              background: C.panel,
              flexShrink: 0,
            }}
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: "pointer",
                  background: mode === m.id ? C.ink : "transparent",
                  color: mode === m.id ? "#fff" : C.sub,
                  border:
                    mode === m.id
                      ? "1px solid " + C.ink
                      : "1px solid transparent",
                  transition: "all .15s",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {exercise && (
            <div
              style={{
                padding: "10px 18px",
                borderBottom: "1px solid " + C.border,
                background: C.panel,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>
                  {exercise.label}
                </div>
                {exercise.latex ? (
                  <div style={{ fontSize: 14 }}>
                    <Tex tex={exercise.latex} />
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: C.sub }}>
                    {exercise.raw}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                {solved.has(exercise.id) && (
                  <span style={{ fontSize: 11, color: C.accent }}>✓</span>
                )}
                <button
                  onClick={resolve}
                  disabled={showing}
                  style={{
                    padding: "7px 18px",
                    borderRadius: 4,
                    border: "1px solid " + (showing ? C.border : C.ink),
                    background: showing ? C.tag : C.ink,
                    color: showing ? C.muted : "#fff",
                    fontSize: 13,
                    cursor: showing ? "not-allowed" : "pointer",
                  }}
                >
                  {showing ? "..." : "Resolver"}
                </button>
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
            {!exercise ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  color: C.muted,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 13 }}>
                  Selecciona un ejercicio del panel izquierdo.
                </div>
                <div style={{ fontSize: 11, maxWidth: 260, lineHeight: 1.6 }}>
                  Puedes ver tus guías asignadas por tu tutor o practicar con la
                  Guía 12°.
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={i}
                      style={{
                        marginBottom: 16,
                        animation: "mwIn .25s ease",
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "78%",
                          padding: "10px 14px",
                          borderRadius: 4,
                          background: isUser ? C.ink : C.panel,
                          border: isUser ? "none" : "1px solid " + C.border,
                          color: isUser ? "#fff" : C.ink,
                          fontSize: 13.5,
                          lineHeight: 1.75,
                        }}
                      >
                        <MathText text={msg.content} />
                      </div>
                    </div>
                  );
                })}
                {showing && (
                  <div style={{ display: "flex", marginBottom: 16 }}>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 4,
                        background: C.panel,
                        border: "1px solid " + C.border,
                      }}
                    >
                      <Dots />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatEnd} />
          </div>

          {exercise && (
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid " + C.border,
                background: C.panel,
                display: "flex",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) handleUserMsg(input);
                  }
                }}
                placeholder="Escribe tu duda…"
                rows={1}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 4,
                  border: "1px solid " + C.border,
                  background: C.bg,
                  color: C.ink,
                  fontSize: 13,
                  resize: "none",
                  lineHeight: 1.5,
                }}
              />
              <button
                onClick={() => {
                  if (input.trim()) handleUserMsg(input);
                }}
                disabled={showing || !input.trim()}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border:
                    "1px solid " +
                    (showing || !input.trim() ? C.border : C.ink),
                  background: showing || !input.trim() ? C.bg : C.ink,
                  color: showing || !input.trim() ? C.muted : "#fff",
                  fontSize: 13,
                  cursor: showing || !input.trim() ? "not-allowed" : "pointer",
                }}
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// ROOT
// ════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        setRole(snap.exists() ? snap.data().role : null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F6F3",
          fontFamily: "'Georgia',serif",
          color: "#A8A59E",
          fontSize: 14,
        }}
      >
        Cargando…
      </div>
    );

  if (!user)
    return (
      <LoginScreen
        onLogin={(u, r) => {
          setUser(u);
          setRole(r);
        }}
      />
    );
  if (!role) return <RolePicker user={user} onRoleSaved={(r) => setRole(r)} />;
  if (role === "tutor") return <TutorDashboard user={user} />;
  return <StudentDashboard user={user} />;
}
