#!/usr/bin/env node

const OrbitStackOverflow = require('./index.js')
const args = require('yargs').argv

async function main() {

    if(!args.questions || !args.tag) {
        return console.error(`
        You must run this command as follows:
        npx @orbit-love/stackoverflow --questions --tag=your-tag --hours=24

        If --hours is not provided it will default to 24
        `)
    }

    const orbitStackOverflow = new OrbitStackOverflow()

    let hours
    if(!args.hours) hours = 24
    else if(Number.isNaN(+args.hours)) return console.error(`${args.hours} is not a number`)
    else hours = args.hours

    const questions = await orbitStackOverflow.getQuestions({ tag: args.tag, hours })
    const prepared = await orbitStackOverflow.prepareQuestions(questions)
    const response = await orbitStackOverflow.addActivities(prepared)
    console.log(response) // "Added n activities to the workspace-id Orbit workspace"
}

main()
