// Baixa o APK e o IPA da Release mais recente do GitHub para a raiz do projeto.
// Uso: npm run baixar            (última build)
//      npm run baixar -- build-5 (uma build específica)
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

const REPO = 'MarcelPintoLisboa/controles-gastos-ml';
const DESTINO = path.resolve(__dirname, '..');
const tag = process.argv[2];

async function main() {
  const url = tag
    ? `https://api.github.com/repos/${REPO}/releases/tags/${tag}`
    : `https://api.github.com/repos/${REPO}/releases?per_page=1`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'baixar-instaladores' } });
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status} ao buscar a Release.`);
  const json = await res.json();
  const release = Array.isArray(json) ? json[0] : json;
  if (!release) throw new Error('Nenhuma Release encontrada. O workflow já terminou?');

  const assets = release.assets.filter((a) => /\.(apk|ipa)$/i.test(a.name));
  if (!assets.length) throw new Error(`A Release ${release.tag_name} não tem .apk nem .ipa.`);

  console.log(`Release: ${release.name} (${release.tag_name})`);
  for (const a of assets) {
    const arquivo = path.join(DESTINO, a.name);
    process.stdout.write(`Baixando ${a.name} (${(a.size / 1048576).toFixed(1)} MB)... `);
    const r = await fetch(a.browser_download_url, { headers: { 'User-Agent': 'baixar-instaladores' } });
    if (!r.ok) throw new Error(`falhou (${r.status})`);
    const tmp = `${arquivo}.part`;
    await pipeline(Readable.fromWeb(r.body), fs.createWriteStream(tmp));
    if (fs.statSync(tmp).size !== a.size) throw new Error('tamanho diferente do esperado, tente de novo');
    fs.renameSync(tmp, arquivo);
    console.log('ok');
  }
  console.log(`\nArquivos salvos em: ${DESTINO}`);
}

main().catch((e) => {
  console.error(`\nErro: ${e.message}`);
  process.exit(1);
});
