const { Octokit } = require("@octokit/action");
// import Octokit from "@octokit/action";
const fetch = require("node-fetch");
// import fetch from "node-fetch";
// const core = require('@actions/core');

// const octokit = new Octokit();
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
const githubApiEndpoint = "https://api.github.com/graphql";
const organizationLogin = "lcxznpy-test";
const token = process.env.GITHUB_TOKEN;
async function run() {
  try {
    console.log("开始啦");
    const issueNumber = process.env.Issue_ID;

    // // 获取 issue 的信息
    // console.log("尝试获取issue的详细信息");
    // console.log(process.env.GITHUB_REPOSITORY_OWNER);
    // console.log(process.env.GITHUB_REPOSITORY);
    // console.log(issueNumber);
    const issue = await octokit.rest.issues.get({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: "asdf",
      issue_number: issueNumber,
    });
    // console.log("成功获得issue信息",issue);
    const assignees = issue.data.assignees;
    // console.log("成功获得assignee信息",assignees);
    if (assignees.length === 0) {
      console.log("Issue 没有 assignee，不进行项目关联");
      return;
    }

    const projectMapping = {
      'c1': 1,
      'c2': 2,
    };

    const projectsToAssociate = [];

    const teams = await octokit.rest.teams.list({
        org: organizationLogin,  // 替换为你的组织名
      });
    for(const team_data of teams.data){
      const team_member = await octokit.rest.teams.listMembersInOrg({
            org: organizationLogin,
            team_slug: team_data.slug,
          });
      console.log("team_member",team_member);
      for(const assignee of assignees){
        if(team_member.data.find((m) => m.login === assignee.login)){
          if(projectMapping[team_data.slug]){
            projectsToAssociate.push(projectMapping[team_data.slug]);
            console.log("成功push一个信息");
          }
        }
      }
    }

    if (projectsToAssociate.length === 0) {
      console.log("没有组织，使用默认组织");
      projectsToAssociate.push(3); // 默认 project ID
    }
    const result = Array.from(new Set(projectsToAssociate))
    console.log(result)

    // const listorg = await octokit.rest.projects.listForOrg({
    //         org: organizationLogin,
    //       });
    // console.log(listorg)
    for (const projectId of result) {
    const query = `
        query {
          organization(login: "${organizationLogin}") {
            projectV2(number: ${projectId}) {
              id
            }
          }
        }
      `;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const options = {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ query }),
        };
      let pid;
      const resp = await fetch(githubApiEndpoint, options);
      const resp_json = resp.json();
      pid = resp_json.data.organization.projectV2.id;
      console.log('Project ID:', pid);
                // .then(resp => resp.json())
                // .then(pid = resp.data.organization.projectV2.id)
                // .then(console.log('Project ID:', pid))
        
    }
  } catch (error) {
    // core.setFailed(error.message);
    console.log(error.message)
  }
}

run();

