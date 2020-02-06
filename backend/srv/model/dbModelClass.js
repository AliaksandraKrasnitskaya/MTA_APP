"use strict";

const Promise = require('bluebird');

module.exports = class {
    constructor(db, entity, params) {
        this.db = db;
        this.entity = entity;
        this.params = params;
    }

    async getAllData() {
        try {
            const db = this.db;
            const entity = this.entity;
            const sSql = "SELECT * FROM \"" + entity + "\" ";

            return await db.executeUpdate(sSql, []);
        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async getStudentById(studId) {
        try {
            const db = this.db;
            const entity = this.entity;
            const sSql = "SELECT * FROM \"" + entity + "\" WHERE \"STUDID\" = ?";

            return await db.executeUpdate(sSql, [studId]);
        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async getComplexStudentById(studId) {
        try {
            const db = this.db;
            const entity = this.entity;
            const sSql = "SELECT STUDENT.*, TOADDRESS.ADID, TOADDRESS.CITY, TOADDRESS.STRT," +
                                " TOGRADEBOOK.GRDID, TOADDRESS.HNUM, TOGRADEBOOK.STDATE, TOGRADEBOOK.COURSE FROM \"STUDENT\" " +
                         "WHERE STUDENT.STUDID = ?";

            return await db.executeUpdate(sSql, [studId]);
        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async insertStudent(){
        try {
            const db = this.db;
            const entity = this.entity;
            const oStudent = this.params;

            oStudent.studid = await db.getNextval("studid");

            const sSql = "INSERT INTO \"" + entity + "\" VALUES(?,?,?,?)";
            const aValues = [ oStudent.studid, oStudent.name, oStudent.surnm, oStudent.age ];
            await Promise.all([db.executeUpdate(sSql, aValues),
                this._insertAddress(),
                this._insertGradeBook()
            ]);
        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async _insertAddress(){
        try {
            const db = this.db;
            const entity = "ADDRESS"
            const oAddress = this.params.toAddress;

            oAddress.adid = await db.getNextval("adid");
            const sSql = "INSERT INTO \"" + entity + "\" VALUES(?,?,?,?,?)";
            const aValues = [ oAddress.adid, this.params.studid, oAddress.city, oAddress.strt, oAddress.hnum ];

            await db.executeUpdate(sSql, aValues);
        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async _insertGradeBook(){
        try {
            const db = this.db;
            const entity = "GRADEBOOK"
            const oGradeBook = this.params.toGradeBook;

            oGradeBook.grdid = await db.getNextval("grdid");
            const sSql = "INSERT INTO \"" + entity + "\" VALUES(?,?,?,?)";
            const aValues = [ oGradeBook.grdid, this.params.studid, oGradeBook.stdate, oGradeBook.course];

            await db.executeUpdate(sSql, aValues);
        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async updateStudent(){
        try {
            const db = this.db;
            const entity = this.entity;
            const params = [this.params.name, this.params.surnm, this.params.age, this.params.studid] ;
            const sSql = "UPDATE \"" + entity + "\" SET \"NAME\" = ? , \"SURNM\" = ?, \"AGE\" = ? WHERE \"STUDID\" = ?";
            await db.executeUpdate(sSql, params);
            await Promise.all([db.executeUpdate(sSql, params),
                this._updateAddressByStudentId(),
                this._updateGradeBookByStudentId()
            ]);
        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async _updateAddressByStudentId() {
        try {
            if(this.params.toAddress === null) return;
            const db = this.db;
            const entity = "ADDRESS";
            const params = [this.params.toAddress.city,
                            this.params.toAddress.strt,
                            this.params.toAddress.hnum,
                            this.params.toAddress.adid ];
            const sSql = "UPDATE \"" + entity + "\" SET \"CITY\" = ?, \"STRT\" = ?, \"HNUM\" = ? WHERE \"ADID\" = ?";
            await db.executeUpdate(sSql, params);
        } catch(error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async _updateGradeBookByStudentId(){
        try {
            if(this.params.toGradeBook === null) return;
            const db = this.db;
            const entity = "GRADEBOOK";
            const params = [
                            this.params.toGradeBook.stdate,
                            this.params.toGradeBook.course,
                            this.params.toGradeBook.grdid
                            ];
            const sSql = "UPDATE \"" + entity + "\" SET \"STDATE\" = ?, \"COURSE\" = ? WHERE \"GRDID\" = ?";

            await db.executeUpdate(sSql, params);
        } catch(error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async deleteStudent(){
        try {
            const db = this.db;
            const entity = this.entity;
            const params = this.params;
            const sSql = "DELETE FROM \"" + entity + "\" WHERE \"STUDID\" = ?";

            await Promise.all([db.executeUpdate(sSql, params),
                this._deleteAddressByStudentId(),
                this._deleteGradeBookByStudentId()
            ]);

        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async _deleteAddressByStudentId(){
        try {
            const db = this.db;
            const entity = "ADDRESS";
            const params = this.params;
            const sSql = "DELETE FROM \"" + entity + "\" WHERE \"STUDID\" = ?";

            await db.executeUpdate(sSql, params);
        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }

    async _deleteGradeBookByStudentId(){
        try {
            const db = this.db;
            const entity = "GRADEBOOK";
            const params = this.params;
            const sSql = "DELETE FROM \"" + entity + "\" WHERE \"STUDID\" = ?";

            await db.executeUpdate(sSql, params);
        } catch (error) {
            throw new Error("DataBase " + entity + " error");
        }
    }
};