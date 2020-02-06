using Shop as _Shop from '../db/Shop';
using Address as _Address from '../db/Address';

service ShopService {

  entity Shop @(
		title: 'Shops'
	) as projection on _Shop;

  entity Address @(
		title: 'Address'
	) as projection on _Address;

}
