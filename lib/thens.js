module.exports = {
  async addLabel({octokit, octokitParams, metadata}) {
    await octokit.issues.addLabels(Object.assign({labels: [metadata.With]}, octokitParams))
    octokit.issues.createComment(Object.assign({
      body: `Hey @${metadata.user}, Iffftbot added the ${metadata.With} label to this issue because If ${metadata.If} Where ${metadata.Where} happened.`
    }, octokitParams))
  },
  async assign({octokit, octokitParams, metadata}) {
    await octokit.issues.addAssignees(Object.assign({assignees: [metadata.With]}, octokitParams))
    octokit.issues.createComment(Object.assign({
      body: `Hey @${metadata.With}, Iffftbot assigned you this issue because If ${metadata.If} Where ${metadata.Where} happened.`
    }, octokitParams))
  },
  async close({octokit, octokitParams, metadata}) {
    await octokit.issues.update(Object.assign({state: 'closed'}, octokitParams))
    octokit.issues.createComment(Object.assign({
      body: `Hey @${metadata.user}, Iffftbot closed this issue because If ${metadata.If} Where ${metadata.Where} happened.`
    }, octokitParams))
  }
}
