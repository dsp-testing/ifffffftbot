const moment = require('moment')

module.exports = {
  issueClosed({metadata, issue, repo}) {
    return metadata.Where === `${repo.full_name}#${issue.number}`
  },
  milestoneClosed({metadata, milestone}) {
    return metadata.Where === milestone.title
  },
  releaseReleased({metadata, release}) {
    return metadata.Where === release.tag_name || metadata.Where === release.name
  },
  waitUntil({metadata}) {
    return moment(metadata.Where) < moment()
  }
}
