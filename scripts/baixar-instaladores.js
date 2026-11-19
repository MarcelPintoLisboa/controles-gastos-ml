// Baixa o APK mais recente e o IPA mais recente das Releases do GitHub para a raiz do projeto.
// (O Android publica Releases "android-N" e o iOS "ios-N", cada um no seu workflow.)
// Uso: npm run baixar              (último APK e último IPA)
//      npm run baixar -- android-5 (uma Release específica)
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
    : `https://api.github.com/repos/${REPO}/releases?per_page=50`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'baixar-instaladores' } });
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status} ao buscar as Releases.`);
  const json = await res.json();
  const releases = (Array.isArray(json) ? json : [json]).sort(
    (a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
  );
  if (!releases.length) throw new Error('Nenhuma Release encontrada. O workflow já terminou?');

  // para cada tipo (.apk / .ipa), pega o arquivo da Release mais recente que o tiver
  const assets = [];
  for (const ext of ['apk', 'ipa']) {
    for (const r of releases) {
      const a = r.assets.find((x) => x.name.toLowerCase().endsWith(`.${ext}`));
      if (a) { assets.push({ ...a, release: r }); break; }
    }
  }
  if (!assets.length) throw new Error('Nenhuma Release com .apk ou .ipa encontrada.');

  for (const a of assets) {
    console.log(`${a.name} -> Release ${a.release.name} (${a.release.tag_name}), ${new Date(a.release.published_at).toLocaleString('pt-BR')}`);
  }
  console.log('');
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
