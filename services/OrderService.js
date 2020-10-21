const ItemDTO = require("../models/dto/item")

class Order {
    constructor({UserModel, ProductModel, ItemModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ItemModel = ItemModel
        this.io = io
        this.checkItems = this.checkItems.bind(this)
    }

    async change(data){
        if (data.action === "DELETE") {
            global.Orders = global.Orders.filter(order => order.id !== data.id);
        } else {



            if(data.action === "PAYED"){
                data.timeStart = new Date().getTime()
                await this.checkItems(data)
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
    async checkItems(data){
        if(data && data.positions){
            for(let position of data.positions){
                if(!position.code) continue
                const product = await this.ProductModel.findOne({
                    where: {
                        code: position.code
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
}
module.exports = Order