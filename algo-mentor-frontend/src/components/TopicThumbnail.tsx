import React from "react";

type TopicId =
  | "binary-search"
  | "linked-lists"
  | "trees"
  | "two-pointers"
  | "graphs"
  | "dynamic-programming";

interface TopicThumbnailProps {
  topicId: string;
  title: string;
  className?: string;
}

const THEMES: Record<
  TopicId,
  { from: string; to: string; glow: string; accent: string }
> = {
  "binary-search": {
    from: "#064e3b",
    to: "#0e7490",
    glow: "rgba(52, 211, 153, 0.35)",
    accent: "#34d399",
  },
  "linked-lists": {
    from: "#312e81",
    to: "#5b21b6",
    glow: "rgba(167, 139, 250, 0.35)",
    accent: "#a78bfa",
  },
  trees: {
    from: "#14532d",
    to: "#166534",
    glow: "rgba(74, 222, 128, 0.35)",
    accent: "#4ade80",
  },
  "two-pointers": {
    from: "#1e3a8a",
    to: "#0369a1",
    glow: "rgba(56, 189, 248, 0.35)",
    accent: "#38bdf8",
  },
  graphs: {
    from: "#4a044e",
    to: "#86198f",
    glow: "rgba(232, 121, 249, 0.35)",
    accent: "#e879f9",
  },
  "dynamic-programming": {
    from: "#7c2d12",
    to: "#b45309",
    glow: "rgba(251, 191, 36, 0.35)",
    accent: "#fbbf24",
  },
};

function BinarySearchArt({ accent }: { accent: string }) {
  return (
    <>
      {[12, 28, 44, 60, 76, 92].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={72 - (i % 2 === 0 ? 8 : 16)}
          width={10}
          height={i === 2 || i === 3 ? 28 : 20}
          rx={2}
          fill={i === 2 || i === 3 ? accent : "rgba(255,255,255,0.18)"}
        />
      ))}
      <path
        d="M56 38 L56 52 M48 38 L64 38"
        stroke={accent}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M20 96 L44 96 M76 96 L100 96"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <text x={28} y={100} fill="rgba(255,255,255,0.45)" fontSize={8} fontFamily="monospace">
        lo
      </text>
      <text x={82} y={100} fill="rgba(255,255,255,0.45)" fontSize={8} fontFamily="monospace">
        hi
      </text>
    </>
  );
}

function LinkedListArt({ accent }: { accent: string }) {
  const nodes = [
    { cx: 28, cy: 58 },
    { cx: 56, cy: 58 },
    { cx: 84, cy: 58 },
    { cx: 112, cy: 58 },
  ];
  return (
    <>
      {nodes.slice(0, -1).map((node, i) => (
        <line
          key={`line-${i}`}
          x1={node.cx + 10}
          y1={node.cy}
          x2={nodes[i + 1].cx - 10}
          y2={nodes[i + 1].cy}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={2}
        />
      ))}
      {nodes.map((node, i) => (
        <g key={`node-${i}`}>
          <circle cx={node.cx} cy={node.cy} r={12} fill="rgba(255,255,255,0.12)" stroke={accent} strokeWidth={2} />
          <text
            x={node.cx}
            y={node.cy + 3}
            textAnchor="middle"
            fill={accent}
            fontSize={9}
            fontFamily="monospace"
            fontWeight="600"
          >
            {i + 1}
          </text>
        </g>
      ))}
      <path
        d="M124 58 L134 58 L130 54 M134 58 L130 62"
        stroke={accent}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  );
}

function TreeArt({ accent }: { accent: string }) {
  const nodes = [
    { cx: 72, cy: 28, r: 10 },
    { cx: 48, cy: 58, r: 8 },
    { cx: 96, cy: 58, r: 8 },
    { cx: 32, cy: 88, r: 7 },
    { cx: 64, cy: 88, r: 7 },
    { cx: 88, cy: 88, r: 7 },
    { cx: 112, cy: 88, r: 7 },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ];
  return (
    <>
      {edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a].cx}
          y1={nodes[a].cy + nodes[a].r * 0.4}
          x2={nodes[b].cx}
          y2={nodes[b].cy - nodes[b].r * 0.4}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={2}
        />
      ))}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill={i === 0 ? accent : "rgba(255,255,255,0.14)"}
          stroke={i === 0 ? accent : "rgba(255,255,255,0.35)"}
          strokeWidth={1.5}
        />
      ))}
    </>
  );
}

