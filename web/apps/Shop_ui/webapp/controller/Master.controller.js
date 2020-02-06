sap.ui.define([
    "shops/controller/BaseController",
    "sap/ui/model/Sorter",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "shops/model/formatter",
    "sap/m/MessageBox"
], function (BaseController, Sorter, Filter, FilterOperator, formatter, MessageBox) {
    "use strict";

    return BaseController.extend("shops.controller.Main", {

        _oDialog: null,

        onInit: function () {
            //For local development. Start your NodeJS server.
            this.host = "http://localhost:3000";
            //For cloud router. So... router will see prefix /api and will forward request to NodeJS in cloud
            //this.host = "/api";
            //For directly NodeJS. So request will be sent directly to NodeJS in cloud (replace with your uri)
            //this.host = "https://p2001017289trial-trial-dev-lev-srv.cfapps.eu10.hana.ondemand.com";
            this.oDataModel = this.getOwnerComponent().getModel();
            this.getView().setModel(this.oDataModel);
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("Master").attachMatched(this._onRouteMatched, this);
            this.oFilterBar = this.getView().byId("filterbar");
            this.oFilterBar.variantsInitialized();
        },

        _onRouteMatched: function () {
            this.getView().byId("ShopList").getBinding("items").refresh();
        },

        _getBundle: function (sText) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sText);
        },
        
        onUpdateFinished: function(oEvent) {
            const oTitle = this.getView().byId("TableTitle");
            const sTableTitle = this._getBundle("worklistTableTitle");
            oTitle.setText(`${sTableTitle} (${oEvent.getSource().getBinding("items").getLength()})`);
		},

        onSearch : function (oEvent) {
            var sQuery = oEvent.getParameter("query");
			var aFilters = [];
			if( sQuery ) {
				aFilters.push( new Filter("name", FilterOperator.Contains, sQuery) );
            }
            this.byId("ShopList").getBinding("items")
                            .filter(aFilters.length === 0 ? aFilters : new Filter(aFilters, false), "Application");
        },
        
        onClear: function(oEvent) {
            var aFilterItems = this.oFilterBar.getAllFilterItems();
            aFilterItems.forEach(item => {
                item.getControl("Input").setValue("");
            })
        },
        
        onItemPress: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
			this.getOwnerComponent().getRouter().navTo("ShopDetail", {
                studid : oContext.getProperty("shopid")
            });
		},

		onSearchFilter: function (oEvent) {
            var oView = this.getView(),
            sName = oView.byId("Fname").getValue(),

            aFilter = [ new Filter("name", FilterOperator.Contains, sName)
                         ];

			oView.byId("ShopList").getBinding("items").filter(aFilter);
        },
        
        onCreate: function() {
            this.getOwnerComponent().getRouter().navTo("ShopDetail", {
                studid : "0000"
            });
        },

        onSave: function() {
            var oData = this.oDataModel.getData();

            this.getApp().setBusy(true);
            jQuery.ajax({
                type: "POST",
                url: this.host + "/shop",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(oData),
                success: function(data){
                    
                    sap.m.MessageToast.show("shop Created");
                    this.getApp().setBusy(false);
                }.bind(this),
                error: function(oError) {
                    this.getApp().setBusy(false);
                    jQuery.sap.log.error(oError);
                    MessageBox.error("Creating failed");
                }.bind(this)
            });
        },

        onDelete: function(){
            var oTable = this.byId("ShopList");
            var aItems = oTable.getSelectedItems();
            

            this.getApp().setBusy(true);
            aItems.forEach(item => {
                var sItemPath = item.getBindingContext().getBinding().getPath();
                var sItemId = item.getBindingContext().getProperty("shopid");

                jQuery.ajax({
                    type: "DELETE",
                    url: this.host + sItemPath + "/" + sItemId,
                    contentType: "application/json",
                    success: function(){
                        this.oDataModel.refresh();
                        this.getApp().setBusy(false);
                        MessageBox.success("shop " +  + sItemId + " was Deleted");
                    }.bind(this),
                    error: function(oError) {
                        this.getApp().setBusy(false);
                        jQuery.sap.log.error(oError);
                        MessageBox.error("Deleting shop " + sItemId + " was failed");
                    }.bind(this)
                });
            });
        },

        onSelectionChange: function(oEvent){
            var oTable = oEvent.getSource();
            var oButton = this.byId("delButton");
            var aContexts = oTable.getSelectedContexts();
            var bSelected = (aContexts && aContexts.length > 0);
            oButton.setEnabled(bSelected);
        },

        onToggleHeader: function() {
			this.getPage().setHeaderExpanded(!this.getPage().getHeaderExpanded());
        },
        
        getPage: function() {
			return this.getView().byId("dynamicPageId");
		},

        onCancel: function(){
            this.oDataModel.setData();
        },

        onExit : function () {
		},     

    });
});
