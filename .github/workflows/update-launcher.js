const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function main() {
  const owner = 'happydestiny79';
  const { data: repos } = await octokit.rest.repos.listForUser({
    username: owner,
    per_page: 100,
    sort: 'updated'
  });

  const existing = fs.readFileSync('index.html', 'utf8');
  let newCards = '';

  const keywords = ['game','spirit','messenger','runner','vinyl','dazed','unicorn','cold','fletch','ferris','wally','on-tour','vintage'];

  for (const repo of repos) {
    if (existing.includes(`games/${repo.name}/`)) continue;

    const isGame = keywords.some(k =>
      repo.name.toLowerCase().includes(k) ||
      (repo.description && repo.description.toLowerCase().includes(k))
    );
    if (!isGame) continue;

    const desc = repo.description || 'New project';
    const vis = repo.private ? 'Private • Auto-detected' : 'Public • Auto-detected';

    newCards += `
      <!-- ${repo.name} (auto) -->
      <div class="game-card bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
        <div class="flex-1">
          <h2 class="font-semibold text-lg mb-1">${repo.name}</h2>
          <p class="text-xs text-zinc-500 mb-3">${vis}</p>
          <p class="text-sm text-zinc-400">${desc}</p>
        </div>
        <div class="mt-6 pt-6 border-t border-zinc-800">
          <a href="games/${repo.name}/index.html" target="_blank"
             class="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-medium text-sm hover:bg-zinc-200 active:scale-[0.985] transition-all">
            Launch Game →
          </a>
          <p class="text-[10px] text-center text-zinc-500 mt-2">Copy your web build into games/${repo.name}/</p>
        </div>
      </div>`;
  }

  if (newCards) {
    fs.writeFileSync('new-cards.html', newCards.trim());
    console.log('New cards generated');
  } else {
    console.log('No new game repos detected');
  }
}

main().catch(console.error);