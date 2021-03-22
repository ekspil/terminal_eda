const ItemDTO = require("../models/dto/item")

class Order {
    constructor({UserModel, ProductModel, ItemModel, OrderModel, OrderItemsModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ItemModel = ItemModel
        this.OrderModel = OrderModel
        this.OrderItemsModel = OrderItemsModel
        this.io = io
        this.newOrder = this.newOrder.bind(this)
    }

    async newOrder(){
        const order = await this.OrderModel.create({})
        order.route = Number(String(order.id).slice(-3, 999))
        return await order.save()

    }

    async getOrder(route){
        const order = await this.OrderModel.findOne({
            where: {
                route: route
            },
            order:[
                ["id", "DESC"]
            ]
        })
        const items = await order.getItems()
        order.items = items || []
        return {
            id: order.id,
            route: order.route,
            status: order.status,
            type: order.type,
            items: items || [],
            createdAt: order.createdAt
        }

    }

    async update(data, route){
        return this.OrderModel.sequelize.transaction(async (transaction) => {
            const order = await this.OrderModel.findOne({
                where: {
                    route: route
                },
                order:[
                    ["id", "DESC"]
                ],
                transaction
            })
            if(!order) return {ok: false, error: "Order not found"}
            await this.OrderItemsModel.destroy({
                where: {
                    order_id: order.id
                },
                transaction
            })
            const itemsDTO = data.items.map(item => {
                item.order_id = order.id
                delete item.id
                return item
            })

            await this.OrderItemsModel.bulkCreate(itemsDTO, {transaction})
            order.type = data.type
            order.status = data.status

            return order.save({transaction})

        })

    }

}
module.exports = Order