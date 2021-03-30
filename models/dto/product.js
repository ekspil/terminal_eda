

class Product {

    constructor({id, code, name, corner, items, station, price, group_id}) {
        this.id = id
        this.code = code
        this.corner = corner
        this.name = name
        this.station = station
        this.price = price
        this.items = items
        this.group_id = group_id
    }
}

module.exports = Product
