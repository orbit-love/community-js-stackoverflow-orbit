const axios = require('axios')
const cheerio = require('cheerio')
const stackexchange = require('stackexchange')
const moment = require('moment')

const stackExchangeClient = new stackexchange({ version: 2.2 })

const getSOSinglePage = options => {
    return new Promise((resolve, reject) => {
        try {
            const { tag, page, hours, credentials } = options
            const query = {
                key: credentials.stackAppsKey,
                pagesize: 50,
                tagged: tag,
                sort: 'creation',
                order: 'asc',
                page: page,
                fromdate: moment().subtract(hours, 'hours').format('X')
            }
            stackExchangeClient.questions.questions(query, (error, results) => {
                if(error) throw new Error(error)
                resolve(results)
            })
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
            let questions = []
            while(has_more) {
                const results = await getSOSinglePage({ ...options, page })
                questions = [...questions, ...results.items]
                has_more = results.has_more
                if(has_more) page++
            }
            resolve(questions)
        } catch(error) {
            reject(error)
        }
    })
}

const enrichSingleQuestion = question => {
    return new Promise(async (resolve, reject) => {
        try {
            const { data: html } = await axios.get(`https://stackoverflow.com/users/${question.owner.user_id}`).catch(e => reject(e))
            const $ = cheerio.load(html)

            let github, twitter
            for(let link of $('[rel=me]')) {
                const url = $(link).attr('href')
                const username = $(link).text()
                if(url.includes('github')) github = username
                if(url.includes('twitter')) twitter = username.split('@').join('')
            }

            const q = { ...question }
            if(github) q.owner.github = github
            if(twitter) q.owner.twitter = twitter
            resolve(q)
        } catch(error) {
            reject(error)
        }
    })
}

const enrichAllQuestions = questions => {
    return new Promise(async (resolve, reject) => {
        try {
            const expanded = []
            for(let question of questions) {
                const profile = await enrichSingleQuestion(question)
                expanded.push(profile)
            }
            resolve(expanded)
        } catch(error) {
            reject(error)
        }
    })
}

const get = options => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!options.tag) throw new Error('You must provide a tag')
            if(!options.hours) throw new Error('You must provide hours')

            const questions = await getSOAllPages(options)
            const enriched = await enrichAllQuestions(questions)
            resolve(enriched)
        } catch(error) {
            reject(error)
        }
    })
}

const prepare = questions => {
    return new Promise(async (resolve, reject) => {
        try {
            const prepared = questions.map(question => {
                return {
                    activity: {
                        description: `Tags: ${question.tags.join(', ')}`,
                        link: question.link,
                        link_text: 'View question on Stack Overflow',
                        title: `Asked ${question.title}`,
                        activity_type: 'stackoverflow:question',
                        key: `stackoverflow-question-${question.question_id}`,
                        occurred_at: new Date(question.creation_date * 1000).toISOString(),
                        member: {
                            name: question.owner.display_name,
                            github: question.owner.github,
                            twitter: question.owner.twitter
                        },
                    },
                    identity: {
                        source: 'Stack Overflow',
                        source_host: 'stackoverflow.com',
                        username: question.owner.display_name,
                        url: question.owner.link,
                        uid: question.owner.user_id
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
