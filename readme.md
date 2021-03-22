# io-locks
 
## How to use
 
```js
const IoLock = require('io-locks');
const ioLock = IoLock({ host: 'localhost', port: 6379 });
```
 
## API
 
### IoLock(uri[, opts])
 
`uri` is a string like `localhost:6379` where your redis server
is located. For a list of options see below.
 
### IoLock(opts)
 
The following options are allowed:
 
- `key`: the name of the key to pub/sub events on as prefix (`io-timers`)
- `host`: host to connect to redis on (`localhost`)
- `port`: port to connect to redis on (`6379`)
- `client`: optional, the redis client
 
If you decide to supply `client`, make sure you use
[node_redis](https://github.com/mranney/node_redis) as a client or one
with an equivalent API.
 
### IoLock#setLock(resourceId: String, duration: Number)
 
Set Lock with given time duration[in Seconds]
```js
ioLock.setLock("resourceId", 10);
```
 
### IoLock#isLock(resourceId: String)
 
Check resource acquired lock or not.
 
```js
let isLocked = await ioLock.isLock("resourceId");
```
 
### IoLock#releaseLock(resourceId: String)
 
Stop timer
 
```js
iolock.releaseLock("resourceId");
```
 
## Client error handling
 
Error Handling
 
```js
iolock.locks.on("error", function(err){
    //Handle Error
})
```
 
## License
 
ISC