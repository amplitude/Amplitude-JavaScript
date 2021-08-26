export default MetadataStorage;
/**
 * MetadataStorage involves SDK data persistance
 * storage priority: cookies -> localStorage -> in memory
 * This priority can be overriden by setting the storage options.
 * if in localStorage, unable track users between subdomains
 * if in memory, then memory can't be shared between different tabs
 */
declare class MetadataStorage {
    constructor({ storageKey, disableCookies, domain, secure, sameSite, expirationDays, storage }: {
        storageKey: any;
        disableCookies: any;
        domain: any;
        secure: any;
        sameSite: any;
        expirationDays: any;
        storage: any;
    });
    storageKey: any;
    domain: any;
    secure: any;
    sameSite: any;
    expirationDays: any;
    cookieDomain: any;
    storage: any;
    getCookieStorageKey(): any;
    save({ deviceId, userId, optOut, sessionId, lastEventTime, eventId, identifyId, sequenceNumber }: {
        deviceId: any;
        userId: any;
        optOut: any;
        sessionId: any;
        lastEventTime: any;
        eventId: any;
        identifyId: any;
        sequenceNumber: any;
    }): void;
    load(): {
        deviceId: any;
        userId: string;
        optOut: boolean;
        sessionId: number;
        lastEventTime: number;
        eventId: number;
        identifyId: number;
        sequenceNumber: number;
    };
}
