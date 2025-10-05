const qs = require("qs")
    , Daty = require("daty")
    , sunsetCalc = require("./sunset")
    , Clipboard = require("clipboard")
    , stripTags = require("striptags")

const Months = {
    ro: [
        "Ianuarie",
        "Februarie",
        "Martie",
        "Aprilie",
        "Mai",
        "Iunie",
        "Iulie",
        "August",
        "Septembrie",
        "Octombrie",
        "Noiembrie",
        "Decembrie"
    ],
    en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
}

const indentNumber = num => {
    let ret = ""
    if (num < 10) {
        ret += "&nbsp;&nbsp;"
    }
    ret += "&nbsp;&nbsp;&nbsp;&nbsp;"
    ret += num
    return ret
}

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

const parseQs = () => {
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

const getSunsetTimesOnFridays = data => {
    let firstQuarterMonth = (data.quarter - 1) * 3
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
        ret.push(new SunsetForLocations(friday, data.locations).html())
        friday.add(1, "week")
    } while (friday.getMonth() !== nextQuarterMonth)
    ret.push(`</div>`)
    ret.push("<br><p>*) Apusul de soare a fost indicat folosind site-ul: sunset.bloggify.org</p>")
    return ret.join("")
}


// New Function to validate latitude and longitude
const validateCoordinates = (lat, lon) => {
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        return { valid: false, message: "Latitude must be between -90 and 90" }
    }
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        return { valid: false, message: "Longitude must be between -180 and 180" }
    }
    return { valid: true }
}

const init = () => {
    const data = parseQs()
    if (data.quarter) {
        return getSunsetTimesOnFridays(data)
    }
    if (data.lat) {
        // Validation before processing
        const validation = validateCoordinates(data.lat, data.lon)
        if (!validation.valid) {
            return `<div class="text-center result-for-city">
                <h3>Invalid Coordinates</h3>
                <p class="error-message" style="color: red;">${validation.message}</p>
                <button onclick="window.location.href = window.location.pathname" class="btn btn-primary">Try Again</button>
            </div>`
        }

        data.label = stripTags(data.label)
        return `<div class="text-center result-for-city">
            <h3>${data.label}, ${data.date.format("LL")}</h3>
            <h1>${sunsetCalc(data.date, data.lat, data.lon)}</h1>
        </div>`
    }
    setTimeout(() => {
        document.querySelector(".copy-btn").remove()
        document.querySelector("#result").removeAttribute("contenteditable")
        fetch("https://ipinfo.io/json")
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch location')
                return res.json()
            })
            .then(res => {
                const loc = res.loc.split(",")
                document.querySelector("[name='lat']").value = loc[0]
                document.querySelector("[name='lon']").value = loc[1]
                document.querySelector("[name='label']").value = res.city
            })
            .catch(err => {
                console.warn('Could not auto-detect location:', err)
                // Fallback to default coordinates (Greenwich)
                document.querySelector("[name='lat']").value = "51.4778"
                document.querySelector("[name='lon']").value = "-0.0015"
                document.querySelector("[name='label']").value = "Greenwich"
            })
    }, 0);
    return `<div class="hack"><form>
        <h1>Sunset</h1>
        <fieldset class="form-group form-success">
            <label for="lat">Latitude</label>
            <input id="lat" name="lat" type="text" class="form-control" min="-90" max="90" step="any">
            <div class="help-block">City's latitude (-90 to 90).</div>
        </fieldset>
        <fieldset class="form-group form-success">
            <label for="lon">Longitude</label>
            <input id="lon" name="lon" type="text" class="form-control" min="-180" max="180" step="any">
            <div class="help-block">City's longitude (-180 to 180).</div>
        </fieldset>
        <fieldset class="form-group form-success">
            <label for="label">City Name</label>
            <input id="label" name="label" type="text" class="form-control" required>
            <div class="help-block">The city name or label you want to display.</div>
        </fieldset>
        <fieldset class="form-group form-success">
            <label for="date">Date</label>
            <input id="date" name="date" type="date" class="form-control" value="${new Daty().format("YYYY-MM-DD")}" required>
            <div class="help-block">The date you want the sunset time for. Default: <i>today</i>.</div>
        </fieldset>
        <fieldset class="form-group form-success">
            <button class="btn btn-primary" type="submit">Get sunset time</button>
        </fieldset>
    </form></div>`
}

result.innerHTML = init()

// Add form validation event listener
const form = document.querySelector('form')
if (form) {
    form.addEventListener('submit', (e) => {
        const lat = document.querySelector("[name='lat']").value
        const lon = document.querySelector("[name='lon']").value

        const validation = validateCoordinates(lat, lon)
        if (!validation.valid) {
            e.preventDefault()
            alert(validation.message)
            return false
        }
    })
}

const clip = new Clipboard(document.querySelector("[data-clipboard-target]"))
clip.on("success", e => {
    e.trigger.innerHTML = "Copied"
})