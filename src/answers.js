const axios = require('axios')
const cheerio = require('cheerio')
const stackexchange = require('stackexchange')
const moment = require('moment')

const stackExchangeClient = new stackexchange({ version: 2.2 })

const getSOSinglePage = options => {
    return new Promise((resolve, reject) => {
        try {
            const { ids, page, hours, credentials } = options
            const query = {
                key: credentials.stackAppsKey,
                pagesize: 50,
                sort: 'creation',
                order: 'asc',
                page: page,
                filter: '!nL_HTxMBi6',
                fromdate: moment().subtract(hours, 'hours').format('X')
            }
            stackExchangeClient.questions.answers(query, (error, results) => {
                if(error) throw new Error(error)
                resolve(results)
            }, ids)
        } catch(error) {
            reject(error)
        }
    })
}

const getSOAllPages = options => {
    return new Promise(async (resolve, reject) => {
        try {
            let has_more = true
            let page = 1
            let answers = []
            while(has_more) {
                const results = await getSOSinglePage({ ...options, page })
                if(results && results.items) {
                    answers = [...answers, ...results.items]
                }
                has_more = results.has_more
                if(has_more) page++
            }
            resolve(answers)
        } catch(error) {
            reject(error)
        }
    })
}

const get = options => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!options.ids) throw new Error('You must provide an ids array')
            if(!options.hours) throw new Error('You must provide hours')

            const answersFullList = []
            const maxIdsPerSOQuery = 100
            const questionIdChunks = [...Array(Math.ceil(options.ids.length / maxIdsPerSOQuery))].map(_ => options.ids.splice(0,maxIdsPerSOQuery))

            for(let chunk of questionIdChunks) {
                const answers = await getSOAllPages({
                    ...options,
                    ids: chunk
                })
                answersFullList.push(...answers)
            }

            resolve(answersFullList)
        } catch(error) {
            reject(error)
        }
    })
}

const prepare = answers => {
    return new Promise(async (resolve, reject) => {
        try {
            const prepared = answers.map(answer => {
                return {
                    activity: {
                        link: `https://stackoverflow.com/questions/${answer.question_id}`,
                        link_text: 'View question on Stack Overflow',
                        title: `Answered a question on Stack Overflow`,
                        tags: ['channel:stackoverflow'],
                        activity_type: 'stackoverflow:answer',
                        key: `stackoverflow-answer-${answer.answer_id}`,
                        occurred_at: new Date(answer.creation_date * 1000).toISOString(),
                    },
                    identity: {
                        source: 'Stack Overflow',
                        source_host: 'stackoverflow.com',
                        username: answer.owner.display_name,
                        url: answer.owner.link,
                        uid: answer.owner.user_id
                    }
                }
            })
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
