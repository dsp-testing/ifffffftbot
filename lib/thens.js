module.exports = {
  async addLabel({octokit, octokitParams, iffft}) {
    try {
      await octokit.issues.addLabels(Object.assign({labels: [iffft.With]}, octokitParams))
      octokit.issues.createComment(Object.assign({
        body: `Hey @${iffft.user}, Iffftbot added the ${iffft.With} label to this issue because If ${iffft.If} Where ${iffft.Where} happened.`
      }, octokitParams))
    } catch (e) {
      console.log('catching failed Then addLabel', e)
    }
  },
  async assign({octokit, octokitParams, iffft}) {
    try {
      await octokit.issues.addAssignees(Object.assign({assignees: [iffft.With]}, octokitParams))
      octokit.issues.createComment(Object.assign({
        body: `Hey @${iffft.With}, Iffftbot assigned you this issue because If ${iffft.If} Where ${iffft.Where} happened.`
      }, octokitParams))
    } catch (e) {
      console.log('catching failed Then assign', e)
    }
  },
  async close({octokit, octokitParams, iffft}) {
    try {
      await octokit.issues.update(Object.assign({state: 'closed'}, octokitParams))
      octokit.issues.createComment(Object.assign({
        body: `Hey @${iffft.user}, Iffftbot closed this issue because If ${iffft.If} Where ${iffft.Where} happened.`
      }, octokitParams))
    } catch (e) {
      console.log('catching failed Then close', e)
    }
  }
}
