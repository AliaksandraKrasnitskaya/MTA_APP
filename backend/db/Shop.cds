type Id : String(4);
using Address from './Address';

entity Shop {
    key shopid : Id;
    name : String(100);
    topShop : Integer;

    toAddress : association to one Address on toAddress.shopid = shopid;
};
