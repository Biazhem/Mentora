import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req) {
  try {
    const { transcript, meetingId } = await req.json();

    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const formattedTranscript = transcript
      .map((entry) => `${entry.name}: ${entry.say}`)
      .join("\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: `You are a meeting assistant. Generate a clear, concise summary of the meeting transcript provided.
Rules:
- Include key discussion points, decisions made, and action items
- Mention participants and their contributions
- Keep it structured with bullet points
- Be concise but comprehensive`,
          },
          {
            role: "user",
            content: `Generate a summary for this meeting transcript:\n\n${formattedTranscript}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq error: ${errText}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content || "";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Summary generation error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
