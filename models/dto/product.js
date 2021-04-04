

class Product {

    constructor({id, code, name, corner, items, station, price, group_id, mods}) {
        this.id = id
        this.code = code
        this.corner = corner
        this.name = name
        this.station = station
        this.price = price
        this.items = items
        this.mods = mods
        this.group_id = group_id
    }
}

module.exports = Product
