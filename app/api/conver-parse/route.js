import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json'; // 1. Import the alternative

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text locally using pdf2json wrapped in a Promise
    const text = await new Promise((resolve, reject) => {
      // The '1' parameter tells pdf2json to only parse raw text (improves speed)
      const pdfParser = new PDFParser(this, 1); 

      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(errData.parserError);
      });

      pdfParser.on("pdfParser_dataReady", () => {
        // pdf2json returns text with a lot of URL-encoded characters (like %20 for spaces), 
        // so we decode it here to get clean text.
        const rawText = pdfParser.getRawTextContent();
        resolve(decodeURIComponent(rawText));
      });

      pdfParser.parseBuffer(buffer);
    });

    // --- YOUR EXISTING LLM LOGIC STARTS HERE ---
    
    let geminiParsed = null;

    try {
      const prompt = `
Extract resume into STRICT JSON ONLY.

Rules:
- return valid JSON only
- no explanation

Keys:
firstName, lastName, email, phone, program, degree,
dateOfBirth, address, bio, skills, experiences, languages

Important:
- Bio is very Important
- program = field of study
- degree = highest qualification
- first Name and Last Name
- if missing use ""

Resume:
${text}
`;

      const deepseekRes = await fetch(process.env.DEEPSEEK_ENDPOINT || 'https://api.deepseek.com/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL || process.env.GEMINI_MODEL || 'gpt-4o-mini',
          prompt: prompt,
          max_tokens: 1500
        })
      });

      if (!deepseekRes.ok) {
        const txt = await deepseekRes.text();
        throw new Error(`Deepseek error: ${txt}`);
      }

      const deepJson = await deepseekRes.json();
      const genText =
        deepJson.output?.[0]?.content ||
        deepJson.data?.[0]?.text ||
        deepJson.text ||
        (typeof deepJson === 'string' ? deepJson : '');

      const match = (genText || '').match(/\{[\s\S]*\}/);

      if (match) {
        geminiParsed = JSON.parse(match[0]);
      }

    } catch (e) {
      console.error("Deepseek error:", e);
    }

    // --- YOUR EXISTING REGEX FALLBACK LOGIC ---
    
    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = text.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/);

    let firstName = '';
    let lastName = '';
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length) {
      const parts = lines[0].split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    const programMatch = text.match(/(computer science|software engineering|information technology|data science|business administration)/i);
    const degreeMatch = text.match(/\b(BSc|BS|MSc|MS|PhD|Bachelor|Master|Associate)\b/i);

    const skillsList = [
      'React','Node','JavaScript','TypeScript','Python','Java',
      'C++','SQL','Git','Docker','Kubernetes','TensorFlow',
      'AWS','Azure','HTML','CSS','Swift','Go','PHP','Rust'
    ];
    const skills = [...new Set(skillsList.filter(s => new RegExp('\\b' + escapeRegex(s) + '\\b', 'i').test(text)))];

    const langList = ['English','French','Spanish','German','Arabic','Hindi','Urdu','Chinese','Japanese','Portuguese','Russian'];
    const languages = [...new Set(langList.filter(l => new RegExp('\\b' + l + '\\b','i').test(text)))];

    const expMatches = (text.match(/([A-Z][^.\n]{10,200}(?:\d{4}|\b\d{2}\b))/g) || []).slice(0, 6).map(s => s.trim());

    const heuristicParsed = {
      firstName, lastName,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      program: programMatch ? programMatch[0] : '',
      programCustom: '',
      degree: degreeMatch ? degreeMatch[0] : '',
      dateOfBirth: '', address: '', bio: '', skills,
      experiences: expMatches, languages
    };

    const finalParsed = {
      ...heuristicParsed,
      ...(geminiParsed || {})
    };

    return NextResponse.json({
      text, // (Optional) Keeping this so you can debug the extracted string
      parsed: finalParsed
    });

  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}