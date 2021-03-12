const moment = require('moment')

module.exports = {
  issueClosed({iffft, issue, repo}) {
    return iffft.In === repo.full_name && parseInt(iffft.Where, 10) === issue.number
  },
  milestoneClosed({iffft, milestone, repo}) {
    return iffft.In === repo.full_name && iffft.Where === milestone.title
  },
  releaseReleased({iffft, release, repo}) {
    return iffft.In === repo.full_name && (iffft.Where === release.tag_name || iffft.Where === release.name)
  },
  waitUntil({iffft}) {
    return moment(iffft.Where) < moment()
  }
}
