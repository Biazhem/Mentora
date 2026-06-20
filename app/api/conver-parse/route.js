import { NextResponse } from "next/server";
import PDFParser from "pdf2json";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(this, 1);

      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(errData.parserError);
      });

      pdfParser.on("pdfParser_dataReady", () => {
        const rawText = pdfParser.getRawTextContent();
        resolve(decodeURIComponent(rawText));
      });

      pdfParser.parseBuffer(buffer);
    });

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
            content: `Extract resume information from the text. 
Rules:
- bio = a short 1-2 sentence professional summary about the person (max 50 words). Keep it concise if not listed then generate from watching status and level.
- university = the university or institute name from education section.
- status = current status: "student" if currently enrolled, "graduate" if completed degree, "working" if employed.
- Return empty string for missing strings and empty array for missing arrays.`,
          },
          {
            role: "user",
            content: `Extract the following resume text into the JSON schema.\n\nResume Text:\n${text}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "resume_data",
            strict: true,
            schema: {
              type: "object",
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                program: { type: "string" },
                degree: { type: "string" },
                university: { type: "string" },
                status: { type: "string" },
                dateOfBirth: { type: "string" },
                address: { type: "string" },
                bio: { type: "string" },
                skills: { type: "array", items: { type: "string" } },
                experiences: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      company: { type: "string" },
                      duration: { type: "string" },
                    },
                    required: ["title", "company", "duration"],
                    additionalProperties: false,
                  },
                },
                languages: { type: "array", items: { type: "string" } },
              },
              required: [
                "firstName", "lastName", "email", "phone",
                "program", "degree", "university", "status",
                "dateOfBirth", "address", "bio",
                "skills", "experiences", "languages",
              ],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq error: ${errText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content || "{}");

    return NextResponse.json({ parsed });
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
