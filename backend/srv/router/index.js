"use strict";

module.exports = (app, server) => {
    app.use("/shop", require("./routes/shop")());
    app.use("/dest", require("./routes/dest")());
};
