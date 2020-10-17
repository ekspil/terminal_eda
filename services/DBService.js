class DB {
    constructor({UserModel, ProductModel, ItemModel, ProductGroupModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ProductGroupModel = ProductGroupModel
        this.ItemModel = ItemModel
        this.io = io
    }

    async getAllUsers(){
        const users = await this.UserModel.findAll({
            order: [['id', 'DESC']]
        })
        return users
    }

    async getAllItems(){
        const users = await this.ItemModel.findAll({
            order: [['id', 'DESC']]
        })
        return users
    }

    async getAllGroups(){
        const users = await this.ProductGroupModel.findAll({
            order: [['id', 'DESC']]
        })
        return users
    }

    async getAllProducts(){
        const users = await this.ProductModel.findAll({
            order: [['id', 'DESC']]
        })
        return users
    }

    async saveProduct(data){
        if(!data.id){
            const product = await this.ProductModel.create(data)
            return product
        }
        else {
            const product = await this.ProductModel.findOne({
                where: {
                    id: data.id
                }
            })
            product.name = data.name
            product.station = data.station
            product.items = data.items
            return await product.save()
        }
    }

    async saveItem(data){
        if(!data.id){
            const item = await this.ItemModel.create(data)
            return item
        }
        else {
            const item = await this.ItemModel.findOne({
                where: {
                    id: data.id
                }
            })
            item.name = data.name
            item.station = data.station
            item.minCount = data.minCount
            item.liveTime = data.liveTime
            return await item.save()
        }
    }

    async saveUser(data){
        if(!data.id){
            const user = await this.UserModel.create(data)
            return user
        }
        else {
            const user = await this.UserModel.findOne({
                where: {
                    id: data.id
                }
            })
            user.name = data.name
            user.password = data.password
            user.login = data.login
            user.role = data.role
            return await user.save()
        }
    }

    async auth(data){
        const {login, password} = data
        const user = await this.UserModel.findOne({
            where: {
                login,
                password
            }
        })
        return user
    }
}
module.exports = DB