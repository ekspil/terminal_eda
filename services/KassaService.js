const ItemDTO = require("../models/dto/item")
const fetch = require("node-fetch")

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

    async setStatus({orderId, status}, orderService){
        const route = (orderId.split("-"))[1]
        const order = await this.OrderModel.findOne({
            where: {
                route
            },
            order:[
                ["id", "DESC"]
            ]
        })
        if(!order) return {ok: false, error: "Order not found"}
        order.status = status
        await order.save()
        const orderGlobal = global.Orders.find(order => order.id === orderId);
        if(!orderGlobal) return false
        if(status === "PAYED"){
            orderGlobal.payed = 1
            orderGlobal.timeStart = new Date().getTime()
            await orderService.checkItems(orderGlobal)

        }
        return true
    }

    async newOrder(type){
        if(!type) type = "IN"
        const order = await this.OrderModel.create()
        order.route = Number(String(order.id).slice(-3, 999))

        const newOrder = {
            id: "T-"+order.route,
            die: 0,
            alarm: 0,
            action: "NEW",
            payed: 0,
            ready: 0,
            takeOut: 0,
            type: type || "IN",
            source: "KASSA",
            flag: "",
            amount: 0,
            guestName: "",
            extId: "",
            text: "",
            pin: "",
            cornerReady: [],
            hidden: [],
            positions: []
        }
        global.Orders.push(newOrder)

        order.type = type || "IN"
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
        if(!order) throw new Error("Order not found")
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
            const orderGlobal = global.Orders.find(order => order.id === "T-"+ data.route);
            orderGlobal.status = data.status
            orderGlobal.type = data.type
            orderGlobal.positions = data.items.map(p => {
                if(!p.code) return p
                const pos = global.Products.find(item => item.code === p.code)
                if(pos) {
                    p.name = pos.name
                    p.corner = pos.corner
                    const c = orderGlobal.cornerReady.find(i => i.corner === pos.corner)
                    if(!c) orderGlobal.cornerReady.push({ corner: pos.corner, status: "NOTREADY" })

                }
                return p
            })

            return order.save({transaction})

        })

    }

}
module.exports = Order