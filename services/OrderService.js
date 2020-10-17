class Order {
    constructor({UserModel, ProductModel, ItemModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ItemModel = ItemModel
        this.io = io
    }

    async change(data){
        if (data.action === "DELETE") {
            global.Orders = global.Orders.filter(order => order.id !== data.id);
        } else {
            if(data.action === "PAYED"){
                data.timeStart = new Date().getTime()
            }
            if(data.action === "READY"){
                data.timeReady = new Date().getTime()
            }

            const order = global.Orders.find(order => order.id === data.id);
            if (!order) {
                global.Orders.push(data);
                return global.Orders
            }
            global.Orders = global.Orders.map(order => {
                if (order.id === data.id) return data;
                return order;
            });
        }

        return Orders
    }
}
module.exports = Order