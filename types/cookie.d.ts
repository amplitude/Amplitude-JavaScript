declare namespace _default {
    export { reset };
    export { options };
    export { get };
    export { set };
    export { remove };
    export { setRaw };
    export { getRaw };
}
export default _default;
declare function reset(): void;
declare function options(opts: any, ...args: any[]): {
    expirationDays: any;
    domain: any;
};
declare function get(name: any): any;
declare function set(name: any, value: any): boolean;
declare function remove(name: any): boolean;
declare function setRaw(name: any, value: any): boolean;
declare function getRaw(name: any): string;
