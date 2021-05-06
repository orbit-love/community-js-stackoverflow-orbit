import axios from 'axios'
import { RateLimiter } from 'limiter'

const limiter = new RateLimiter({
    tokensPerInterval: 120,
    interval: 'minute'
})

const addActivities = (activities, options) => {
    return new Promise(async (resolve, reject) => {
        try {

            for(let activity of activities) {
                await limiter.removeTokens(1)

                const { data } = await axios({
                    url: `${options.BASE_URL}/${options.credentials.orbitWorkspaceId}/activities`,
                    method: 'POST',
                    headers: { Authorization: `Bearer ${options.credentials.orbitApiKey}` },
                    data: activity
                })
                console.log(data)
            }
            resolve(`Added ${activities.length} activities to the ${options.credentials.orbitWorkspaceId} Orbit workspace.`)
        } catch(error) {
            console.error(error)
            reject(error)
        }
    })
}


export default {
    addActivities,
}
