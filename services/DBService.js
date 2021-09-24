class DB {
    constructor({UserModel, ProductModel, ItemModel, ProductGroupModel, SmenaModel, ProductModModel, CornerModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ProductGroupModel = ProductGroupModel
        this.ItemModel = ItemModel
        this.SmenaModel = SmenaModel
        this.ProductModModel = ProductModModel
        this.CornerModel = CornerModel
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

        return users.map(item => {
            if(!item.mods) item.mods = []
            return item
        })
    }

    async getAllMods(){
        const mods = await this.ProductModModel.findAll({
            order: [['id', 'DESC']]
        })
        return mods
    }

    async getAllCorners(){
        const corners = await this.CornerModel.findAll({
            order: [['id', 'DESC']]
        })
        return corners
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
            if(data.action === "DELETE"){
                return await product.destroy()
            }
            product.name = data.name
            product.station = data.station
            product.items = data.items
            product.code = data.code
            product.price = data.price
            product.corner = data.corner
            product.mods = data.mods
            product.group_id = data.group_id
            return await product.save()
        }
    }
    async saveGroup(data){
        if(!data.id){
            const group = await this.ProductGroupModel.create(data)
            return group
        }
        else {
            const group = await this.ProductGroupModel.findOne({
                where: {
                    id: data.id
                }
            })
            if(data.action === "DELETE"){
                return await group.destroy()
            }
            group.name = data.name
            return await group.save()
        }
    }
    async saveCorner(data){
        if(!data.id){
            const corner = await this.CornerModel.create(data)
            return corner
        }
        else {
            const corner = await this.CornerModel.findOne({
                where: {
                    id: data.id
                }
            })
            if(data.action === "DELETE"){
                return await corner.destroy()
            }
            corner.name = data.name
            return await corner.save()
        }
    }

    async saveItem(data){
        if(!data.id){
            const item = await this.ItemModel.create(data)
            global.Items.push(items)
            return item
        }
        else {
            const item = await this.ItemModel.findOne({
                where: {
                    id: data.id
                }
            })
            if(data.action === "DELETE"){
                global.Items = global.Items.filter(item => item.id !== data.id)
                return await item.destroy()
            }

            item.name = data.name
            item.station = data.station
            item.minCount = data.minCount
            item.liveTime = data.liveTime
            global.Items = global.Items.map(it => {
                if (it.id !== data.id) return it
                it.name = data.name
                it.station = data.station
                it.minCount = data.minCount
                it.liveTime = data.liveTime

                return it
            })
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

            if(data.action === "DELETE"){
                return await user.destroy()
            }
            user.name = data.name
            user.password = data.password
            user.login = data.login
            user.role = data.role
            return await user.save()
        }
    }
    async saveMod(data){
        if(!data.id){
            const mod = await this.ProductModModel.create(data)
            return mod
        }
        else {
            const mod = await this.ProductModModel.findOne({
                where: {
                    id: data.id
                }
            })

            if(data.action === "DELETE"){
                return await mod.destroy()
            }
            mod.name = data.name
            mod.items = data.items
            mod.price = data.price
            return await mod.save()
        }
    }

    async saveSmena(data){
        const newSmena = {
            plan: Number(data.plan),
            amount: 0,
            count: 0,
            pin: data.pin,
            manager: Number(data.manager)
        }
        await this.SmenaModel.create(newSmena)
        return true
    }

    async getLastSmena(){
        const smena = await this.SmenaModel.findOne({
            order: [
                ["id", "DESC"],
            ]
        })
        return smena
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