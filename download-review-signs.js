const fs = require('fs');
const path = require('path');

const outDir = '/Users/nikitasokovyh/Desktop/pddtest/signs_review';

const files = [
  ['2.1.svg', 'RU road sign 2.1.svg'],
  ['2.4.svg', 'RU road sign 2.4.svg'],
  ['3.1.svg', 'RU road sign 3.1.svg'],
  ['3.3.svg', 'RU road sign 3.3.svg'],
  ['3.4.svg', 'RU road sign 3.4.svg'],
  ['3.5.svg', 'RU road sign 3.5.svg'],
  ['3.6.svg', 'RU road sign 3.6.svg'],
  ['3.7.svg', 'RU road sign 3.7.svg'],
  ['3.9.svg', 'RU road sign 3.9.svg'],
  ['3.10.svg', 'RU road sign 3.10.svg'],
  ['3.11.svg', 'RU road sign 3.11.svg'],
  ['3.12.svg', 'RU road sign 3.12.svg'],
  ['3.13.svg', 'RU road sign 3.13.svg'],
  ['3.20.svg', 'RU road sign 3.20.svg'],
  ['3.24.svg', 'RU road sign 3.24.svg'],
];

async function download(name, title) {
  const outPath = path.join(outDir, name);
  if (fs.existsSync(outPath)) {
    console.log(`skip ${name}`);
    return;
  }
  const url = `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(title)}`;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 Codex desktop' },
    });
    const type = res.headers.get('content-type') || '';
    if (res.ok && type.includes('image/svg+xml')) {
      const text = await res.text();
      if (!text.includes('<svg')) throw new Error(`${name}: invalid svg`);
      fs.writeFileSync(outPath, text, 'utf8');
      console.log(`downloaded ${name}`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return;
    }
    if (res.status === 429 && attempt < 5) {
      console.log(`rate-limited ${name}, retry ${attempt}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 15000));
      continue;
    }
    throw new Error(`${name}: ${res.status} ${type}`);
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, title] of files) {
    await download(name, title);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
