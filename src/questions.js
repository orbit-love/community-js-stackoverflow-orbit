const axios = require('axios')
const cheerio = require('cheerio')
const stackexchange = require('stackexchange')
const moment = require('moment')

const stackExchangeClient = new stackexchange({ version: 2.2 })

const getSOSinglePage = options => {
    return new Promise((resolve, reject) => {
        const { tag, page, hours, credentials } = options
        const query = {
            key: credentials.stackAppsKey,
            pagesize: 50,
            tagged: tag,
            sort: 'creation',
            order: 'asc',
            filter: '!nL_HTx9V7w',
            page: page,
            fromdate: moment().subtract(hours, 'hours').format('X')
        }
        stackExchangeClient.questions.questions(query, (error, results) => {
            if(error) reject(error)
            resolve(results)
        })
    })
}

const getSOAllPages = options => {
    return new Promise(async (resolve, reject) => {
        try {
            let has_more = true
            let page = 1
            let questions = []
            while(has_more) {
                const results = await getSOSinglePage({ ...options, page })
                if(results && results.items) {
                    questions = [...questions, ...results.items]
                }
                has_more = results.has_more
                if(has_more) page++
            }
            resolve(questions)
        } catch(error) {
            reject(error)
        }
    })
}

const get = (options) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!options.tag) throw new Error('You must provide a tag')
            if(!options.hours) throw new Error('You must provide hours')

            const questions = await getSOAllPages(options)
            resolve(questions)
        } catch(error) {
            reject(error)
        }
    })
}

const prepare = (questions, type, options) => {
    return new Promise((resolve, reject) => {
        try {
            let prepared

            if(type == 'orbitActivity') {
                prepared = questions.map(question => {
                    return {
                        activity: {
                            description: `__${question.title}__\n\nTags: ${question.tags.join(', ')}`,
                            link: question.link,
                            link_text: 'View question on Stack Overflow',
                            title: `Asked a question on Stack Overflow`,
                            tags: ['channel:stackoverflow'],
                            activity_type: 'stackoverflow:question',
                            key: `stackoverflow-question-${question.question_id}`,
                            occurred_at: new Date(question.creation_date * 1000).toISOString()
                        },
                        identity: {
                            source: 'Stack Overflow',
                            source_host: 'stackoverflow.com',
                            username: question.owner.link.split('/')[question.owner.link.split('/').length-1],
                            url: question.owner.link,
                            uid: question.owner.user_id
                        }
                    }
                })
            }

            if(type == 'hasAnswer') {
                prepared = questions.filter(question => question.answer_count > 0)
            }

            if(type == 'recentActivity') {
                const { hours } = options
                const oldestAllowable = moment().subtract(hours, 'hours').format('X')
                prepared = questions.filter(question => {
                    return question.last_activity_date > oldestAllowable
                })
            }

            if(type == 'onlyIds') {
                prepared = questions.map(question => question.question_id)
            }

            if(type == 'postedWithinHours') {
                const { hours } = options
                const oldestAllowable = moment().subtract(hours, 'hours').format('X')
                prepared = questions.filter(question => {
                    return question.creation_date > oldestAllowable
                })
            }

            resolve(prepared)
        } catch(error) {
            reject(error)
        }
    })
}

module.exports = {
    get,
    prepare
}
