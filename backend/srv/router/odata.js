"use strict";

const dbClass = require(global.__base + "utils/dbClass");
const hdbext = require("@sap/hdbext");

module.exports = function () {
    this.before("READ", req => {
        req.log.debug(`BEFORE_READ ${req.target["@Common.Label"]}`);

    });

    this.on("CREATE", "Shop", async (User) => {
        req.log.debug(`ON CREATE ${req.target["@Common.Label"]}`);

        const {
            data
        } = User;
        if (data.length < 1) {
            return null;
        }

        const dbClass = require(global.__base + "utils/dbPromises");
        var client = await dbClass.createConnection();
        let db = new dbClass(client);

        if (!data.USID) {
            data.USID = await db.getNextval("usid");
//		throw new Error(`Invalid email for ${data.FIRSTNAME}. No Way! E-Mail must be valid and ${data.EMAIL} has problems`);
        }

        const sSql = `INSERT INTO "Shop" VALUES(?,?)`
        const aValues = [oUser.usid, oUser.name];

        req.log.debug(aValues);
        req.log.debug(sSql);
        await db.executeUpdate(sSql, aValues);

        return data;
    });


    this.after("READ", "Shop", (entity) => {
        if (entity.length > 0) {
            // entity.forEach(item => item.mandt = "");
            //entity.forEach(item => item.name = "");
        }
    });

    this.after("READ", "Address", (entity) => {
        if (entity.length > 0) {
            // entity.forEach(item => item.mandt = "");
            //entity.forEach(item => item.name = "");
        }
    });

};
