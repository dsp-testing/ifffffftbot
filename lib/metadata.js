const DateParser = require('./dateParser')

const REGEX = /\n\n<!-- iffftbot = (.*) -->/

module.exports = {
  async set({octokit, octokitParams, issueBody, metadata, label}) {
    sanitizeMetadata({metadata, octokitParams})
    console.log('setting metadata', metadata)
  
    let data = {}
    const body = issueBody.replace(REGEX, (_, json) => {
      data = JSON.parse(json)
      return ''
    })

    data[metadata.key] = metadata
  
    await octokit.issues.update(Object.assign({
      body: `${body}\n\n<!-- iffftbot = ${JSON.stringify(data)} -->` 
    }, octokitParams))
    octokit.issues.addLabels(Object.assign({labels: [label]}, octokitParams))
    octokit.issues.createComment(Object.assign({
      body: `Iffftbot will ${metadata.Then} this issue with ${metadata.With} when ${metadata.If} where ${metadata.Where}.`
    }, octokitParams))
  },
  async remove({octokit, octokitParams, issueBody, metadata, label}) {
    let data = {}
    let body = issueBody.replace(REGEX, (_, json) => {
      data = JSON.parse(json)
      return ''
    })

    delete data[metadata.key]
    const remainingIfffts = Object.keys(data).length
    if (remainingIfffts) {
      body = `${body}\n\n<!-- iffftbot = ${JSON.stringify(data)} -->`
    }

    await octokit.issues.update(Object.assign({ body }, octokitParams))
    if (!remainingIfffts) {
      octokit.issues.removeLabel(Object.assign({ name: label }, octokitParams))
    }
  },
  get({issueBody}) {
    const match = issueBody.match(REGEX)
    if (match) {
      return JSON.parse(match[1])
    }
  }
}

function sanitizeMetadata({metadata, octokitParams}) {
  metadata.key = process.env.GITHUB_RUN_ID

  switch (metadata.If) {
    case 'issues.closed':
      if (!/\S+\/\S+#\d+/.test(metadata.Where) && !isNaN(parseInt(metadata.Where, 10))) {
        metadata.Where = `${octokitParams.owner}/${octokitParams.repo}#${metadata.Where}`
      }
      break
    case 'schedule':
      metadata.Where = DateParser.parseDate(metadata.Where, null, { forwardDate: true })
      break
  }

  if (metadata.Then === 'assign') {
    metadata.With = metadata.With.replace('@', '')
    if (!metadata.With || metadata.With === 'me') {
      metadata.With = metadata.user
    }
  }
}
