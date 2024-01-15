const { Octokit } = require("@octokit/action");
const fetch = require("node-fetch");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubApiEndpoint = "https://api.github.com/graphql";
const organizationLogin = "lcxznpy-test";
const token = process.env.GITHUB_TOKEN;
const art = "Bearer "+token;
async function run() {
  try {
    const issueNumber = process.env.Issue_ID;

    const issue = await octokit.rest.issues.get({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: "asdf",
      issue_number: issueNumber,
    });
    const assignees = issue.data.assignees;
    const issue_node_id = issue.data.node_id;
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
      // console.log("team_member",team_member);
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
    const headers = {
        'Authorization': art,
        'Content-Type': 'application/json',
      };
    for (const projectId of result) {
    var query = `
        query {
          organization(login: "${organizationLogin}") {
            projectV2(number: ${projectId}) {
              id
            }
          }
        }
      `;
      var options = {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ query }),
        };
      let pid;
      const resp = await fetch(githubApiEndpoint, options);
      const resp_json = await resp.json();
      pid = resp_json.data.organization.projectV2.id;
      console.log('Project ID:', pid);
      var query=`
          mutation{
            addProjectV2ItemById(input:{projectId: \"${pid}\" contentId: \"${issue_node_id}\" }){
                item  {
                   id   
                  }
                }
          }
        `;
      var options = {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ query }),
        };
      const resp_add = await fetch(githubApiEndpoint, options);
        const resp_add_json = await resp_add.json();
        let add_ans = resp_add_json.data.addProjectV2ItemById.item.id;
        console.log(add_ans);

    }
  } catch (error) {
    // core.setFailed(error.message);
    console.log(error.message)
  }
}

run();

