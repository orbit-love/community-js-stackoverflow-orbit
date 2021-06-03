#!/usr/bin/env node

const OrbitStackOverflow = require('./index.js')
const args = require('yargs').argv
const moment = require('moment')

async function main() {

    if((!args.questions && !args.answers) || !args.tag || !process.env.ORBIT_WORKSPACE_ID || !process.env.ORBIT_API_KEY || !process.env.STACK_APPS_KEY) {
        return console.error(`
        You must run this command as follows:
        npx @orbit-love/stackoverflow --questions --tag=your-tag --hours=24

        If --hours is not provided it will default to 24.

        You may also use the --answers flag to add new answers as activities.
        New answers will be added from questions in the last 28 days.

        You must also have ORBIT_WORKSPACE_ID, ORBIT_API_KEY & STACK_APPS_KEY environment variables set.
        `)
    }

    const orbitStackOverflow = new OrbitStackOverflow()

    let hours
    if(!args.hours) hours = 24
    else if(Number.isNaN(+args.hours)) return console.error(`${args.hours} is not a number`)
    else hours = args.hours

    if(args.answers) console.log(`Getting 28 days worth of questions so this might take a while`)

    const questions = await orbitStackOverflow.getQuestions({
        tag: args.tag,
        hours: args.answers ? 672 : hours
    })

    console.log(`Got the last ${args.answers ? '28 days' : hours + ' hours'} worth of questions for a total of ${questions.length} items`)

    if(args.questions) {
        const withinTimeframe = await orbitStackOverflow.prepareQuestions(questions, 'postedWithinHours', { hours })
        if(args.answers) console.log(`In the last ${hours} hours there have been ${withinTimeframe.length} questions`)
        const preparedQuestions = await orbitStackOverflow.prepareQuestions(withinTimeframe)
        console.log('Adding activities for new questions to Orbit')
        const responseQuestions = await orbitStackOverflow.addActivities(preparedQuestions)
        console.log(responseQuestions + '\n')
    }

    if(args.answers) {
        const hasAnswer = await orbitStackOverflow.prepareQuestions(questions, 'hasAnswer')
        const recentActivity = await orbitStackOverflow.prepareQuestions(hasAnswer, 'recentActivity', { hours })
        const questionIds = await orbitStackOverflow.prepareQuestions(recentActivity, 'onlyIds')
        const answers = await orbitStackOverflow.getAnswers({ ids: questionIds, hours })
        console.log(`In the last ${hours} hours there have been ${answers.length} answers on questions from the last 28 days`)
        const preparedAnswers = await orbitStackOverflow.prepareAnswers(answers)
        console.log('Adding activities for new answers to Orbit')
        const responseAnswers = await orbitStackOverflow.addActivities(preparedAnswers)
        console.log(responseAnswers)
    }
}

main()
