declare namespace _default {
    export { setLogLevel };
    export { getLogLevel };
    export { logLevels };
    export { log };
    export { isEmptyString };
    export { getQueryParam };
    export { sessionStorageEnabled };
    export { truncate };
    export { validateGroups };
    export { validateInput };
    export { validateProperties };
}
export default _default;
declare function setLogLevel(logLevelName: any): void;
declare function getLogLevel(): number;
declare namespace logLevels {
    const DISABLE: number;
    const ERROR: number;
    const WARN: number;
    const INFO: number;
}
declare namespace log {
    function error(s: any): void;
    function warn(s: any): void;
    function info(s: any): void;
}
declare function isEmptyString(str: any): boolean;
declare function getQueryParam(name: any, query: any): string;
declare function sessionStorageEnabled(): boolean;
declare function truncate(value: any): any;
declare function validateGroups(groups: any): {};
declare function validateInput(input: any, name: any, expectedType: any): boolean;
declare function validateProperties(properties: any): {};
