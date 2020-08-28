const fetch = require("node-fetch")

async function getActiveSales(restoran) {
    const query = `{getActiveSales(restoran: ${restoran}){
  id
  price
  text
  extId
  items{
    id
    code
    count
    name
    price
    station
  }
  restoran
  status
  payType
  source
  type
  pin
  createdAt
}}`
    const body = JSON.stringify({query})
    try{
        const response = await fetch(`http://192.168.15.26:4001`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": "Bearer 5ddbd9e9c4a390bbcf68d0824c515b6f"
            },
            body
        })

        switch (response.status) {
            case 200:
                const json = await response.json()

                return json.data.getActiveSales
            default:
                throw new Error("No connection")
        }
    }
    catch(err){
        console.log(err)
        throw new Error("No connection")
    }


}

async function changeSaleStatus(input) {
    const {status, id} = input
    const variables = {
        input:{
            id,
            status
        }
    }
    const query = `mutation($input: ChangeSaleStatusInput!) {
  changeSaleStatus(input: $input) {
    id
    status
  }
}`
    const body = JSON.stringify({query, variables})
    try{
        const response = await fetch(`http://192.168.15.26:4001`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": "Bearer 5ddbd9e9c4a390bbcf68d0824c515b6f"
            },
            body
        })

        switch (response.status) {
            case 200:
                const json = await response.json()
                return json.data.changeSaleStatus
            default:
                throw new Error("No connection")
        }
    }
    catch(err){
        console.log(err)
        throw new Error("No connection")
    }


}



module.exports = {
    getActiveSales,
    changeSaleStatus
}