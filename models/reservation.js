/** Reservation for Lunchly */

const moment = require("moment");
const db = require("../db");
const Customer = require("./customer")


/** A reservation for a party */

class Reservation {
    constructor({ id, customerId, numGuests, startAt, notes }) {
        this.id = id;
        this.customerId = customerId;
        this.numGuests = numGuests;
        this.startAt = startAt;
        this.notes = notes;
    }

    /** formatter for startAt */
    getformattedStartAt() {
        return moment(this.startAt).format('MMMM Do YYYY, h:mm a'); //sample 2022-02-22 02:33 am
    }

    /** given a customer id, find their reservations. */
    static async getReservationsForCustomer(customerId) {
        const results = await db.query(
            `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`, [customerId]
        );

        return results.rows.map(row => new Reservation(row));
    }

    async save() {
        console.log(this)
            // if reservation not created
        if (this.id === undefined) {
            // add a new reservation
            const result = await db.query(`
            INSERT INTO reservations (start_at, num_guests, notes, customer_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id`, [this.startAt, this.numGuests, this.notes, this.customerId]);
            this.id = result.rows[0].id
        } else {
            // update the existing reservation
            await db.query(
                ` UPDATE reservations SET start_at=$1, num_guests=$2, notes=$3
                WHERE id=$4`, [this.startAt, this.numGuests, this.notes, this.id]
            )
        }
    }
}

module.exports = Reservation;