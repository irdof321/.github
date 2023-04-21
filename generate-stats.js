const fs = require("fs");
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function fetchRepoCommits(repo) {
  let commits = 0;
  let page = 1;
  let results;

  do {
    results = await octokit.repos.listCommits({
      owner: repo.owner.login,
      repo: repo.name,
      per_page: 100,
      page,
    });

    commits += results.data.length;
    page++;
  } while (results.data.length > 0);

  return commits;
}

async function fetchAllRepos(username, org) {
  const personalRepos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    type: "all",
    per_page: 100,
  });

  const orgRepos = await octokit.paginate(octokit.repos.listForOrg, {
    org,
    type: "all",
    per_page: 100,
  });

  return personalRepos.concat(orgRepos);
}

(async () => {
  const username = "irdof321";
  const organization = "syrto-AG";
  const allRepos = await fetchAllRepos(username, organization);

  let totalCommits = 0;

  for (const repo of allRepos) {
    const commits = await fetchRepoCommits(repo);
    totalCommits += commits;
  }

  const outputFile = "README.md";
  const content = fs.readFileSync(outputFile, "utf-8");
  const updatedContent = content.replace(
    /Total Commits: \*\*(\d+)\*\*/,
    `Total Commits: **${totalCommits}**`
  );

  fs.writeFileSync(outputFile, updatedContent);
})();
