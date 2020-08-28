const sql = require('mssql');
const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DB,
    options: {
        encrypt: false
    }
}
// Create connection to database
let errorMsg = []
const pool = new sql.ConnectionPool(config);

setInterval(registerErr, 30000)


async function register(timemsg) {
      try {

          await pool.connect()
          await pool.request()
              .input('restoran', sql.Int, Number(timemsg.restoran))  //timemsg.checkNumber = element.unit;
              .query("INSERT INTO eotimers.dbo.timers (restoran, rbdateYear, rbdateMonth, rbdateDay, rbdatehhmmss, rbtimerValue, checkNumber, checkNum) VALUES (@restoran, "+timemsg.dateYear+", "+timemsg.dateMonth+", "+timemsg.dateDay+", '"+timemsg.dateTime+"', "+timemsg.timerValue+", '"+timemsg.checkNumber+"', '"+timemsg.checkNum+"');")
          await pool.close()

      }
      catch (err) {
        const date = new Date()
        pool.close()
        console.log("Ошибка-SQL-request " + date + " Данные будут переданы позже")
        console.log(err)
        errorMsg.push(timemsg)

      }

}

async function registerErr() {
    if(errorMsg.length > 0){
        try {

            await pool.connect()
            while (errorMsg.length > 0) {
                let msg = errorMsg.pop()
                await pool.request()
                    .input('restoran', sql.Int, msg.restoran)  //timemsg.checkNumber = element.unit;
                    .query("INSERT INTO eotimers.dbo.timers (restoran, rbdateYear, rbdateMonth, rbdateDay, rbdatehhmmss, rbtimerValue, checkNumber, checkNum) VALUES (@restoran, "+msg.dateYear+", "+msg.dateMonth+", "+msg.dateDay+", '"+msg.dateTime+"', "+msg.timerValue+", '"+msg.checkNumber+"', '"+msg.checkNum+"');")


            }

            await pool.close()
            console.log("Все сохраненные данные переданы!")
        }
        catch (err) {
            const date = new Date()
            console.log("Попытка передать отложенные данные неудачна: " + date)
            console.log(err)


        }
    }


}


sql.on('error', err => {
    const date = new Date()
    console.log("Ошибка-SQL" + date)
    console.log(err)

})


exports.register = register;
