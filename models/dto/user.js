

class User {

    constructor({id, name, login, role, password}) {
        this.id = id
        this.name = name
        this.role = role
        this.login = login
        this.password = password
    }
}

module.exports = User
