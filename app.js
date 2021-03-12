const Iffftbot = require('./lib/bot');

// Use UTC for for all Date parsing
process.env.TZ = 'UTC'

module.exports = robot => {
  robot.on('repository_dispatch', (context) => {
    console.log("Repository Dispatch EVENT FIRED!", context.payload.client_payload)
    Iffftbot.on_slash_dispatch({payload: context.payload.client_payload})
  })

  // Open question: Do we store the metadata on the issue that raises the event, the issue that receives the action, or some combination of these depending on the type of event/action?
  // If we're responding to a specific issue event (such as issue closed)
  // then we can listen to that event and use metadata stored in the issue
  // itself to know if anything else needs to be acted on
  // robot.on('issues.closed', (context) => {
  //   console.log("Issue Closed EVENT FIRED!", context.payload)
  //   Iffftbot.on_issue_event_dispatch()
  // })

  robot.on(['schedule', 'release.released', 'issues.closed', 'milestone.closed'], (context) => {
    console.log(`EVENT FIRED!: ${context.name}`, context.payload)
    Iffftbot.on_other_event_dispatch(context)
  })
}
