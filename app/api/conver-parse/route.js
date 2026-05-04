import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert API
    const convForm = new FormData();
    convForm.append('File', file, file.name || 'resume.pdf');
    convForm.append('StoreFile', 'true');

    const convertRes = await fetch('https://v2.convertapi.com/convert/pdf/to/txt', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CONVERTAPI_KEY || ''}`
      },
      body: convForm
    });

    if (!convertRes.ok) {
      const txt = await convertRes.text();
      throw new Error(`ConvertAPI error: ${txt}`);
    }

    const convJson = await convertRes.json();
    const txtUrl = convJson?.Files?.[0]?.Url;

    if (!txtUrl) throw new Error('No text file URL returned');

    const txtRes = await fetch(txtUrl);
    const text = await txtRes.text();

    // Gemini
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
      // Try a few possible response shapes
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

    // Helpers
    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Email / phone
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = text.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/);

    // Name fallback
    let firstName = '';
    let lastName = '';

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length) {
      const parts = lines[0].split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    // Program + Degree fallback
    const programMatch = text.match(/(computer science|software engineering|information technology|data science|business administration)/i);
    const degreeMatch = text.match(/\b(BSc|BS|MSc|MS|PhD|Bachelor|Master|Associate)\b/i);

    // Skills
    const skillsList = [
      'React','Node','JavaScript','TypeScript','Python','Java',
      'C++','SQL','Git','Docker','Kubernetes','TensorFlow',
      'AWS','Azure','HTML','CSS','Swift','Go','PHP','Rust'
    ];

    const skills = [...new Set(
      skillsList.filter(s =>
        new RegExp('\\b' + escapeRegex(s) + '\\b', 'i').test(text)
      )
    )];

    // Languages
    const langList = ['English','French','Spanish','German','Arabic','Hindi','Urdu','Chinese','Japanese','Portuguese','Russian'];
    const languages = [...new Set(
      langList.filter(l => new RegExp('\\b' + l + '\\b','i').test(text))
    )];

    // Experience (simple fallback)
    const expMatches = (text.match(/([A-Z][^.\n]{10,200}(?:\d{4}|\b\d{2}\b))/g) || [])
      .slice(0, 6)
      .map(s => s.trim());

    // Fallback object
    const heuristicParsed = {
      firstName,
      lastName,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      program: programMatch ? programMatch[0] : '',
      programCustom: '',
      degree: degreeMatch ? degreeMatch[0] : '',
      dateOfBirth: '',
      address: '',
      bio: '',
      skills,
      experiences: expMatches,
      languages
    };

    // Final merge (AI overrides fallback)
    const finalParsed = {
      ...heuristicParsed,
      ...(geminiParsed || {})
    };

    return NextResponse.json({
      text,
      parsed: finalParsed
    });

  } catch (err) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}