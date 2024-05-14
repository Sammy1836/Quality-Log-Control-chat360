const fs = require('fs');

class LogRecord {
  constructor(level, logString, timestamp, source, metadata = {}) {
    this.level = level;
    this.logString = logString;
    this.timestamp = new Date(timestamp);
    this.source = source;
    this.metadata = metadata;
  }
}

class LogStore {
  constructor(configPath) {
    this.configPath = configPath;
    this.logFiles = {};
    this.loadConfig();
  }

  loadConfig() {
    const data = fs.readFileSync(this.configPath, 'utf8');
    const config = JSON.parse(data);
    for (const [apiName, settings] of Object.entries(config)) {
      this.logFiles[apiName] = settings['log_file'];
    }
  }

  addLog(apiName, logData) {
    const logRecord = this.parseLogData(logData);
    if (!logRecord) {
      throw new Error('Error parsing log data');
    }

    const logFile = this.logFiles[apiName];
    if (!logFile) {
      throw new Error(`Log file not configured for API: ${apiName}`);
    }

    const logRecordString = JSON.stringify(logRecord) + '\n';
    fs.appendFileSync(logFile, logRecordString, 'utf8');
  }

  parseLogData(logData) {
    let logObject;
    if (typeof logData === 'string') {
      try {
        logObject = JSON.parse(logData);
      } catch (err) {
        console.error('Error parsing log data:', err);
        return null;
      }
    } else if (typeof logData === 'object') {
      logObject = logData;
    } else {
      console.error('Unsupported log data format');
      return null;
    }

    const timestamp = new Date(logObject.timestamp);
    if (isNaN(timestamp)) {
      console.error('Error parsing timestamp');
      return null;
    }

    return new LogRecord(
      logObject.level,
      logObject.log_string,
      logObject.timestamp,
      logObject.source,
      logObject.metadata
    );
  }

  getLogs(level, logString, source, timestampRange) {
    const filteredLogs = [];
    for (const logFile of Object.values(this.logFiles)) {
      const data = fs.readFileSync(logFile, 'utf8');
      const lines = data.split('\n').filter(line => line !== '');

      for (const line of lines) {
        let logRecord;
        try {
          logRecord = JSON.parse(line);
        } catch (err) {
          console.error('Error parsing log record:', err);
          continue;
        }

        const logRecordDate = new Date(logRecord.timestamp);
        if (
          (!level || level === logRecord.level) &&
          (!logString || logRecord.logString.includes(logString)) &&
          (!source || source === logRecord.source) &&
          (!timestampRange || this.isInRange(logRecordDate, timestampRange))
        ) {
          filteredLogs.push(logRecord);
        }
      }
    }
    if (filteredLogs.length === 0) {
      return ("No such log.")
    }
    else {
      return filteredLogs;
    }
  }

  isInRange(timestamp, timestampRange) {
    if (!timestampRange) {
      return true;
    }

    const rangeStart = new Date(timestampRange.start);
    const rangeEnd = new Date(timestampRange.end);
    return (timestamp >= rangeStart && timestamp <= rangeEnd);
  }
}

module.exports = { LogRecord, LogStore };

