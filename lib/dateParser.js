const chrono = require('chrono-node')

const dateParser = chrono.casual.clone()
dateParser.parsers.push({
  pattern: () => { return /\b(FY )?Q(1|2|3|4)( (\d{4}))?\b/i },
  extract: (context, match) => {
    const currentMonth = context.refDate.getMonth() + 1
    const currentYear = context.refDate.getFullYear()
    let month = match[2] * 3 - 2
    let year = match[4] ? parseInt(match[4], 10) : currentYear
        
    if (match[1]) {
      month -= 6
      if (month < 1) {
        month += 12
        year -= 1
      }
    }
        
    if (!match[4] && (year < currentYear || (year === currentYear && month < currentMonth))) {
      year += 1
    }
    
    return {day: 1, month, year}
  }
})
dateParser.parsers.push({
  pattern: () => { return /\bNext quarter\b/i },
  extract: (context, match) => {
    let month = context.refDate.getMonth() + 1
    let year = context.refDate.getFullYear()
    if (month < 4) {
      month = 4
    } else if (month < 7) {
      month = 7
    } else if (month < 10) {
      month = 10
    } else {
      month = 1
      year += 1
    }
    
    return {day: 1, month, year}
  }
})
dateParser.refiners.push({
  refine: (context, results) => {
    results.forEach((result) => {
      if (!result.start.isCertain('hour')) {
        result.start.imply('hour', 9)
      }
      if (!result.start.isCertain('minute')) {
        result.start.imply('minute', 0)
      }
      if (!result.start.isCertain('second')) {
        result.start.imply('second', 0)
      }
    })
    return results
  }
})

module.exports = dateParser
