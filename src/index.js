const pkg = require('../package.json')
const questions = require('./questions.js')
const answers = require('./answers.js')
const OrbitActivities = require('@orbit-love/activities')

class OrbitStackOverflow {
	constructor(orbitWorkspaceId, orbitApiKey, stackAppsKey) {
        this.credentials = this.setCredentials(orbitWorkspaceId, orbitApiKey, stackAppsKey)
        this.orbit = new OrbitActivities(this.credentials.orbitWorkspaceId, this.credentials.orbitApiKey, `community-js-stackoverflow-orbit/${pkg.version}`)
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
        return new Promise((resolve, reject) => {
            try {
                const calls = activities.map(activity => this.orbit.createActivity(activity))
                Promise.allSettled(calls).then(results => {
                    let stats = { added: 0, duplicates: 0 }
                    for(let result of results) {
                        if(result.status != 'fulfilled') {
                            if(result.reason && result.reason.errors && result.reason.errors.key) {
                                stats.duplicates++
                            } else {
                                throw new Error(JSON.stringify(result.reason.errors))
                            }
                        } else {
                            stats.added++
                        }
                    }

                    let reply = `Added ${stats.added} activities to your Orbit workspace.`
                    if(stats.duplicates) reply += ` Your activity list had ${stats.duplicates} duplicates which were not imported`
                    resolve(reply)
                })
            } catch(error) {
                reject(error)
            }
        })
    }
}

module.exports = OrbitStackOverflow
