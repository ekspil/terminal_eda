class Order {
    constructor({UserModel, ProductModel, ItemModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ItemModel = ItemModel
        this.io = io
    }

    async change(request, reply){
        console.log(request.body)
        this.io.emit("fullCheck", request.body)
        reply.status(200)
        return "ok"
    }
}
module.exports = Order