const { Octokit } = require("@octokit/action");
// const core = require('@actions/core');

// const octokit = new Octokit();
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
async function run() {
  try {
    console.log("开始啦");
    const issueNumber = process.env.Issue_ID;

    // 获取 issue 的信息
    console.log("尝试获取issue的详细信息");
    console.log(process.env.GITHUB_REPOSITORY_OWNER);
    console.log(process.env.GITHUB_REPOSITORY);
    console.log(issueNumber);
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
        org: "lcxznpy-test",  // 替换为你的组织名
      });
    for(const team_data of teams.data){
      const team_member = await octokit.rest.teams.listMembersInOrg({
            org: "lcxznpy-test",
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
    // for (const assignee of assignees) {
    //   const teams = await octokit.rest.teams.list({
    //     org: "lcxznpy-test",  // 替换为你的组织名
    //   });
    //   console.log("成功获得team信息",teams);
    //   const team = teams.data.find((t) => t.members.some((m) => m.login === assignee.login));
      
    //   if (team && projectMapping[team.slug]) {
        // projectsToAssociate.push(projectMapping[team.slug]);
        // console.log("成功push一个信息");
    //   }
    // }

    if (projectsToAssociate.length === 0) {
      console.log("没有组织，使用默认组织");
      projectsToAssociate.push(3); // 默认 project ID
    }
    const result = Array.from(new Set(projectsToAssociate))
    console.log(result)

    // const listorg = await octokit.rest.projects.listForOrg({
    //         org: "lcxznpy-test",
    //       });
    // console.log(listorg)
    for (const projectId of result) {
    const qaq = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: '{"query":"query{organization(login: \\"lcxznpy-test\\") {projectV2(number: projectId ){id}}}"}'
      });
      console.log(qaq)
      console.log(qaq.data.organization.projectV2.id)
      console.log("Issue ${issueNumber} 关联到项目 ${projectId}");
    }
  } catch (error) {
    // core.setFailed(error.message);
    console.log(error.message)
  }
}

run();

