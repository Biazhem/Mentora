"use client";

export default function SummaryMDX({ source }) {
  if (!source) return null;

  const lines = source.split("\n");

  return (
    <div className="text-sm space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // Headers
        if (trimmed.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-4">{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-5 mb-1">{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-6 mb-1">{trimmed.slice(2)}</h1>;

        // Bullet points
        if (trimmed.startsWith("- ")) {
          const content = trimmed.slice(2);
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-muted mt-0.5">•</span>
              <span>{renderInline(content)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-muted font-medium">{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph
        return <p key={i} className="text-sm">{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, italicMatch.index)}</span>);
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts;
}
