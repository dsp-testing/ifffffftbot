const DateParser = require('./dateParser')

const REGEX = /\n\n<!-- iffftbot = (.*) -->/

module.exports = {
  get({issueBody}) {
    const match = issueBody.match(REGEX)
    if (match) {
      return JSON.parse(match[1])
    }
  },
  async set({octokit, octokitParams, issueBody, iffft, label}) {
    console.log('setting metadata', iffft)
    try {
      sanitizeMetadata({iffft, octokitParams})
    } catch (e) {
      console.log(`unable to set metadata`, iffft)
      octokit.issues.createComment(Object.assign({
        body: `Iffftbot had the following trouble with your inputs: ${e.message} for If ${iffft.If} Where ${iffft.Where} In ${iffft.In} Then ${iffft.Then} With ${iffft.With}.`
      }, octokitParams))
      return
    }
  
    let data = {}
    const body = issueBody.replace(REGEX, (_, json) => {
      data = JSON.parse(json)
      return ''
    })

    data[iffft.key] = iffft
  
    await octokit.issues.update(Object.assign({
      body: `${body}\n\n<!-- iffftbot = ${JSON.stringify(data)} -->` 
    }, octokitParams))
    octokit.issues.addLabels(Object.assign({labels: [label]}, octokitParams))
    octokit.issues.createComment(Object.assign({
      body: `Iffftbot will ${iffft.Then} this issue with ${iffft.With} when ${iffft.If} where ${iffft.Where}.`
    }, octokitParams))
  },
  async remove({octokit, octokitParams, issueBody, iffft, label}) {
    let data = {}
    let body = issueBody.replace(REGEX, (_, json) => {
      data = JSON.parse(json)
      return ''
    })

    delete data[iffft.key]
    const remainingIfffts = Object.keys(data).length
    if (remainingIfffts) {
      body = `${body}\n\n<!-- iffftbot = ${JSON.stringify(data)} -->`
    }

    await octokit.issues.update(Object.assign({ body }, octokitParams))
    if (!remainingIfffts) {
      octokit.issues.removeLabel(Object.assign({ name: label }, octokitParams))
    }
    return body
  }
}

function sanitizeMetadata({iffft, octokitParams}) {
  iffft.key = process.env.GITHUB_RUN_ID
  iffft.In = `${octokitParams.owner}/${iffft.In || octokitParams.repo}`

  if (iffft.If === 'schedule') {
    const date = DateParser.parseDate(iffft.Where, null, { forwardDate: true })
    if (date) {
      iffft.Where = date
    } else {
      throw new Error('Unable to parse the date')
    }
  } else if (iffft.If === 'issues.closed') {
    if (isNaN(parseInt(iffft.Where, 10))) {
      throw new Error('Was expecting an issue number for When')
    }
  }

  if (iffft.Then === 'assign') {
    iffft.With = iffft.With.replace('@', '')
    if (!iffft.With || iffft.With === 'me') {
      iffft.With = iffft.user
    }
  }
}
