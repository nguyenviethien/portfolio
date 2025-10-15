/*
  Extract images embedded in the DOCX at
  src/document/certificate/NguyenVietHien_Portfolio.docx
  and write them to public/assets/portfolio plus a manifest.json.
*/
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const projectRoot = process.cwd();
  const docxPath = path.join(projectRoot, 'src', 'document', 'certificate', 'NguyenVietHien_Portfolio.docx');
  const outDir = path.join(projectRoot, 'public', 'assets', 'portfolio');
  ensureDir(outDir);

  if (!fs.existsSync(docxPath)) {
    console.error('DOCX not found:', docxPath);
    process.exit(0);
  }

  // Lazy require to keep runtime light
  let AdmZip;
  try {
    AdmZip = require('adm-zip');
  } catch (e) {
    console.error('adm-zip not installed. Run: npm i -D adm-zip');
    process.exit(1);
  }

  const zip = new AdmZip(docxPath);
  const entries = zip.getEntries();
  const media = entries.filter((e) => /^(word\/media\/).+\.(png|jpg|jpeg|gif)$/i.test(e.entryName));
  if (!media.length) {
    console.log('No embedded images found in DOCX.');
  }
  const written = [];
  media.forEach((e, idx) => {
    const ext = path.extname(e.entryName).toLowerCase();
    const name = `portfolio_${String(idx + 1).padStart(2, '0')}${ext}`;
    const outPath = path.join(outDir, name);
    fs.writeFileSync(outPath, e.getData());
    written.push(`/assets/portfolio/${name}`);
  });

  const manifestPath = path.join(outDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(written, null, 2));
  console.log(`Wrote ${written.length} image(s) and manifest to`, outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

