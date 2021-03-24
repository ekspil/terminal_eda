

class Product {

    constructor({id, code, name, corner, items, station, group_id}) {
        this.id = id
        this.code = code
        this.corner = corner
        this.name = name
        this.station = station
        this.items = items
        this.group_id = group_id
    }
}

module.exports = Product
