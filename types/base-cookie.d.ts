declare namespace _default {
    export { set };
    export { get };
    export { areCookiesEnabled };
}
export default _default;
declare function set(name: any, value: any, opts: any): void;
declare function get(name: any): string;
declare function areCookiesEnabled(opts?: {}): boolean;
