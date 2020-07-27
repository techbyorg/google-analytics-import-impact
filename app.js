import googleapis from 'googleapis'
import Promise from 'bluebird'
import Moment from 'moment'
import momentRange from 'moment-range'
import { init as initImpact, incrementMetric } from '@techby/impact'

const { google } = googleapis
const { extendMoment } = momentRange
const moment = extendMoment(Moment)

const VIEW_ID = 180055840 // TODO: env var
const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly']

const analytics = google.analytics('v3') // v4 not supported yet? 7/26/2020
const privateKey = JSON.parse(process.env.FREE_ROAM_GOOGLE_ANALYTICS_PRIVATE_KEY_JSON)
const jwt = new google.auth.JWT({
  email: privateKey.client_email,
  key: privateKey.private_key,
  scopes: SCOPES
})

initImpact({
  apiKey: process.env.TECH_BY_API_KEY
});

(async () => {
  const startDateStr = '2018-07-01'
  const endDateStr = '2020-07-26'
  const start = moment.utc(startDateStr)
  const end = moment.utc(endDateStr)
  const range = moment.range(start, end)
  const allDates = Array.from(range.by('day'))
  const allWeeks = Array.from(range.by('week'))
  const allMonths = Array.from(range.by('month'))

  await Promise.map(allDates, (date) => {
    return updateMetricByDates('ga:users', date.toDate(), date.endOf('day').toDate(), 'day')
  }, { concurrency: 1 })

  await Promise.map(allWeeks, (date) => {
    return updateMetricByDates('ga:users', date.startOf('week').toDate(), date.endOf('week').toDate(), 'week')
  }, { concurrency: 1 })

  await Promise.map(allMonths, (date) => {
    return updateMetricByDates('ga:users', date.startOf('month').toDate(), date.endOf('month').toDate(), 'month')
  }, { concurrency: 1 })

  await updateMetricByDates('ga:users', start.toDate(), end.toDate(), 'all')
})()

async function updateMetricByDates (metric, startDate, endDate, timeScale) {
  console.log(dateToStr(startDate), dateToStr(endDate), timeScale)
  const result = await analytics.data.ga.get({
    auth: jwt,
    ids: `ga:${VIEW_ID}`,
    'start-date': dateToStr(startDate),
    'end-date': dateToStr(endDate),
    metrics: metric
  })

  const count = parseInt(result.data.totalsForAllResults[metric])

  const res = await incrementMetric('active-users', {}, count, { isTotal: true, date: endDate, isSingleTimeScale: true, timeScale })
  console.log('res', JSON.stringify(await res.json()))
  return res
}

function dateToStr (date) {
  moment(date).format('yyyy-mm-dd')
}
