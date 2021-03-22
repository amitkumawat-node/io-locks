"use strict";
const Redis = require("ioredis");
const events_1 = require("events");
function createRedisClient(uri, opts) {
    if (uri) {
        return new Redis(uri, opts);
    }
    else {
        return new Redis(opts);
    }
}
;
class IoLocks {
    constructor(uri, opts = {}) {
        this.redisClient = opts.client || createRedisClient(uri, opts);
        this.prefix = opts.key || "io-locks";
        this.locks = new events_1.EventEmitter();
        const onError = (err) => {
            if (err) {
                this.locks.emit("error", err);
            }
        };
        this.redisClient.on("error", onError);
    }
    resourceKey(_resourceId) {
        return `${this.prefix}#${_resourceId.toString()}`;
    }
    async isLock(_resourceId) {
        try {
            let _resourceKey = this.resourceKey(_resourceId);
            let _lockValue = await this.redisClient.get(_resourceKey);
            if (!_lockValue)
                return false;
            else if (_lockValue) {
                let _timers = _lockValue.split("_");
                if (_timers.length > 1) {
                    let _startTime = Number(_timers[0]);
                    let _endTime = Number(_timers[1]);
                    let _currentTime = Date.now();
                    if (_startTime > _currentTime)
                        return false;
                    if (_currentTime > _startTime && _currentTime < _endTime)
                        return true;
                    this.redisClient.del(_resourceKey);
                }
            }
            return false;
        }
        catch (error) {
            this.locks.emit("error", error);
            return false;
        }
    }
    async setLock(_resourceId, _lockDuration) {
        try {
            let _resourceKey = this.resourceKey(_resourceId);
            let _startTimer = Date.now();
            let _endTimer = _startTimer + (_lockDuration * 1000);
            let _lockValue = `${_startTimer}_${_endTimer}`;
            return this.redisClient.setex(_resourceKey, _lockDuration, _lockValue);
        }
        catch (error) {
            throw error;
        }
    }
    async releaseLock(_resourceId) {
        return this.redisClient.del(this.resourceKey(_resourceId));
    }
}
function createIoLock(uri, opts = {}) {
    if (uri && typeof uri === "object") {
        opts = uri;
        uri = null;
    }
    return new IoLocks(uri, opts);
}
;
module.exports = createIoLock;
