const { LogStore } = require('./logStore');
const readline = require('readline');
const logStore = new LogStore('config.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

(async function() {
    const level = await askQuestion('Enter log level (info, error, success) or leave blank: ');
    const logString = await askQuestion('Enter log string or leave blank: ');
    const source = await askQuestion('Enter source or leave blank: ');
    const start = await askQuestion('Enter start timestamp (YYYY-MM-DDTHH:mm:ssZ) or leave blank: ');
    const end = await askQuestion('Enter end timestamp (YYYY-MM-DDTHH:mm:ssZ) or leave blank: ');

    const timestampRange = (start && end) ? { start, end } : null;

    const logs = logStore.getLogs(level, logString, source, timestampRange);
    console.log('Filtered Logs:', logs);

    rl.close();
})();