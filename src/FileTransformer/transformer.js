const fs = require('fs')
const config = require('../config')

let jobs = []
const startDir = config.getConfig().dirToWatch
const endDir = config.getConfig().endDir

const pollForJobs = () => {
    setTimeout(()=> {
         jobs = fs.readdirSync(startDir)
            .filter(e => e.includes('job'))
        pollForJobs()
    }, 1000)
}


const getJSONFiles = (jobs) => {
    let dates = []
    jobs.forEach(item =>  dates.push(item.substring(0, 13)))
    return fs.readdirSync(startDir)
        .filter(e => e.includes(dates[0])).filter(e => e.endsWith(".json"))
}



const createTransformFlag = (jsonsTOProccess) => {
    const date = jsonsTOProccess.map(e => e.substring(0, 13)).join('')
    const fileName = `${date}-job-started.txt`
    fs.writeFileSync(`${startDir}/${fileName}`)
}

const removeFromSet = (jobQueue,date) =>  {
   jobQueue.forEach(job => {
       if(job.includes(date)) {
           jobQueue.delete(job)
       }
   })
}

const checkJobStartedFlag = (jobQueue) => {
    return new Promise((resolve => {
        const dates = {}
        jobQueue.forEach(e =>  Object.assign(dates, {[e] : e}))
        jobQueue.forEach(e => {
            let date = e.substring(0, 13)
            let key = `${date}-job-started.txt`
            if(key in dates) {
                removeFromSet(jobQueue, date)
            }
        })
        resolve()
    }))

}

const checkJobCompletedFlag = (jobQueue) => {
    return new Promise((resolve => {
        const dates = {}
        jobQueue.forEach(e =>  Object.assign(dates, {[e] : e}))
        jobQueue.forEach(e => {
            let date = e.substring(0, 13)
            let key = `${date}-job-completed.txt`
            if(key in dates) {
                removeFromSet(jobQueue, date)
            }
        })
        resolve()
    }))

}


const createJobCompleteFlag = (jsonsTOProccess) => {
    const date = jsonsTOProccess.map(e => e.substring(0, 13)).join('')
    const fileName = `${date}-job-completed.txt`
    fs.writeFileSync(`${startDir}/${fileName}`)
}

const transformJSON = (jsonsTOProccess) => {
    console.log('transforming...')
    let jsonFile = fs.readFileSync(`${startDir}/${jsonsTOProccess[0]}`, 'utf8')
    let json = JSON.parse(jsonFile)
    json.proccess = {[new Date] : true}
    fs.writeFileSync(`${endDir}/${jsonsTOProccess[0]}`, JSON.stringify(json))
    createJobCompleteFlag(jsonsTOProccess)
}

const prepareTransformJob = async (jobQueue) => {
    await checkJobStartedFlag(jobQueue)
    await checkJobCompletedFlag(jobQueue)
    console.log('job queue size', jobQueue.size)
    if(jobQueue.size > 0) {
        const jsonsTOProccess = getJSONFiles(jobQueue)
       if(jsonsTOProccess.length > 0) {
           createTransformFlag(jsonsTOProccess)
           transformJSON(jsonsTOProccess)
       }
    }
}


const proccessJobs = () => {
    setTimeout(()=> {
        pollForJobs()
        if(jobs.length > 0) {
            let jobQueue = new Set(jobs)
            prepareTransformJob(jobQueue)
        }
        proccessJobs()
    }, 1000)
}

(() => {
    console.log(new Date().toISOString(),'started transformer')
    proccessJobs()
})()