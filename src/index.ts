import * as Redis from 'ioredis';
import { EventEmitter } from 'events';

function createRedisClient(uri, opts){
    if (uri) {
        return new Redis(uri, opts);
    } else {
        return new Redis(opts);
    }
}
interface IoLockOption {
    key: string,
    client: string
};

class IoLocks {
    public readonly redisClient: any;
    private prefix: string;
    public readonly locks: any;

    constructor(uri: string, opts: Partial<IoLockOption> = {}) {
        this.redisClient = opts.client || createRedisClient(uri, opts);
        this.prefix = opts.key || "io-locks";
        this.locks = new EventEmitter();
        const onError = (err: Error) => {
            if (err) {
                this.locks.emit("error", err);
            }
        };
        this.redisClient.on("error", onError);
    }

    private resourceKey(_resourceId){
        return `${this.prefix}#${_resourceId.toString()}`;
    }

    public async isLock(_resourceId) {
        try {
            let _resourceKey = this.resourceKey(_resourceId);
            let _lockValue = await this.redisClient.get(_resourceKey);
            if(!_lockValue) return false;
            else if(_lockValue){
                let _timers = _lockValue.split("_");
                if(_timers.length > 1){
                    let _startTime = Number(_timers[0]);
                    let _endTime = Number(_timers[1]);
                    let _currentTime = Date.now();
                    if(_startTime > _currentTime) return false;
                    if(_currentTime > _startTime && _currentTime < _endTime) return true;
                    this.redisClient.del(_resourceKey);
                }
            }
            return false;
        } catch (error) {
            this.locks.emit("error", error);
            return false;
        }
    }

    public async setLock(_resourceId, _lockDuration: number, opts: any) {
        try {
            let _resourceKey = this.resourceKey(_resourceId);
            let _startTimer = Date.now();
            let _endTimer = _startTimer + (_lockDuration * 1000);
            if(opts && opts.startTime){
                _startTimer = opts.startTime;
                _endTimer = _startTimer + (_lockDuration * 1000);
            }
            if(opts && opts.endTime) {
                _endTimer = opts.endTime;
            }
            let _lockValue = `${_startTimer}_${_endTimer}`;
            return this.redisClient.setex(_resourceKey, _lockDuration, _lockValue);
        } catch (error) {
            throw error;
        }
    }

    public async releaseLock(_resourceId) {
        return this.redisClient.del(this.resourceKey(_resourceId));
    }

    
}

function createIoLock(uri?: any, opts: Partial<IoLockOption> = {}){
    if(uri && typeof uri === "object"){
        opts = uri;
        uri = null;
    }
    return new IoLocks(uri, opts);
};

export = createIoLock;