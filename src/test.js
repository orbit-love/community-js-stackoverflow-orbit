const OrbitStackOverflow = require('./index.js')
const orbitStackOverflow = new OrbitStackOverflow('kevin-test', 'ob_XJhunLp7qee2qHmU93ns', 'r8xMS0YbJvllG1FprVO4lg((')

async function main() {
    // Allows you to go back a number of hours and only get questions in that timeframe
    const questions = await orbitStackOverflow.getQuestions({ tag: 'nexmo', hours: 240 })
    const prepared = await orbitStackOverflow.prepareQuestions(questions)
    const response = await orbitStackOverflow.addActivities(prepared)
    console.log(response) // "Added n activities to the workspace-id Orbit workspace"
}

main()
