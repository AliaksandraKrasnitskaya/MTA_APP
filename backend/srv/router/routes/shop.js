/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");
const Promise = require('bluebird');
const dbClass = require(global.__base + "utils/dbClass");

const Shop = "SHOP";
const ADDRESS = "ADDRESS";

function _prepareObject(oShop, req) {
    oShop.changedBy = "DebugUser";
    return oShop;
}


module.exports = () => {
    const app = express.Router();

    app.get("/", async (req, res, next) => {
        const logger = req.loggingContext.getLogger("/Application");
        logger.info('user get request');
        let tracer = req.loggingContext.getTracer(__filename);
        tracer.entering("/student", req, res);

        try {
            const db = new dbClass(req.db);
            const sSql = "SELECT * FROM \"" + Shop + "\" ";
            const aShops = await db.executeUpdate(sSql, []);
            tracer.exiting("/student", aShops);
            res.type("application/json").status(200).send(JSON.stringify(aShops));
        } catch (e) {
            tracer.catching("/student", e);
            next(e);
        }
    });

    app.post("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);
            const oShop = _prepareObject(req.body, req);
            const oAddress = {};
            oShop.shopid = await db.getNextval("shopid");

            const sSql = "INSERT INTO \"" + Shop + "\" VALUES(?,?,?)";
            const aValues = [ oShop.shopid, oShop.name, oShop.top];


            oAddress.adid = await db.getNextval("adid");
            const sSqlAddress = "INSERT INTO \"" + ADDRESS + "\" VALUES(?,?,?,?,?)";
            const aValuesAddress = [ oAddress.adid, oShop.shopid, oAddress.city, oAddress.strt, oAddress.hnum ];

            await Promise.all([db.executeUpdate(sSql, aValues),
                db.executeUpdate(sSqlAddress, aValuesAddress)
            ]);

            res.type("application/json").status(201).send(JSON.stringify(req.body));
        } catch (e) {
            next(e);
        }
    });

    // app.put("/:shopid", async (req, res, next) => {
    //     try {
    //         const db = new dbClass(req.db);
    //         const oShop = _prepareObject(req.body, req);
    //
    //         res.type("application/json").status(200).send(aShops[0]);
    //     } catch (e) {
    //         next(e);
    //     }
    // });

    app.delete('/:shopid', async (req, res, next) => {
        try {
            const db = new dbClass(req.db);
            const oShop = req.params.shopid;
            var sSql = "DELETE FROM \"" + Shop + "\" WHERE \"SHOPID\" = ?";

            const sSqlAddress = "DELETE FROM \"" + ADDRESS + "\" WHERE \"SHOPID\" = ?";


            await Promise.all([db.executeUpdate(sSql, oShop),
                db.executeUpdate(sSqlAddress, oShop)
            ]);



            sSql = "SELECT * FROM \"" + Shop + "\" ";
            const aShops = await db.executeUpdate(sSql, []);

            res.type("application/json").status(200).send(JSON.stringify(aShops));
        } catch (e) {
            next(e);
        }
    });

    return app;
};
