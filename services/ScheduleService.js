
class ScheduleService {
    constructor({UserModel, ProductModel, ItemModel, ProductGroupModel, SmenaModel, StatModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ItemModel = ItemModel
        this.io = io
    }

    async checkItemsK() {

    }

    async checkItemsDie(){
        let now = new Date().getTime()
        global.Items = global.Items.map(it => {
          it.lot = it.lot.map(l => {
              if(!l.time) return l
              if((now - l.time) > it.liveTime * 1000 * 60){
                  l.die = true
              }

              return l
          })
          it.lot = it.lot.filter(l => {

            if(l.use >= l.count){
              if(l.ready) return false
            }
            return true
          })
          return it
      })
        this.io.emit('fullItems', global.Items)
    }

    async checkNeedItems(){
        global.Items = global.Items.map(item => {
          const now = item.lot.reduce((acc, l) => {
            if(l.die) return acc
            acc.count = acc.count + l.count
            acc.use = acc.use + l.use
            return acc
          }, {count: 0, use: 0})
          const need = global.K * item.minCount
          const min = global.K * Number((item.minCount/3).toFixed(0))
          const ready = now.count - now.use

          if(ready <= min){
            let toReady = need - ready
            if(toReady < item.minCount) toReady = item.minCount
            item.lot.push(
            {
              count: toReady,
              time: null,
              die: false,
              use: 0,
              ready: false,
            })
          }

          return item
      })
        this.io.emit('fullItems', global.Items)
    }

}
module.exports = ScheduleService