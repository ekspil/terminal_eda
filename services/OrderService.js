const ItemDTO = require("../models/dto/item")

class Order {
    constructor({UserModel, ProductModel, ItemModel, TimerModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ItemModel = ItemModel
        this.TimerModel = TimerModel
        this.io = io
        this.checkItems = this.checkItems.bind(this)
        this.change = this.change.bind(this)
        this.superdostavka = this.superdostavka.bind(this)
        this.checkDone = this.checkDone.bind(this)
    }

    changeHidden(data){
        const {orderId, station, corner, status} = data
        global.Orders = global.Orders.map(order =>{
            if(order.id !== orderId) return order
            if(corner && status){
                order.cornerReady = order.cornerReady.map(st => {
                    if(st.corner !== corner) return st
                    st.status = status
                    if(status === "READY" && !st.readyTime){
                        st.readyTime = new Date().getTime()
                        this.TimerModel.create({
                            corner: st.corner,
                            start: order.timeStart,
                            end: st.readyTime,
                            orderId: order.id
                        })

                    }
                    return st
                })
            }
            if(station){
                order.hidden.push(station)
            }

            return order

        })

        return global.Orders

    }

    checkDone(orderId, corner){
        const order = global.Orders.find(order => order.id === orderId)
        if(!order) throw new Error("No such order")

        for (let i of order.cornerReady){
            if(corner === i.corner) i.status = "DONE"
            if (i.status !== "DONE") return false

        }
        global.Orders = global.Orders.filter(order => order.id !== orderId)

        return true

    }

    async change(data, flag){

        if(flag === "superdostavka"){
            data = this.superdostavka(data, {action: "PAYED"})
        }
        if(flag === "superdostavka_upd"){
            data = this.superdostavka(data, {action: "UPDATE"})
        }

        if(!data.cornerReady){
            data.cornerReady = []
        }

        if (data.action === "DELETE") {
            global.Orders = global.Orders.filter(order => order.id !== data.id);
        } else {
            data.positions = data.positions.map(p => {
                if(!p.code) return p
                const pos = global.Products.find(item => item.code === p.code)
                if(pos) {
                    p.name = pos.name
                    p.corner = pos.corner
                    const c = data.cornerReady.find(i => i.corner === pos.corner)
                    if(!c) data.cornerReady.push({ corner: pos.corner, status: "NOTREADY" })


                }
                return p
            })



            if(data.action === "PAYED"){
                data.timeStart = new Date().getTime()
                await this.checkItems(data)
            }
            if(data.action === "READY"){
                data.timeReady = new Date().getTime()
            }
            if(!data.hidden){
                data.hidden = []
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
    async startItems(){
        let items = await this.ItemModel.findAll({})
        items = items.map((key) => {
            const item = new ItemDTO(key)
            item.lot = [
                {
                    count: item.minCount * global.K,
                    time: null,
                    use: 0,
                    die: false,
                    ready: false,
                }
            ]
            return item
        })
        global.Items = items

    }
    async setReadyItem(item){
        global.Items = global.Items.map(it => {
          if(it.id !== item.id) return it
          it.lot = it.lot.map(l => {
              l.ready = 1
              l.time = new Date().getTime()
              return l
          })
          return it
      })
        return  global.Items
    }
    async setDieItem(item){
        global.Items = global.Items.map(it => {
          if(it.id !== item.id) return it
          it.lot = it.lot.filter(l => !l.die)
          if (it.lot.length === 0){
              it.lot.push({
                  count: item.minCount,
                  time: null,
                  die: false,
                  use: 0,
                  ready: false,
              })
          }
          return it
      })
        return  global.Items
    }
    setOrderScreen(item){
        global.Orders = global.Orders.map(it => {
          if(it.id !== item.id) return it
          it.screen = item.screen
          return it
      })

    }
    async checkItems(data){
        if(data && data.positions){
            for(let position of data.positions){
                if(!position.code) continue
                const product = await this.ProductModel.findOne({
                    where: {
                        code: String(position.code)
                    }
                })

                if(!product || !product.items || product.items.length === 0) continue

                let items = await this.ItemModel.findAll({
                    where: {
                        id: product.items
                    }
                })
                for(let item of items){
                    let plus = position.count
                    global.Items = global.Items.map(it => {
                        if(it.id !== item.id) return it
                        it.lot = it.lot.map(i=>{
                            if(i.die) return i
                            if(i.use >= i.count) return i
                            while (plus > 0){
                                i.use++
                                plus--
                                if(i.use === i.count) break
                            }
                            return i
                        })
                        if(plus > 0){
                            it.lot.push({
                                count: it.minCount * global.K + plus,
                                time: null,
                                die: false,
                                use: plus,
                                ready: false,
                            })
                        }
                        return it

                    })

                }

            }

        }
    }

    superdostavka(data, opts){
        const order = {
            id: "SD-"+String(data.id).substr(-5),
            die: 0,
            alarm: 0,
            action: opts.action,
            payed: 1,
            ready: 0,
            takeOut: 1,
            type: "DELIVERY",
            source: data.source,
            flag: "",
            amount: data.sum,
            guestName: data.client_name,
            extId: "",
            text: data.comment,
            pin: data.code,
            positions: []
        }

        for (let item of data.positions){

            if(item.bill_info && item.bill_info.trim()){
                const info = item.bill_info.split('/')
                for(let i of info){
                    if(!i) continue
                    i = i.split(",")
                    i = i.map(el=> el.trim())
                    const poss = {
                        id: i[3],
                        name: i[0],
                        price: i[4] || (item.price / i.length),
                        count: (Number(i[1]) * item.quantity),
                        code: i[3],
                        station: Number(i[2]),
                        mods: []

                    }
                    order.positions.push(poss)

                }
            }
             else{
                const poss = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    count: item.quantity,
                    code: item.id,
                    station: 1,
                    mods: []

                }
                order.positions.push(poss)
            }


        }


        if(data.source === "mobile_app"){
            if(data.is_pickup_app && data.pickup_takeaway){
                order.type = "APP_OUT"
                order.takeOut = 1
            }
            if(data.is_pickup_app && !data.pickup_takeaway){
                order.type = "APP_IN"
                order.takeOut = 0
            }

        }
        if(data.source === "site"){
            if(data.is_pickup && data.pickup_takeaway){
                order.type = "APP_OUT"
                order.takeOut = 1
            }
            if(data.is_pickup && !data.pickup_takeaway){
                order.type = "APP_IN"
                order.takeOut = 0
            }

        }
        if(data.source === "phone"){
            if(data.is_pickup && data.pickup_takeaway){
                order.type = "APP_OUT"
                order.takeOut = 1
            }
            if(data.is_pickup && !data.pickup_takeaway){
                order.type = "APP_IN"
                order.takeOut = 0
            }

        }


        return order
    }
}
module.exports = Order