function TwoPointersArt({ accent }: { accent: string }) {
  return (
    <>
      {[16, 34, 52, 70, 88, 106].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={68}
          width={14}
          height={24}
          rx={3}
          fill={i >= 1 && i <= 4 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)"}
        />
      ))}
      <path d="M23 52 L23 62" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      <path d="M15 52 L31 52" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      <text x={19} y={48} fill={accent} fontSize={9} fontFamily="monospace" fontWeight="600">
        L
      </text>
      <path d="M113 52 L113 62" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      <path d="M105 52 L121 52" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      <text x={109} y={48} fill={accent} fontSize={9} fontFamily="monospace" fontWeight="600">
        R
      </text>
      <rect x={34} y={68} width={70} height={24} rx={3} fill={accent} opacity={0.15} />
    </>
  );
}

function GraphArt({ accent }: { accent: string }) {
  const nodes = [
    { cx: 72, cy: 32 },
    { cx: 36, cy: 58 },
    { cx: 72, cy: 58 },
    { cx: 108, cy: 58 },
    { cx: 54, cy: 88 },
    { cx: 90, cy: 88 },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [2, 3],
    [1, 4],
    [2, 4],
    [2, 5],
    [3, 5],
    [4, 5],
  ];
  return (
    <>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={2}
        />
      ))}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={i === 0 || i === 2 ? 9 : 7}
          fill={i === 0 || i === 2 ? accent : "rgba(255,255,255,0.16)"}
          stroke={i === 0 || i === 2 ? accent : "rgba(255,255,255,0.4)"}
          strokeWidth={1.5}
        />
      ))}
    </>
  );
}

function DynamicProgrammingArt({ accent }: { accent: string }) {
  const filled = new Set(["0-0", "0-1", "1-0", "1-1", "2-2", "3-3"]);
  const cells: React.ReactNode[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const key = `${row}-${col}`;
      const x = 34 + col * 22;
      const y = 38 + row * 22;
      cells.push(
        <rect
          key={key}
          x={x}
          y={y}
          width={18}
          height={18}
          rx={3}
          fill={filled.has(key) ? accent : "rgba(255,255,255,0.1)"}
          opacity={filled.has(key) ? 0.85 : 1}
          stroke={filled.has(key) ? accent : "rgba(255,255,255,0.2)"}
          strokeWidth={1}
        />
      );
    }
  }
  return (
    <>
      {cells}
      <path
        d="M52 38 L52 30 L88 30 L88 38"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={1.5}
        fill="none"
      />
      <path
        d="M34 60 L26 60 L26 96 L34 96"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={1.5}
        fill="none"
      />
    </>
  );
}

const ART: Record<TopicId, React.FC<{ accent: string }>> = {
  "binary-search": BinarySearchArt,
  "linked-lists": LinkedListArt,
  trees: TreeArt,
  "two-pointers": TwoPointersArt,
  graphs: GraphArt,
  "dynamic-programming": DynamicProgrammingArt,
};

export const TopicThumbnail: React.FC<TopicThumbnailProps> = ({
  topicId,
  title,
  className = "",
}) => {
  const theme = THEMES[topicId as TopicId] ?? THEMES["binary-search"];
  const Art = ART[topicId as TopicId] ?? BinarySearchArt;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      aria-hidden
      style={{
        background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
      }}
    >
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl"
        style={{ background: theme.glow }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full blur-xl opacity-60"
        style={{ background: theme.glow }}
      />

      <svg
        viewBox="0 0 144 112"
        className="absolute inset-0 w-full h-full p-4"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${title} illustration`}
      >
        <Art accent={theme.accent} />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
    </div>
  );
};
