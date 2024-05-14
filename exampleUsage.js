const { LogStore } = require('./logStore');
const logStore = new LogStore('./config.json');
const logData = {
    level: "error",
    log_string: "Inside the Search API",
    timestamp: "2023-09-15T08:00:00Z",
    metadata: {
        source: "log3.log",
    }
};
logStore.addLog('API1', logData);
const logs = logStore.getLogs("error", "Search API", "log3.log", { start: "2023-09-15T00:00:00Z", end: "2023-09-16T00:00:00Z" });
console.log(logs);