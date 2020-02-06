sap.ui.define([
    "shops/controller/BaseController",
    'sap/ui/core/Fragment',
    "sap/ui/model/json/JSONModel",
    "shops/model/formatter"
], function (BaseController, Fragment, JSONModel, formatter) {
    "use strict";

    return BaseController.extend("shops.controller.Main", {

        _formFragments: {},

        onInit: function() {
            this.host = "http://localhost:3000";
            this.aInputs = [];

            this.oDataModel = new JSONModel();
            this.oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
            this.getView().setModel(this.oDataModel);

            this.oObjectPageLayout = this.byId("idObjectPage");
            this.oObjectPageLayout.setSelectedSection(this.getView().byId("GeneralSection").getId());

            this.oSubjectsView = this.byId("SubjectsView")

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("ShopDetail").attachMatched(this._onRouteMatched, this);
        },

        onExit: function() {
           this._destroyFragments(_formFragments);
        },

        _destroyFragments: function(aFragments){
            for (var sPropertyName in aFragments) {
                if (!aFragments.hasOwnProperty(sPropertyName) || aFragments[sPropertyName] == null) {
                    return;
                }

                aFragments[sPropertyName].destroy();
                aFragments[sPropertyName] = null;
            }
        },

        _onRouteMatched: function(oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            this.oObjectPageLayout.setSelectedSection(this.getView().byId("GeneralSection").getId());
            if (!oArgs.studid) {
                sap.m.MessageToast.show("Navigation error");
                this.getOwnerComponent().getRouter().navTo("Master");
                return;
            } else if (oArgs.studid === "0000") {
                this._toggleButtonsAndView(true);
                this._toggleFooter();
                this.getView().getModel().setData({
                    toAddress: {},
                    toGradeBook: {}
                });
    
                this.getView().getModel().setProperty("/post", true);
            } else {
                this.getApp().setBusy(false);

                jQuery.ajax({
                    type: "GET",
                    url: this.host + "/odata/Shop('" + oArgs.shopid + "')" + "?$expand=toAddress",
                    dataType: "json",
                    contentType: "application/json",
                    success: function (data) {
                        this.oDataModel.setData(data);
                        this._toggleButtonsAndView(false);
                        this.getApp().setBusy(false);
                    }.bind(this),
                    error: function (oError) {
                        this.getApp().setBusy(false);
                        jQuery.sap.log.error(oError);
                    }.bind(this)
                });
            }
        },
        _onBindingChange: function() {
            if (!this.getView().getBindingContext()) {
                this.getRouter().getTargets().display("notFound");
            }
        },

        _toggleButtonsAndView: function(bEdit) {
            var oView = this.getView();

            oView.byId("edit").setVisible(!bEdit);
            oView.byId("save").setVisible(bEdit);
            oView.byId("cancel").setVisible(bEdit);

            this._showFormFragment(bEdit ? "Change" : "Display");
            this._showListItemFragment(bEdit ? "Change" : "Display");
        },

        _getBundle: function (sText) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sText);
        },

        _showFormFragment: function (sFragmentName) {
            var oFormFragment = this._formFragments[sFragmentName];
            var oSubSection = this.byId("GeneralSubSection");
            oSubSection.removeAllBlocks();

            if (oFormFragment) {
                oSubSection.insertBlock(oFormFragment);
            } else {
                Fragment.load({
                        id: this.getView().getId(),
                        name: "shops.fragment.GeneralForm" + sFragmentName,
                        controller: this
                    })
                    .then(oFormFragment => {
                        this._formFragments[sFragmentName] = oFormFragment;
                        oSubSection.insertBlock(oFormFragment);
                    });
            }
        },

        _toggleFooter: function() {
            this.oObjectPageLayout.setShowFooter(!this.oObjectPageLayout.getShowFooter());
        },

        _cleanView: function() {
            this._toggleButtonsAndView(false);
            this.oObjectPageLayout.setShowHeaderContent(true);
            this._toggleFooter();
        },

        onSelectionChange: function(oEvent){
            var oTable = oEvent.getSource();
            var oButton = this.byId("delButton");
            var aContexts = oTable.getSelectedContexts();
            var bSelected = (aContexts && aContexts.length > 0 && this.aInputs.length > 0);
            oButton.setEnabled(bSelected);
        },

        onCancel: function () {
            if(this.getView().getModel().getProperty("/post")){
                this.getOwnerComponent().getRouter().navTo("Master");
                this._cleanView();
                return;
            }
            this._cleanView();
        },


        onSave: function () {
            if (this.getView().getModel().getProperty("/post")) {
                this._setModel();
                delete this.oDataModel.getData().post;
                const oData = this.oDataModel.getData();
                this.getApp().setBusy(true);

                jQuery.ajax({
                    type: "POST",
                    url: this.host + "/Shop",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(oData),
                    success: function () {
                        this.getApp().setBusy(false);
                        this._cleanView();
                        sap.m.MessageToast.show("Shop created");
                        this.getOwnerComponent().getRouter().navTo("Master");
                    }.bind(this),
                    error: function (oError) {
                        this.getApp().setBusy(false);
                        sap.m.MessageToast.show("Creating failed");
                        this._cleanView();
                        this.getOwnerComponent().getRouter().navTo("Master");
                        jQuery.sap.log.error(oError);
                    }.bind(this)
                });
            }
        },

        onUpdateFinished: function(oEvent) {
            const oTitle = this.getView().byId("TableTitle");
            const sTableTitle = this._getBundle("subjectTitle");
            oTitle.setText(`${sTableTitle} (${oEvent.getSource().getBinding("items").getLength()})`);

		},

        onEdit: function () {
            this.oObjectPageLayout.setShowHeaderContent(false);
            this._toggleButtonsAndView(true);
            this._toggleFooter();
        }

    });
});