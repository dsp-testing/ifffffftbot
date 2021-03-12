module.exports = {
  async addLabel({octokit, octokitParams, iffft}) {
    try {
      await octokit.issues.addLabels(Object.assign({labels: [iffft.With]}, octokitParams))
      octokit.issues.createComment(Object.assign({
        body: `Hey @${iffft.user}, Iffftbot added the ${iffft.With} label to this issue because If ${iffft.If} Where ${iffft.Where} happened.`
      }, octokitParams))
    } catch (e) {
      console.log('catching failed Then addLabel', e)
      octokit.issues.createComment(Object.assign({
        body: `Hey @${iffft.user}, Iffftbot couldn't add the ${iffft.With} label to this issue even though If ${iffft.If} Where ${iffft.Where} happened. Does this need your attention?`
      }, octokitParams))
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
      octokit.issues.createComment(Object.assign({
        body: `Hey @${iffft.user}, Iffftbot couldn't assign @${iffft.With} to this issue even though If ${iffft.If} Where ${iffft.Where} happened. Does this need your attention?`
      }, octokitParams))
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
      octokit.issues.createComment(Object.assign({
        body: `Hey @${iffft.user}, Iffftbot couldn't close this issue even though If ${iffft.If} Where ${iffft.Where} happened. Does this need your attention?`
      }, octokitParams))
    }
  },
  async removeLabel({octokit, octokitParams, iffft}) {
    try {
      await octokit.issues.removeLabel(Object.assign({name: iffft.With}, octokitParams))
      octokit.issues.createComment(Object.assign({
        body: `Hey @${iffft.user}, Iffftbot removed the ${iffft.With} label from this issue because If ${iffft.If} Where ${iffft.Where} happened.`
      }, octokitParams))
    } catch (e) {
      console.log('catching failed Then removeLabel', e)
      octokit.issues.createComment(Object.assign({
        body: `Hey @${iffft.user}, Iffftbot couldn't remove the ${iffft.With} label from this issue even though If ${iffft.If} Where ${iffft.Where} happened. Does this need your attention?`
      }, octokitParams))
    }
  }
}
