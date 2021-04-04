const Daty = require("daty")
    , SunsetForLocations = require("./sunset-for-locations")
    , qs = require("qs")
    , Months = require("./i18n-months")

module.exports = {
    parseQs () {
        const data = Object.assign({
              l: []
            , quarter: null
            , year: new Date().getFullYear()
            , hl: "en"
          }, qs.parse(location.search.slice(1))
        );

        if (data.l) {
            data.l = data.locations = data.l.map(c => {
                let [loc, label] = c.split("|")
                loc = loc.split(",").map(Number)
                return {
                    label,
                    loc
                }
            })
            data.year = +data.year
        }
        if (data.date) {
            data.date = new Daty(data.date)
        }
        return data
    }
  , indentNumber (num) {
        let ret = ""
        if (num < 10) {
            ret += "&nbsp;&nbsp;"
        }
        ret += "&nbsp;&nbsp;&nbsp;&nbsp;"
        ret += num
        return ret
    }
  , getSunsetTimesOnFridays (data) {

        const firstQuarterMonth = (data.quarter - 1) * 3
        let nextQuarterMonth = (firstQuarterMonth + 3) % 12
        let friday = new Daty(data.year, firstQuarterMonth, 1);
        let lastMonth = null

        // Sun Mon ... Fri Sat
        // 0   1       5   6
        let daysTillNextFriday = 5 - friday.getDay()
        if (daysTillNextFriday < 0) {
            daysTillNextFriday = 6
        }

        if (daysTillNextFriday !== 0) {
            friday.add(daysTillNextFriday, "days")
        }

        const ret = []
        ret.push("<p>Apusul soarelui *) pentru diferite zone ale țării:</p>")


        const rawResult = []
        do {
            const newMonth = friday.getMonth()
            if (lastMonth !== newMonth) {
                if (typeof lastMonth === "number") {
                    //ret.push(`</ol>`)
                    ret.push(`</div>`)
                }
                lastMonth = newMonth
                ret.push(`<strong class="month-name">${Months[data.hl][newMonth]}</strong>`)
                ret.push(`<div class="table">`)
            }
            const locData = new SunsetForLocations(friday, data.locations)
            rawResult.push(locData)
            ret.push(locData.html())
            friday.add(1, "week")
        } while (friday.getMonth() !== nextQuarterMonth)

        ret.push(`</div>`)
        ret.push("<br><p>*) Apusul de soare a fost indicat folosind site-ul: sunset.bloggify.org</p>")

        return {
            txtHTML () {
                return ret.join("")
            },
            pdf () {
                throw new Error("Not implemented.")
            },
            tableHTML () {
                return ret.join("")
            }
        }
    }
}
