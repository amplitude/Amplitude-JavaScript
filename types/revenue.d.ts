export default Revenue;
declare class Revenue {
    public setProductId(productId: string): Revenue;
    _productId: string;
    public setQuantity(quantity: number): Revenue;
    _quantity: number;
    public setPrice(price: number): Revenue;
    _price: number;
    public setRevenueType(revenueType: string): Revenue;
    _revenueType: string;
    public setEventProperties(eventProperties: object): Revenue;
    _properties: {};
    private _isValidRevenue;
    private _toJSONObject;
}
