# Stack Overflow Interactions to Orbit Workspace
A community project to integrate Stack Overflow interactions into Orbit workspaces

|<p align="left">:sparkles:</p> This is a *community project*. The Orbit team does its best to maintain it and keep it up to date with any recent API changes.<br/><br/>We welcome community contributions to make sure that it stays current. <p align="right">:sparkles:</p>|
|-----------------------------------------|

## Usage

```js
const OrbitStackOverflow = require('@orbit-love/stackoverflow')
const orbitStackOverflow = new OrbitStackOverflow()

// Allows you to go back a number of hours and only get questions in that timeframe
const questions = await orbitStackOverflow.getQuestions({ tag: 'tag-1', hours: 24 })
const prepared = await orbitStackOverflow.prepareQuestions(questions)
const response = await orbitStackOverflow.addActivities(prepared)
console.log(response) // "Added n activities to the workspace-id Orbit workspace"
```

## Providing Credentials

You will need:
1. Your [Orbit Workspace ID](https://app.orbit.love) under Settings
2. Your [Orbit API Token](https://app.orbit.love/user/edit)
3. A Key from a [Stack Apps application](https://stackapps.com/apps/oauth/register)

The standard initialization of the library requires the following signature:

```js
const OrbitStackOverflow = require('@orbit-love/stackoverflow')
const orbitStackOverflow = new OrbitStackOverflow('orbitWorkspaceId', 'orbitApiKey', 'stackAppsKey')
```

If you have the following environment variables set: `ORBIT_WORKSPACE_ID`, `ORBIT_API_KEY`, and `STACK_APPS_KEY` then you can initialize the client as follows:

```js
const OrbitStackOverflow = require('@orbit-love/stackoverflow')
const orbitStackOverflow = new OrbitStackOverflow()
```

## CLI

Without installation you can also use this package using npx:

```
npx @orbit-love/stackoverflow --questions --tag=tag-1
```

By default this will get the last 24 hours worth of activity, but this can be explicitly overridden:

```
npx @orbit-love/stackoverflow --questions --tag=tag-1 --hours=12
```

To use the CLI you must have the following environment variables set: `ORBIT_WORKSPACE_ID`, `ORBIT_API_KEY`, and `STACK_APPS_KEY`.
