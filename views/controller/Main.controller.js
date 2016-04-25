sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("com.henryzhefeng.controller.Main", {

        baseUrl: "",

        onInit: function() {
            this.baseUrl = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
            const todoListServiceUrl = this.baseUrl + "/todos";

            // get datum
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData(todoListServiceUrl);
            this.getView().setModel(oModel);

            // set up socket.io
            const that = this;
            socket.on("todos created", function(message) {
                that.getView().getModel().loadData(todoListServiceUrl);
            });
            socket.on("todos removed", function(message) {
                that.getView().getModel().loadData(todoListServiceUrl);
            });
        },

        onAddBtnClicked: function() {
            const todoListServiceUrl = this.baseUrl + "/todos";
            const oModel = this.getView().getModel();
            const that = this;
            var todoItem = {};
            todoItem.title = this.byId("inputTitle").getValue();
            todoItem.description = this.byId("inputDesc").getValue();
            $.ajax({
                url: todoListServiceUrl,
                type: "post",
                async: false,
                data: todoItem,
                success: function(data) {
                    oModel.loadData(todoListServiceUrl);
                    sap.m.MessageToast.show("Insert Successfully!");
                    // clear fields
                    that.byId("inputDesc").setValue("");
                    that.byId("inputTitle").setValue("");
                }
            });
        },

        onDeleteBtnClicked: function() {
            const oTable = this.byId("table");
            const oModel = this.getView().getModel();
            const todoListServiceUrl = this.baseUrl + "/todos";
            const that = this;

            // empty table check
            if (Object.keys(oModel.oData).length < 1) {
                sap.m.MessageToast.show("warning", "Table is empty.");
                return;
            }

            var selectedItem = oTable.getSelectedItem();
            // selected table row
            if (selectedItem == null) {
                return;
            } else {
                const oContext = oTable.getSelectedContexts()[0];
                const index = oContext.getPath().substring(1);
                $.ajax({
                    url: todoListServiceUrl + "/" + oModel.getData()[index]._id,
                    type: "delete",
                    async: false,
                    success: function(data) {
                        sap.m.MessageToast.show("Delete Successfully!");
                        oModel.loadData(todoListServiceUrl);
                        oTable.removeSelections(true);
                        // clear fields
                        that.byId("inputDesc").setValue("");
                        that.byId("inputTitle").setValue("");
                    }
                });
            }
        },

    });

});
