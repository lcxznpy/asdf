const { Octokit } = require("@octokit/action");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function getIssueStats() {
  try{
    const { data: issues } = await octokit.issues.listForRepo({
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: "asdf",
  });
  console.log(issue);
  // // Add your logic to calculate issue stats based on time period and tags
  // const addedIssues = issues.filter(issue => /* your condition for added issues */);
  // const closedIssues = issues.filter(issue => /* your condition for closed issues */);

  // console.log(`Number of issues added: ${addedIssues.length}`);
  // console.log(`Number of issues closed: ${closedIssues.length}`);
  } catch(error){
    console.log(error.message);
  }
}

getIssueStats();
