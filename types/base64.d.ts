export default Base64;
declare namespace Base64 {
    const _keyStr: string;
    function encode(input: any): string;
    function _encode(input: any): string;
    function decode(input: any): string;
    function _decode(input: any): string;
}
