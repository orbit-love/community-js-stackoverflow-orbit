const axios = require('axios')
const addActivities = (activities, options) => {
    return new Promise(async (resolve, reject) => {
        try {
            let stats = {
                added: 0,
                duplicates: 0
            }
            for(let activity of activities) {
                await axios({
                    url: `${options.BASE_URL}/${options.credentials.orbitWorkspaceId}/activities`,
                    method: 'POST',
                    headers: { Authorization: `Bearer ${options.credentials.orbitApiKey}` },
                    data: activity
                }).then(_ => {
                    stats.added++
                }).catch(error => {
                    console.log(error.response.data)
                    if(error.response.status == 422 && error?.response?.data?.errors?.key[0] == 'has already been taken') {
                        stats.duplicates++
                    } else {
                        throw new Error(error)
                    }
                })
            }
            let reply = `Added ${stats.added} activities to the ${options.credentials.orbitWorkspaceId} Orbit workspace.`
            if(stats.duplicates) reply += ` Your activity list had ${stats.duplicates} duplicates which were not imported`
            resolve(reply)
        } catch(error) {
            reject(error)
        }
    })
}


module.exports = {
    addActivities,
}
