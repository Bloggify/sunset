const sunsetCalc = require("./sunset")
    , { indentNumber } = require("./util")

class SunsetForLocations {
    constructor (d, locations) {
        this.locations = locations
        this.date = d
    }
    toObject () {
        let con = this.locations.map(c => {
            return ({
                sunset: sunsetCalc(this.date, c.loc[0], c.loc[1])
              , label: c.label
            })
        })
        return con
    }
    html () {
        return `<div class="table-row">
            ${indentNumber(this.date.getDate())}. ` + this.toObject().map(c =>
            `${c.label}: ${c.sunset}`
        ).join("; ") + "</div>"
    }
}

module.exports = SunsetForLocations
