using Id from './Shop';

entity Address {
		    key adid : Id;
		    shopid : String(4);
		    city : String(100);
		    strt : String(100);
		    hnum : Integer;
		};