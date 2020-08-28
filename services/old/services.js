const axios = require("axios")
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

const exp = {
    sendStatus: async function(msg) {
        //accepted, production, cooked, sent, done, canceled(отменен)
        const {order_id, status} = msg
        let axConf = {
            method: "get",
            baseURL: `https://delivery.rb24.ru/common_api/set_order_status/${order_id}/${status}`,
            params: {
                "apikey": "ZmFkMTlhNzQyMGRhMGI4N2NlOTQwZTI0MmQ3OTk1MTU3NjIwMmRkMA"

            }

        }
        let axConfS = {
            method: "get",
            baseURL: `https://delivery.rb24.ru/common_api/order/${order_id}`,
            params: {
                "apikey": "ZmFkMTlhNzQyMGRhMGI4N2NlOTQwZTI0MmQ3OTk1MTU3NjIwMmRkMA"

            }

        }

        const thisStatus = await axios(axConfS)
        if(thisStatus.data.status === 'done' || thisStatus.data.status === 'canceled' ){
            return false
        }


        return await axios(axConf)
            .then((response) => {
                return response.data.success
            })

    },
    sendInfoToLog: async function(msg) {
        //accepted, production, cooked, sent, done, canceled(отменен)
        const {rest, number, sum} = msg
        let axConf = {
            method: "get",
            baseURL: `http://localhost:7575/api/v1/saveData/${number}/${rest}/${sum}`,

        }
        return await axios(axConf)
            .then((response) => {
                return response.data.success
            })

    }
}
module.exports = exp