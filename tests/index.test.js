/**
 * @jest-environment node
 */

const OrbitStackOverflow = require('../src/index.js')
const STACK_OVERFLOW_QUESTIONS = require('./STACK_OVERFLOW_QUESTIONS.json')

beforeAll(() => {
    jest.spyOn(OrbitStackOverflow.prototype, 'getQuestions').mockImplementation(options => {
        if(!options.tag) throw new Error('You must provide a tag')
        if(!options.hours) throw new Error('You must provide hours')
        return Promise.resolve(STACK_OVERFLOW_QUESTIONS.items)
    })
})

describe('client', () => {
    it('initializes with arguments passed in directly', () => {
        envVars(false)
        const orbitStackOverflow = new OrbitStackOverflow('val1', 'val2', 'val3')
        expect(orbitStackOverflow.credentials.orbitWorkspaceId).toBe('val1')
        expect(orbitStackOverflow.credentials.orbitApiKey).toBe('val2')
        expect(orbitStackOverflow.credentials.stackAppsKey).toBe('val3')
    })

    it('initializes with credentials from environment variables', () => {
        envVars(true)
        new OrbitStackOverflow()
    })

    it('throws with incomplete set of credentials', () => {
        expect(() => { envVars(false); process.env.ORBIT_WORKSPACE_ID = "val1"; new OrbitStackOverflow(); }).toThrow()
        expect(() => { envVars(false); process.env.ORBIT_API_KEY = "val2"; new OrbitStackOverflow(); } ).toThrow()
        expect(() => { envVars(false); process.env.STACK_APPS_KEY = "val3"; new OrbitStackOverflow(); } ).toThrow()
        expect(() => {
            envVars(false)
            process.env.ORBIT_WORKSPACE_ID = "val1"
            process.env.ORBIT_API_KEY = "val2"
            new OrbitStackOverflow()
        }).toThrow()
        expect(() => {
            envVars(false)
            process.env.ORBIT_API_KEY = "val2"
            process.env.STACK_APPS_KEY= "val3"
            new OrbitStackOverflow()
        }).toThrow()
        expect(() => {
            envVars(false)
            process.env.ORBIT_WORKSPACE_ID = "val2"
            process.env.STACK_APPS_KEY= "val3"
            new OrbitStackOverflow()
        }).toThrow()

        expect(() => { envVars(false); new OrbitStackOverflow('val1', 'val2') }).toThrow()
        expect(() => { envVars(false); new OrbitStackOverflow('val1') }).toThrow()
    })
})

describe('get questions', () => {
    it('returns array', async () => {
        envVars(true)
        const orbitStackOverflow = new OrbitStackOverflow()
        const questions = await orbitStackOverflow.getQuestions({ tag: 'javascript', hours: 1 })
        expect(Array.isArray(questions)).toBe(true)
    })

    it('requires hours', async () => {
        try {
            const orbitStackOverflow = new OrbitStackOverflow()
            await orbitStackOverflow.getQuestions({ tag: 'javascript' })
            fail()
        } catch(error) {
            expect(String(error).includes('hours')).toBeTruthy()
        }
    })

    it('requires tag', async () => {
        try {
            const orbitStackOverflow = new OrbitStackOverflow()
            await orbitStackOverflow.getQuestions({ hours: 12 })
            fail()
        } catch(error) {
            expect(String(error).includes('tag')).toBeTruthy()
        }
    })
})

describe('prepare questions', () => {
    it('returns array of same size as the input', async () => {
        envVars(true)
        const orbitStackOverflow = new OrbitStackOverflow()
        const questions = await orbitStackOverflow.getQuestions({ tag: 'javascript', hours: 1 })
        const prepared = await orbitStackOverflow.prepareQuestions(questions)
        expect(questions.length).toEqual(prepared.length)
    }),
    it('structure is correct', async () => {
        envVars(true)
        const orbitStackOverflow = new OrbitStackOverflow()
        const questions = await orbitStackOverflow.getQuestions({ tag: 'javascript', hours: 1 })
        const prepared = await orbitStackOverflow.prepareQuestions(questions)
        const p = prepared[0]
        expect(p.activity).toBeTruthy()
        expect(p.activity.activity_type).toBe('stackoverflow:question')
        expect(p.activity.title).toBeTruthy()
        expect(p.identity.source_host).toBe('stackoverflow.com')
    })
})

function envVars(toHaveVars) {
    if(toHaveVars) {
        process.env.ORBIT_WORKSPACE_ID = 'var1'
        process.env.ORBIT_API_KEY = 'var2'
        process.env.STACK_APPS_KEY = 'var3'
    } else {
        delete process.env.ORBIT_WORKSPACE_ID
        delete process.env.ORBIT_API_KEY
        delete process.env.STACK_APPS_KEY
    }
}
