interface IoLockOption {
    key: string;
    client: string;
}
declare class IoLocks {
    readonly redisClient: any;
    private prefix;
    readonly locks: any;
    constructor(uri: string, opts?: Partial<IoLockOption>);
    private resourceKey;
    isLock(_resourceId: any): Promise<boolean>;
    setLock(_resourceId: any, _lockDuration: number): Promise<any>;
    releaseLock(_resourceId: any): Promise<any>;
}
declare function createIoLock(uri?: any, opts?: Partial<IoLockOption>): IoLocks;
export = createIoLock;
