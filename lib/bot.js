const { Octokit } = require('@octokit/action')

const Ifs = require('./ifs')
const Thens = require('./thens')
const Metadata = require('./metadata')

const LABEL = 'iffftbot'

module.exports = {
  async on_slash_dispatch({payload}) {
    const octokit = new Octokit()
    const issueQuery = `query MyQuery($issueId: ID!) {
        node(id: $issueId) {
          id
          ... on Issue {
            id
            number
            body
            repository {
              name
              owner {
                id
                login
              }
            }
          }
        }
      }`
    let resp = await octokit.graphql(issueQuery, { issueId: payload.command.resource.id })
    const octokitParams = {
      owner: resp.node.repository.owner.login,
      repo: resp.node.repository.name,
      issue_number: resp.node.number
    }

    console.log('slash dispatch for issue', octokitParams)

    await Metadata.set({
      octokit, 
      octokitParams,
      issueBody: resp.node.body,
      iffft: Object.assign({user: payload.command.user.login}, payload.data),
      label: LABEL
    })
  },

  async on_other_event_dispatch({name, payload}) {
    const octokit = new Octokit({ auth: process.env.IFFFFFTBOT_PAT })
    const event = payload.action ? `${name}.${payload.action}` : name
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
    const resp = await octokit.search.issuesAndPullRequests({ q: `label:"${LABEL}" org:${owner}` })
    console.log(`Found ${resp.data.items.length} relevant issues on ${event} event dispatched`)

    for (const issue of resp.data.items) {
      console.log('Looking for metadata in issue', issue)
      const issueRepoParts = issue.repository_url.split('/')
      const octokitParams = {
        owner: issueRepoParts[issueRepoParts.length - 2],
        repo: issueRepoParts[issueRepoParts.length - 1],
        issue_number: issue.number
      }
      
      const metadata = Metadata.get({issueBody: issue.body})
      if (!metadata) {
        console.log('Issue had label but no metadata', issue)
        octokit.issues.removeLabel(Object.assign({ name: LABEL }, octokitParams))
        break
      }
      console.log(`Found issue ${octokitParams.owner}/${octokitParams.repo}#${issue.number} with metadata`, metadata)

      const iffftsMet = Object.values(metadata).filter(iffft => {
        if (event === iffft.If) {
          console.log(`Found issue ${octokitParams.owner}/${octokitParams.repo}#${issue.number} with metadata waiting on a ${event} event`, iffft)

          switch (event) {
            case 'issues.closed':
              return Ifs.issueClosed({iffft, issue: payload.issue, repo: payload.repository})
            case 'milestone.closed':
              return Ifs.milestoneClosed({iffft, milestone: payload.milestone, repo: payload.repository})
            case 'release.released':
              return Ifs.releaseReleased({iffft, release: payload.release, repo: payload.repository})
            case 'schedule':
              return Ifs.waitUntil({iffft})
          }
        }
        return false
      })

      if (iffftsMet.length) {
        console.log(`Found issue ${octokitParams.owner}/${octokitParams.repo}#${issue.number} with metadata waiting on this specific ${event} event`, iffftsMet)

        for (const iffft of iffftsMet) {
          switch (iffft.Then) {
            case 'assign':
              await Thens.assign({octokit, octokitParams, iffft})
              break
            case 'close':
              await Thens.close({octokit, octokitParams, iffft})
              break
            case 'label':
              await Thens.addLabel({octokit, octokitParams, iffft})
          }

          await Metadata.remove({octokit, octokitParams, issueBody: issue.body, iffft, label: LABEL})
        }
      }
    }
  }
}
