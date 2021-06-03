# Stack Overflow to Orbit Workspace


![Build Status](https://github.com/orbit-love/community-js-stackoverflow-orbit/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/%40orbit-love%2Fstackoverflow.svg)](https://badge.fury.io/js/%40orbit-love%2Fstackoverflow)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](.github/CODE_OF_CONDUCT.md)

This is a JavaScript package that can be used to integrate Stack Overflow questions with a specified tag into your organization's Orbit workspace.

|<p align="left">:sparkles:</p> This is a *community project*. The Orbit team does its best to maintain it and keep it up to date with any recent API changes.<br/><br/>We welcome community contributions to make sure that it stays current. <p align="right">:sparkles:</p>|
|-----------------------------------------|

![There are three ways to use this integration. Install package - build and run your own applications. Run the CLI - run on-demand directly from your terminal. Schedule an automation with GitHub - get started in minutes - no coding required](docs/ways-to-use.png)

## First Time Setup

To set up this integration you will need some details from StackOverflow. During the setup, we will need to create a new application on Stack Apps which will allow this integration to interact with the platform. The application will contain a Key which we should take note of for later.

1. Head to [Stack Apps](https://stackapps.com) and login in to your account.
2. [Register a new Stack Apps application](https://stackapps.com/apps/oauth/register). The oauth domain can be anything, as can the application website.
3. In your application settings, take note of your `Key` value.


## Application Credentials

The application requires the following environment variables:

| Variable | Description | More Info
|---|---|--|
| `STACK_APPS_KEY` | API Key to query Stack Overflow | Follow the First Time Setup guide above
| `ORBIT_API_KEY` | API key for Orbit | Found in `Account Settings` in your Orbit workspace
| `ORBIT_WORKSPACE_ID` | ID for your Orbit workspace | Last part of the Orbit workspace URL, i.e. `https://app.orbit.love/my-workspace`, the ID is `my-workspace`

## Installation

Install the package with the following command

```
$ npm install @orbit-love/stackoverflow
```

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

## Questions

```js
// Allows you to go back a number of hours and only get questions in that timeframe
const questions = await orbitStackOverflow.getQuestions({ tag: 'tag-1', hours: 24 })
const prepared = await orbitStackOverflow.prepareQuestions(questions)
const response = await orbitStackOverflow.addActivities(prepared)
console.log(response) // "Added n activities to the workspace-id Orbit workspace"
```

### `prepareQuestions()`

There are several options when calling the `prepareQuestions()` method. The default is `'orbitActivity'`.

```js
// Returns question list as Orbit activity objects
await orbitStackOverflow.prepareQuestions(questions, 'orbitActivity')

// Returns questions that have at least one answer
await orbitStackOverflow.prepareQuestions(questions, 'hasAnswer')

// Returns questions with recent activity
await orbitStackOverflow.prepareQuestions(questions, 'recentActivity', { hours: 24 })

// Returns questions that are new within a number of hours - useful for post-fetching filtering
await orbitStackOverflow.prepareQuestions(questions, 'postedWithinHours', { hours: 24 })

// Returns an array of question IDs only
await orbitStackOverflow.prepareQuestions(questions, 'onlyIds')
```

## Answers

```js
const questionIds = [123, 456, 789]
const answers = await orbitStackOverflow.getAnswers({ ids: questionIds, hours: 24 })
const prepared = await orbitStackOverflow.prepareAnswers(questions)
const response = await orbitStackOverflow.addActivities(prepared)
console.log(response) // "Added n activities to the workspace-id Orbit workspace"
```

## CLI Usage

To use this package you do not need to install it, but will need Node.js installed on your machine.

To use the CLI you must have the following environment variables set: `ORBIT_WORKSPACE_ID`, `ORBIT_API_KEY`, and `STACK_APPS_KEY`.

```
npx @orbit-love/stackoverflow [FLAGS]
```

### Questions

```
npx @orbit-love/stackoverflow --questions --tag=tag-1 [--hours=12]
```

* `--hours` is optional and defaults to 24.

### Answers

```
npx @orbit-love/stackoverflow --answers --tag=tag-1 [--hours=12]
```

* `--hours` is optional and defaults to 24.
* This will only get answers on questions posted in the last 28 days.

### Questions & Answers

```
npx @orbit-love/stackoverflow --questions --answers --tag=tag-1 [--hours=12]
```

* `--hours` is optional and defaults to 24.
* This will only get answers on questions posted in the last 28 days.

## GitHub Actions Automation Setup

⚡ You can set up this integration in a matter of minutes using our GitHub Actions template. It will run regularly to add new activities to your Orbit workspace. All you need is a GitHub account.

[See our guide for setting up this automation](https://github.com/orbit-love/github-actions-templates/blob/main/StackOverflow/README.md).

## Contributing

We 💜 contributions from everyone! Check out the [Contributing Guidelines](.github/CONTRIBUTING.md) for more information.

## License

This project is under the [MIT License](./LICENSE).

## Code of Conduct

This project uses the [Contributor Code of Conduct](.github/CODE_OF_CONDUCT.md). We ask everyone to please adhere by its guidelines.
