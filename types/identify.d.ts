export default Identify;
declare class Identify {
    public add(property: string, value: number | string): Identify;
    public append(property: string, value: number | string | any | object): Identify;
    private clearAll;
    public prepend(property: string, value: number | string | any | object): Identify;
    public set(property: string, value: number | string | any | boolean | object): Identify;
    public setOnce(property: string, value: number | string | any | boolean | object): Identify;
    public unset(property: string): Identify;
    private _addOperation;
}
