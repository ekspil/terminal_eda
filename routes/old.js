'use strict'

const mssql = require('../services/old/mssql');
const services = require('../services/old/services');
const grafFetch = require('../services/old/grafFetch');
let jsonCheck = {};
let jsonPosition = {};
let pizzulya = {
  pepper: {
    name: "",
    count: 0
  },
  classic: {
    name: "",
    count: 0
  },
  sirkur: {
    name: "",
    count: 0
  }
};



module.exports = async function(fastify, opts) {
  const io = fastify.io

  const sendPizzulya = function(data){
    io.emit('sendPizzulya', data);
  }

  const pizzulaCheck = function(data, oper){

    if (data.name.indexOf("Кусочек Класс") !== -1){
      if (oper == 1){
        pizzulya.classic.count = pizzulya.classic.count - 1
        sendPizzulya(pizzulya)
        return true}
      if (oper == 0){
        pizzulya.classic.count = pizzulya.classic.count + 1
        sendPizzulya(pizzulya)
        return true }
    }
    if (data.name.indexOf("Кусочек Сырной") !== -1){
      if (oper == 1){
        pizzulya.sirkur.count = pizzulya.sirkur.count - 1
        sendPizzulya(pizzulya)
        return true}
      if (oper == 0){
        pizzulya.sirkur.count = pizzulya.sirkur.count + 1
        sendPizzulya(pizzulya)
        return true }
    }
    if (data.name.indexOf("Кусочек Пепперони") !== -1){
      if (oper == 1){
        pizzulya.pepper.count = pizzulya.pepper.count - 1
        sendPizzulya(pizzulya)
        return true }
      if (oper == 0){
        pizzulya.pepper.count = pizzulya.pepper.count + 1
        sendPizzulya(pizzulya)
        return true }
    }
    return false

  }



  fastify.get('/newCheck', async function (req, reply) {
    jsonCheck[req.query.id] = {};
//logger.info("Name = "+req.query.name);
    jsonCheck[req.query.id].name = req.query.name;
//logger.info("jsonCheck[req.query.id].name = "+jsonCheck[req.query.id].name);
    jsonCheck[req.query.id].id = req.query.id;
    jsonCheck[req.query.id].ready = 0;
    jsonCheck[req.query.id].payed = 1;
    jsonCheck[req.query.id].checkType = req.query.checkType;
    jsonCheck[req.query.id].checkSum = req.query.checkSum;
    jsonCheck[req.query.id].checkNum = req.query.checkNum;
    jsonCheck[req.query.id].checkTime = Math.round(new Date().getTime()/1000);
    req.query.checkTime = jsonCheck[req.query.id].checkTime;
    if(req.query.code){
      jsonCheck[req.query.id].code = req.query.code;
    }else {
      jsonCheck[req.query.id].code = "";
    }
    if(req.query.guestName){
      jsonCheck[req.query.id].guestName = req.query.guestName;
    }else{
      jsonCheck[req.query.id].guestName = ""
    }
    jsonCheck[req.query.id].flag = req.query.flag;
    io.emit('checkAdd', req.query);


    return "ok"
  })
  fastify.get('/delCheck', async function (req, reply) {
    delete jsonCheck[req.query.id];
    io.emit('checkDel', req.query);

    return 'ok'
  })
  fastify.get('/new', async function (req, reply) {
    pizzulaCheck(req.query, 1)
    jsonPosition[req.query.id] = {};
    jsonPosition[req.query.id].name = req.query.name;
    jsonPosition[req.query.id].id = req.query.id;
    jsonPosition[req.query.id].unit = req.query.unit;
    jsonPosition[req.query.id].station = req.query.station;
    jsonPosition[req.query.id].checkType = req.query.checkType;
    jsonPosition[req.query.id].flag = req.query.flag;

    io.emit('test', req.query);

    return 'ok'
  })
  fastify.get('/del', async function (req, reply) {
    if(jsonPosition[req.query.id]){
      pizzulaCheck(jsonPosition[req.query.id], 0)
    }
    delete jsonPosition[req.query.id];
    io.emit('delete', req.query);
    return 'ok'
  })
  fastify.post('/fullCheck', async function (req, reply) {

    io.emit('fullCheck', req.body);
    return 'ok'
  })

  fastify.get('/take_out', async function (req, reply) {
    io.emit('takeOut', {order: req.query.order, comment: req.query.comment});
    jsonCheck[req.query.order].takeOut = 1
    for (let key in jsonPosition) {
      if(jsonPosition[key].unit != req.query.order) continue
      jsonPosition[key].takeOut = 1
      jsonPosition[key].text = req.query.comment
    }
    return 'ok'
  })
  fastify.post('/deleteFullCheck', async function (req, reply) {
    delete jsonCheck[req.body.id];
    io.emit('checkDel', req.body);
    return 'ok'
  })



  //// OLD IO PROPS


  io.on('connection', async function(socket){




    socket.on('hello', (nameStation, fn) => {
      if (nameStation == "guests"){
        fn(jsonCheck);
      }
      else if (nameStation == "kitchen" ){
        fn(jsonPosition);
      }
      else if (nameStation == "pizzulya" ){
        fn(pizzulya);
      }

    });

    socket.on('timer', function(timemsg){
      mssql.register(timemsg);
    })

    socket.on('newPizzulya', function(msg){
      pizzulya = msg
    });

    socket.on('deliveryStatus', async function(msg, fn){

      let result = await services.sendStatus(msg)
      fn(result)

    });
    socket.on('getFullChecks', async function(msg, fn){

      let result = await grafFetch.getActiveSales(msg)
      fn(result)

    });
    socket.on('changeSaleStatus', async function(msg, fn){

      let result = await grafFetch.changeSaleStatus(msg)
      fn(result)

    });

    socket.on('checkEnd_s', function(msg){
      delete jsonCheck[msg.id];
      socket.broadcast.emit('checkEnd', msg);
    });

    socket.on('deleteOrder_allVersion', function(msg){
      if(jsonCheck[msg.id]) delete jsonCheck[msg.id];

      for(let key in jsonPosition){
        if(jsonPosition[key].unit == msg.id){
          socket.broadcast.emit('delete', jsonPosition[key]);
          delete jsonPosition[key]
        }

      }

      socket.broadcast.emit('checkEnd', msg);
      socket.broadcast.emit('checkDel', msg);
    });

    socket.on('checkToReady_s', function(msg){
      if(msg.checkTime && msg.checkType != '3'){
        let date = new Date()
        let time = Math.round(date.getTime()/1000);
        msg.timerValue = Number(time) - Number(msg.checkTime)
        msg.dateYear = date.getFullYear()
        msg.dateMonth = date.getMonth()
        msg.dateDay = date.getDate()
        msg.dateTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        mssql.register(msg)
      }





      if(jsonCheck[msg.id]){
        jsonCheck[msg.id].readyTime = msg.readyTime;
        jsonCheck[msg.id].ready =1;
        msg.checkType = jsonCheck[msg.id].checkType;
        msg.guestName = jsonCheck[msg.id].guestName;
      }

      socket.broadcast.emit('checkToReady', msg);
    });

  });





}
