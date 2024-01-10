const { Octokit } = require("@octokit/action");
// const core = require('@actions/core');

const octokit = new Octokit();

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
    console.log("成功获得issue信息",issue);
    const assignees = issue.data.assignees;
    console.log("成功获得assignee信息",assignees);
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
      for(const assignee of assignees){
        if(team_member.find((m) => m.login === assignee.login)){
          if(projectMapping[team_data.slug]){
            projectsToAssociate.push(projectMapping[team.slug]);
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
    for (const projectId of result) {
      // 将 issue 添加到项目
      console.log("开始将issue关联到项目");
      await octokit.rest.projects.createCard({
        column_id: projectId, // 你的项目中的列的 ID
        content_id: issueNumber,
        content_type: "Issue",
      });
        
      console.log("Issue ${issueNumber} 关联到项目 ${projectId}");
    }
  } catch (error) {
    // core.setFailed(error.message);
    console.log(error.message)
  }
}

run();

