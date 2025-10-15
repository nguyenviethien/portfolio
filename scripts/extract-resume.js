/*
  Extract text from src/document/이력서_20251014.pdf and write
  public/assets/resume.json with a best-effort structured representation.
*/
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function normalizeLines(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function parseSections(lines) {
  const joined = lines.join('\n');
  // Basic contact extraction
  const email = (joined.match(/([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/) || [])[1] || '';
  const phone = (joined.match(/(\+?\d[\d\s\-()]{7,}\d)/) || [])[1] || '';
  const linkedIn = (joined.match(/(https?:\/\/www\.linkedin\.com\/[\w\-\/.]+)/i) || [])[1] || '';
  const portfolio = (joined.match(/(https?:\/\/[^\s]+\b)/i) || [])[1] || '';

  // Guess name as the first non-empty line that contains spaces and letters
  const name = (lines.find((l) => /[A-Za-zÀ-ỹ가-힣\s]{3,}/.test(l) && l.split(' ').length >= 2) || '').replace(/[^\p{L}\s.-]/gu, '').trim();

  // Split by common headers (EN/VN)
  const headerRegex = /^(Experience|Work Experience|Kinh nghiệm|Projects|Dự án|Skills|Kỹ năng|Education|Học vấn|Certificates|Chứng chỉ)\b/i;
  const sections = [];
  let current = { title: 'Summary', items: [] };
  for (const l of lines) {
    if (headerRegex.test(l)) {
      if (current.items.length) sections.push(current);
      current = { title: l.trim(), items: [] };
    } else {
      current.items.push(l);
    }
  }
  if (current.items.length) sections.push(current);

  function extractList(titleMatch) {
    const sec = sections.find((s) => titleMatch.test(s.title));
    if (!sec) return [];
    // simple bulletization: split by sentences/lines
    return sec.items
      .join('\n')
      .split(/\n|\u2022|\-|\•/) // line or bullets
      .map((x) => x.trim())
      .filter(Boolean);
  }

  const summary = extractList(/^Summary|^Tóm tắt/i).slice(0, 6);
  const skills = extractList(/^Skills|^Kỹ năng/i).slice(0, 30);
  const education = extractList(/^Education|^Học vấn/i);
  const certificates = extractList(/^Certificates|^Chứng chỉ/i);

  // Experience: try to group by blank lines
  const expSec = sections.find((s) => /Experience|Kinh nghiệm/i.test(s.title));
  const experiences = [];
  if (expSec) {
    const blocks = expSec.items.join('\n').split(/\n{2,}/);
    for (const b of blocks) {
      const lines = normalizeLines(b);
      if (!lines.length) continue;
      const header = lines[0];
      const period = (b.match(/(\d{4}\s?[–-]\s?(Present|\d{4}))/i) || [])[1] || '';
      experiences.push({
        period,
        title: header,
        company: lines[1] || '',
        highlights: lines.slice(2).slice(0, 8),
      });
    }
  }

  return {
    contact: { email, phone, linkedin: linkedIn, portfolio },
    name,
    summary,
    skills,
    education,
    certificates,
    experiences,
  };
}

async function main() {
  const root = process.cwd();
  const pdfPath = path.join(root, 'src', 'document', '이력서_20251014.pdf');
  const outDir = path.join(root, 'public', 'assets');
  ensureDir(outDir);

  if (!fs.existsSync(pdfPath)) {
    console.error('Resume PDF not found:', pdfPath);
    process.exit(1);
  }

  let PDFParse;
  try {
    ({ PDFParse } = require('pdf-parse'));
  } catch (e) {
    console.error('pdf-parse not installed');
    process.exit(1);
  }

  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  const lines = normalizeLines(result.text || '');
  const structured = parseSections(lines);

  const outPath = path.join(outDir, 'resume.json');
  fs.writeFileSync(outPath, JSON.stringify(structured, null, 2), 'utf8');
  console.log('Wrote resume JSON to', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
