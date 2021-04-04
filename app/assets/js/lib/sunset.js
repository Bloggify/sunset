const SolarCalc = require("sundown")
module.exports = (d, lat, lon) => {
    return SolarCalc(d, +lat, +lon).sunset.time
}
