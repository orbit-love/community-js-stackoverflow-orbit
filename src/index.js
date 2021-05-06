import questions from './questions.js'
import orbit from './orbit.js'

const BASE_URL='https://app.orbit.love/api/v1'

class OrbitStackOverflow {
	constructor(orbitWorkspaceId, orbitApiKey, stackAppsKey) {
		if(!(orbitWorkspaceId || process.env.ORBIT_WORKSPACE_ID)) throw new Error('You must provide an Orbit Workspace ID when initializing Orbit or by setting an ORBIT_WORKSPACE_ID environment variable')
        if(!(orbitApiKey || process.env.ORBIT_API_KEY)) throw new Error('You must provide an Orbit API Key when initializing Orbit or by setting an ORBIT_API_KEY environment variable')
        if(!(stackAppsKey || process.env.STACK_APPS_KEY)) throw new Error('You must provide a Stack Apps Key when initializing StackOverflow or by setting a STACK_APPS_KEY environment variable')

        this.credentials = {
            orbitWorkspaceId: orbitWorkspaceId || process.env.ORBIT_WORKSPACE_ID,
            orbitApiKey: orbitApiKey || process.env.ORBIT_API_KEY,
            stackAppsKey: stackAppsKey || process.env.STACK_APPS_KEY
        }

	}

    getQuestions(options) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await questions.get({
                    credentials: this.credentials,
                    tag: options.tag,
                    hours: options.hours
                })
                resolve(data)
            } catch(error) {
                reject(error)
            }
        })
    }

    prepareQuestions(list) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await questions.prepare(list)
                resolve(data)
            } catch(error) {
                reject(error)
            }
        })
    }

    addActivities(activities) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await orbit.addActivities(activities, { credentials: this.credentials, BASE_URL })
                resolve(data)
            } catch(error) {
                reject(error)
            }
        })
    }
}

module.exports = OrbitStackOverflow
