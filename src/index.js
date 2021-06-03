const questions = require('./questions.js')
const answers = require('./answers.js')
const orbit = require('./orbit.js')

const BASE_URL='https://app.orbit.love/api/v1'

class OrbitStackOverflow {
	constructor(orbitWorkspaceId, orbitApiKey, stackAppsKey) {
        this.credentials = this.setCredentials(orbitWorkspaceId, orbitApiKey, stackAppsKey)
	}

    setCredentials(orbitWorkspaceId, orbitApiKey, stackAppsKey) {
        if(!(orbitWorkspaceId || process.env.ORBIT_WORKSPACE_ID)) throw new Error('You must provide an Orbit Workspace ID when initializing Orbit or by setting an ORBIT_WORKSPACE_ID environment variable')
        if(!(orbitApiKey || process.env.ORBIT_API_KEY)) throw new Error('You must provide an Orbit API Key when initializing Orbit or by setting an ORBIT_API_KEY environment variable')
        if(!(stackAppsKey || process.env.STACK_APPS_KEY)) throw new Error('You must provide a Stack Apps Key when initializing StackOverflow or by setting a STACK_APPS_KEY environment variable')
        return {
            orbitWorkspaceId: orbitWorkspaceId || process.env.ORBIT_WORKSPACE_ID,
            orbitApiKey: orbitApiKey || process.env.ORBIT_API_KEY,
            stackAppsKey: stackAppsKey || process.env.STACK_APPS_KEY
        }
    }

    getQuestions(options) {
        return questions.get({
            credentials: this.credentials,
            ...options
        })
    }

    prepareQuestions(list, type = 'orbitActivity', options) {
        return questions.prepare(list, type, options)
    }

    getAnswers(options) {
        return answers.get({
            credentials: this.credentials,
            ...options
        })
    }

    prepareAnswers(list) {
        return answers.prepare(list)
    }

    addActivities(activities) {
        return orbit.addActivities(activities, { credentials: this.credentials, BASE_URL })
    }
}

module.exports = OrbitStackOverflow
