const ItemDTO = require("../models/dto/item")
const fetch = require("node-fetch")

class Order {
    constructor({UserModel, ProductModel, ItemModel, OrderModel, OrderItemsModel, io}) {
        this.UserModel = UserModel
        this.ProductModel = ProductModel
        this.ItemModel = ItemModel
        this.OrderModel = OrderModel
        this.OrderItemsModel = OrderItemsModel
        this.io = io
        this.newOrder = this.newOrder.bind(this)
        this.print = this.print.bind(this)
        this.guid = this.guid.bind(this)
        this.ExecuteCommand = this.ExecuteCommand.bind(this)
    }

    async ExecuteCommand(Data){
        return await fetch(`http://${process.env.KKM_SERVER}/Execute`, {
            method: 'post',
            body: JSON.stringify(Data) ,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Basic " + Buffer.from(process.env.KKM_USER + ":" + process.env.KKM_PASSWORD).toString('base64')  },
        })
    }

    async setStatus({orderId, status}, orderService){
        const route = (orderId.split("-"))[1]
        const order = await this.OrderModel.findOne({
            where: {
                route
            },
            order:[
                ["id", "DESC"]
            ]
        })
        if(!order) return {ok: false, error: "Order not found"}
        order.status = status
        await order.save()
        const orderGlobal = global.Orders.find(order => order.id === orderId);
        if(!orderGlobal) return false
        if(status === "PAYED"){
            orderGlobal.payed = 1
            orderGlobal.timeStart = new Date().getTime()
            await orderService.checkItems(orderGlobal)

        }
        return true
    }

    guid() {

        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    async print(order, printer){
        // Подготовка данных команды
        const Data = {
            Command: "PrintDocument",
            NumDevice: printer || 0,
            IsFiscalCheck: false,
            NotPrint: false,
            IdCommand: this.guid(),

            // Строки чека
            CheckStrings: [
                {
                    PrintImage: {
                        //Картинка в Base64. Картинка будет преобразована в 2-х цветное изображение- поэтому лучше посылать 2-х цветный bmp
                        Image: "Qk3+EwAAAAAAAD4AAAAoAAAA5AAAAJ4AAAABAAEAAAAAAMATAACHHQAAhx0AAAAAAAAAAAAAAAAAAP///wD/////////////////////////////////////8AAAAP/////////////////////////////////////wAAAA//////////////////////////////////////AAAAD/////////////////////////////////////8AAAAP/////////////////////////////////////wAAAA//////////////////////////////////////AAAAD/////////////////////////////////////8AAAAP////+f//////////+P///////////////////wAAAA/////5///////////4////////////////////AAAAD/////n///////////H///////////////////8AAAAP////+f//////////8f///////////////////wAAAA/////5///////////x////////////////////AAAAD/////j//////////+P///////////////////8AAAAP////+PwAj///////w////////////////////wAAAA/////48PgP///////H////////////////////AAAAD/////zH/B///////4f///////////////////8AAAAP/////J/8H///////j////////////////////wAAAA/////+P/4///////8P////////////////////AAAAD///gAx//z///////h////////////////////8AAAAP//4fgP//P//////+P////////////////////wAAAA///H/z//8B//////x///////gP////////////AAAAD//5/8f//gD/////+P//////4AH///////////8AAAAP//P/3//8/B/////x///////AAMf///////+A/wAAAA//8/////H+H////+H//////4/+AH///////AB/AAAAD//n////5/w/8f//yP//////n/w4P//////4fP8AAAAP/+////+f+D/8AH/8f/////8/+f+P/////+H8/wAAAA//7////z//P//g//x//////3/3/+f/////j/5/AAAAD//P///+//8//////H/////8f///8////wB//n8AAAAP/8////z//j/////8/////wB////5//+AH//8PwAAAA//z///+v/+f/P///D////wAH////z/8A////0fAAAAD//P///7//w/+AA/4f///8Aef////n+A////+R8AAAAP/9//////4ID+Tv/7////A/5//8//vA/////znwAAAA//3/P////H4f7Of/v///4//n//n//Q/////8efAAAAD//f+P///x/B/Mc/+f///H//P/+f/+P/////Dz8AAAAP/9/8f//+P4P9x7/5///5//8//wA/z////4A/PwAAAA//3/Mf//z/+/nD3/n///P//z//GAAf////P/8PAAAAD/+f/A//+f/7+evP/f//8///H/8f/x////9//g8AAAAP/5//A//y//Pz6ef8///n//+f/x//P////3/+HwAAAA//n/+Q//7/8/Ps8/z//+///5//n/9///////yfAAAAD/+YABx////n4+z7/v//z///z/+P/n//////8Z8AAAAP/4B/gh///8/n5n3+//+f///P/8/+f/////8DvwAAAA/+D//xh///n+fnfP5//7///+f/z/5///9/+A+/AAAAD/h///jh//4/x+c+f3//P///4//n/n///v/z/z8AAAAP8P///Hg/+H/P578/f/AD///z//f+f//+//f/fwAAAA/D///+fAAB/8/nn58/wfD/wAH/8/9///n/9/7/AAAAD4f///5+AA//z/ffz7+P/n/4AP/5////8////P8AAAAPn////z5///+f9+/nnz//P/j8f/z////H///x/wAAAA8/////Pz///5/z5/uef/++Af4/vD///4///8f/AAAADn////8/P///n/P3/N7/B58//x/eD//8P//8D/8AAAAOf////D8f//+f8/v+QP553n//h88D/4D///B//wAAAAz////+P5///x/7+f8E/P3c///j54D/////h///AAAADf////8fj///P/v9/x35/dz///Dz4h////8P//8AAAAN/////5/P//8/+fj/PfL8Gf///BH57////H///wAAAA3/////z8f//z/58n5993wT////AH/v///4////AAAACf///z/Px///P/nmfn3nPMP////AP+f//+P///8AAAAN///gB+/n//8/+f8+f+e99/////8P5///z////wAAAA3//wAD7+P//3/9/w5/57z3/////4PH//8/////AAAADd/8H+Hv8///f/z/Hn/APAf/////8AP//n////8AAAAMv/D/z8/x//9//PxPf8/8T///////8//+/////wAAAA6/4//P3/n//3/8/+c/z/0f///////5//7/////AAAADj+P/8+f+P/+f/7/9z/P/D////////x//3////8AAAAPfx//zz/8//4//n/zn8/8P////////h//n////wAAAA9+X//Of/5//4f+f4Gf3/x/////////g//P////AAAADn6f/8z//n//4f5//cff/H/////////B/8////8AAAAOf5//yf//O//8fz/879+8A/////////D/5////wAAAA5/n//j//8H//8fP/5v3zw4////////+H/n////AAAADn+f/8H//4///8c//y/fPH8////////8f/f///8AAAAOf5//AH//H///4x//r988f4///h////5/9////wAAAA9/n/58P/8wH/+Hn//P37x/5//4B////n/n////AAAAD3+f//8/8AD//B+f/+/fvD/7//vj///+f+f///8AAAAPP5///AAA///x/4//79+8P+Af8/n///9/x////wAAAA+Pn/////////v/z//vz7weAAH7/P///z+P////AAAAD8AP////////+f/H/+/Pvfg/4Dn/P///Pw////8AAAAP+I/////////9/+f9788B4//+Df+A//+IH////wAAAA//z/////////z/5/zvz3OP///A/AQ//4D/////AAAAD//P/////////v/j/k/O/x////CA/x//h/////8AAAAP/8/////////+f/P/D85+P////g//n//f/////wAAAA//5/////////8/8f8Px3z/////wf/P////////AAAAD//n/////////5/5/4/gef///////8////////8AAAAP/+f/////////n/n/L+Az////////z////////wAAAA//9//////////P/P9v4Cf//h/////P////////AAAAD//z/////////+f8/v/gD//+7////5////////8AAAAP//P/////////4/58//Af//53////z////////wAAAA//+f/////////z/33/8D///zP////H////////AAAAD//5//////////n/Pf/wP///x////+P///////8AAAAP//j//////////P+Z/3B/////////8f///////wAAAA///P/////////+fpr/uP/////////4////////AAAAD//+f/////////48yP+I//////////x///////8AAAAP//8P//////A//xzp/8H//5///////j///////wAAAA///4AAAAAAAH//iPH/8P//N//////+P///////AAAAD////AAAAAf8P/gA4f////93//////8f//////8AAAAP////4AA///4PAADh/////7v//////4///////wAAAA///////////4AAAMH/////x///////z///////AAAAD///////////+AAAwP///f/////////H//////8AAAAP////////////wADA9//7/////////+f//////wAAAA/////////////gAABn//A/////////5///////AAAAD//////////8AHAAAAf/wf///x/////j//////8AAAAP//////////8AAAAAB/8P///+b/////P//////wAAAA///////////8AAAAAH/Bf/9/73////8///////AAAAD///////////8AAAAAAAE//z/3f////z//////8AAAAP///////////8AAAAAAAJ//n/h//v//P//////wAAAA//////////8AAAAAAD4Az//P///8D/8///////AAAAD//////////AAAAAAAPADAAAf///gD/z//////8AAAAP//////////AAAAAAA/gGAAAf//+AD/P//////wAAAA///////////gAAAAAB+AYDn8///wAH9///////AAAAD///////////gAAAAAH4BwHf4///AAPn//////8AAAAP///////////gAAAAAfgHAd/w//8AAc///////wAAAA////////////gAAAAA/AcBz/w//wAAn///////AAAAD////////////AAAAAD8h5Hv/w//AAA///////8AAAAP///////////+AAAAAPzHke//wf8AAD///////wAAAA///////////+AAAAAA7A+D7//4HwAAP///////AAAAD///////////AAAAAAD0H5/n//8AAAAf//////8AAAAP//////////4AAAAAAPb/n+f///AAAB///////wAAAA//////////+AAAAAAA9v+f5////4AAD///////AAAAD//////////wAAAAAAB2/5/3////wAAP//////8AAAAP////////////AAAAAHN/j/f//7/gDg///////wAAAA/////////////4AAAA+3+P5///P/AfH///////AAAAD/////////////wAAAD9v5fn//x/+A8f//////8AAAAP////////////+OAAAP+ft+//8H/8AB///////wAAAA/////////////54AAA/884j//A//8AP///////AAAAD/////////////nuAAD/AHwD/4H//4D///////8AAAAP////////////+8/AAH9P/4v8Af///////////wAAAA/////////////7n/gAP3P/GfAD////////////AAAAD/////////////Of/AAPPP55wAf///////////8AAAAP////////////+z/8wAGffvAAD/z//////////wAAAA/////////////7P/ngAAc+wAAf4f//////////AAAAD/////////////t/8fAAADwAAD8D//////////8AAAAP////////////+H/z+AAAAAAAeAf//////////wAAAA/////////////4f+f8AAAAAADAD///////////AAAAD/////////////z/x/4AAAAAAAAf//////////8AAAAP/////////////P/P/wAAAAAAAD/+/////////wAAAA/////////////8/5/+AAAAAAAA//H/////////AAAAD/////////////3/n/wgAAAAAAH/g/////////8AAAAP/////////////f8/8PAAAAAAB/gH/////////wAAAA/////////////9/3/h+AAAAAAfgB//////////AAAAD/////////////3+f8P+AAAAAAAAP/////////8AAAAP/////////////f7/j/8AAAAAAAD//////////wAAAA/////////////9/P8f/4AAAAAAA///////////AAAAD/////////////n9/j//4AAAAAAf//////////8AAAAP////////////+fn8f//4AAAAAP///////////wAAAA/////////////5+fj//vwAAAAH/4//////////AAAAD/////////////n78f//PwAAAB/AH/////////8AAAAP////////////+fPg///PwAAAAAB//////////wAAAA/////////////598A///HwAAAAAf//////////AAAAD/////////////3nzgf//H4AAAAP//////////8AAAAP/////////////eefgD/wAAAAAD///////////wAAAA/////////////97z+kAAfAcAAH////////////AAAAD/////////////3OP7f///////////////////8AAAAP/////////////Mx/s////////////////////wAAAA/////////////83P+Z////////////////////AAAAD/////////////zZ/4H///////////////////8AAAAP/////////////tH//////////////////////wAAAA/////////////+c///////////////////////AAAAD/////////////4n//////////////////////8AAAAP/////////////w///////////////////////wAAAA//////////////H///////////////////////AAAAD/////////////////////////////////////8AAAAP/////////////////////////////////////wAAAA",
                    },
                },
                { PrintText: { Text: "<<->>" }, },
                { PrintText: { Text: "<<->>" }, },
                {
                    PrintText: {
                        Text: ">#0#< \"TERMINAL E\"",
                        Font: 1, // 1-4, 0 - по настройкам ККМ
                        Intensity: 15, // 1-15, 0 - по настройкам ККМ
                    },
                },
                { PrintText: { Text: "<<->>" }, },
                { PrintText: { Text: "<<->>" }, },

            ],
        };

        for(let pos of order.positions){

            const string = {
                PrintText: {
                    Text: pos.name + "<#1#>"+ pos.price + "  " + pos.count + "  " + (pos.price * pos.count)
                },
            }
            Data.CheckStrings.push(string)
        }

        const result = await fetch(`http://${process.env.KKM_SERVER}/Execute`, {
            method: 'post',
            body: JSON.stringify(Data) ,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Basic " + Buffer.from(process.env.KKM_USER + ":" + process.env.KKM_PASSWORD).toString('base64')  },
        })
        return true
    }

    async newOrder(type){
        if(!type) type = "IN"
        const order = await this.OrderModel.create()
        order.route = Number(String(order.id).slice(-3, 999))

        const newOrder = {
            id: "T-"+order.route,
            die: 0,
            alarm: 0,
            action: "NEW",
            payed: 0,
            ready: 0,
            takeOut: 0,
            type: type || "IN",
            source: "KASSA",
            flag: "",
            amount: 0,
            guestName: "",
            extId: "",
            text: "",
            pin: "",
            cornerReady: [],
            hidden: [],
            positions: []
        }
        global.Orders.push(newOrder)

        order.type = type || "IN"
        return await order.save()

    }

    async getOrder(route){
        const order = await this.OrderModel.findOne({
            where: {
                route: route
            },
            order:[
                ["id", "DESC"]
            ]
        })
        if(!order) return {error: "Маршрут не найден!"}
        const items = await order.getItems()
        order.items = items || []
        return {
            id: order.id,
            route: order.route,
            status: order.status,
            type: order.type,
            items: items || [],
            createdAt: order.createdAt
        }

    }

    async update(data, route, printer){
        return this.OrderModel.sequelize.transaction(async (transaction) => {
            const order = await this.OrderModel.findOne({
                where: {
                    route: route
                },
                order:[
                    ["id", "DESC"]
                ],
                transaction
            })
            if(!order) return {ok: false, error: "Order not found"}
            await this.OrderItemsModel.destroy({
                where: {
                    order_id: order.id
                },
                transaction
            })
            const itemsDTO = data.items.map(item => {
                item.order_id = order.id
                delete item.id
                return item
            })

            await this.OrderItemsModel.bulkCreate(itemsDTO, {transaction})
            order.type = data.type
            order.status = data.status
            // const orderGlobal = global.Orders.find(order => order.id === "T-"+ data.route);
            // orderGlobal.status = data.status
            // orderGlobal.type = data.type
            // orderGlobal.positions = data.items.map(p => {
            //     if(!p.code) return p
            //     const pos = global.Products.find(item => item.code === p.code)
            //     if(pos) {
            //         p.name = pos.name
            //         p.corner = pos.corner
            //         const c = orderGlobal.cornerReady.find(i => i.corner === pos.corner)
            //         if(!c) orderGlobal.cornerReady.push({ corner: pos.corner, status: "NOTREADY" })
            //
            //     }
            //     return p
            // })
            await order.save({transaction})
            try{
                await this.print({...order, positions: itemsDTO }, printer)
            }catch (e) {
                console.log("Can't find printer ip: "+process.env.KKM_SERVER + " . Printer: "+printer)
                return false
            }
            return true

        })

    }



    async RegisterCheck(NumDevice, TypeCheck, IsBarCode, my_aray_letters, cart, slip, isFiscal) {
        let cartSum = function(){

            return cart.reduce((sum, current) => {
                return sum + current.count * current.price
            }, 0);

        }
        // Подготовка данных команды
        var Data = {
            // Команда серверу
            Command: "RegisterCheck",

            //***********************************************************************************************************
            // ПОЛЯ ПОИСКА УСТРОЙСТВА
            //***********************************************************************************************************
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // ИНН ККМ для поиска. Если "" то ККМ ищется только по NumDevice,
            // Если NumDevice = 0 а InnKkm заполнено то ККМ ищется только по InnKkm
            InnKkm: "",
            //---------------------------------------------
            // Заводской номер ККМ для поиска. Если "" то ККМ ищется только по NumDevice,
            KktNumber: "",
            // **********************************************************************************************************

            // Время (сек) ожидания выполнения команды.
            //Если За это время команда не выполнилась в статусе вернется результат "NotRun" или "Run"
            //Проверить результат еще не выполненной команды можно командой "GetRezult"
            //Если не указано или 0 - то значение по умолчанию 60 сек.
            // Поле не обязательно. Это поле можно указывать во всех командах
            Timeout: 30,
            // Уникальный идентификатор команды. Любая строка из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            // Поле не обязательно
            IdCommand: this.guid(),
            // Это фискальный или не фискальный чек
            IsFiscalCheck: isFiscal,
            // Тип чека;
            // 0 – продажа;                             10 – покупка;
            // 1 – возврат продажи;                     11 - возврат покупки;
            // 8 - продажа только по ЕГАИС (обычный чек ККМ не печатается)
            // 9 - возврат продажи только по ЕГАИС (обычный чек ККМ не печатается)
            TypeCheck: TypeCheck,
            // Не печатать чек на бумагу
            NotPrint: false, //true,
            // Количество копий документа
            NumberCopies: 0,
            // Продавец, тег ОФД 1021
            CashierName: "Киоск самообслуживния",
            // ИНН продавца тег ОФД 1203
            CashierVATIN: "430601071197",
            // Телефон или е-Майл покупателя, тег ОФД 1008
            // Если чек не печатается (NotPrint = true) то указывать обязательно
            // Формат: Телефон +{Ц} Email {С}@{C}
            ClientAddress: "test@mail.com",
            // Aдрес электронной почты отправителя чека тег ОФД 1117 (если задан при регистрации можно не указывать)
            // Формат: Email {С}@{C}
            SenderEmail: "sochi@mama.com",
            // Система налогообложения (СНО) применяемая для чека
            // Если не указанно - система СНО настроенная в ККМ по умолчанию
            // 0: Общая ОСН
            // 1: Упрощенная УСН (Доход)
            // 2: Упрощенная УСН (Доход минус Расход)
            // 3: Единый налог на вмененный доход ЕНВД
            // 4: Единый сельскохозяйственный налог ЕСН
            // 5: Патентная система налогообложения
            // Комбинация разных СНО не возможна
            // Надо указывать если ККМ настроена на несколько систем СНО
            TaxVariant: "",

            // Строки чека
            CheckStrings: [
                // Строка с печатью простого текста
                // При вставке в текст в середину строки символов "<#10#>" Левая часть строки будет выравнена по левому краю, правая по правому, где 10 - это на сколько меньше станет строка ККТ
                // При вставке в текст в середину строки символов "<#10#>>" Левая часть строки будет выравнена по правому краю, правая по правому, где 10 - отступ от правого клая
                { PrintText: { Text: my_aray_letters[0] }, },
                { PrintText: { Text: my_aray_letters[1] }, },
                { PrintText: { Text: my_aray_letters[2] }, },
                { PrintText: { Text: my_aray_letters[3] }, },
                { PrintText: { Text: my_aray_letters[4] }, },
                { PrintText: { Text: "  " }, },
                { PrintText: { Text: "  " }, },
                // Строка с печатью текста определенным шрифтом
                // Строка с печатью фискальной строки

            ],

            // Наличная оплата (2 знака после запятой)
            Cash: 0.00,
            // Сумма электронной оплаты (2 знака после запятой)
            ElectronicPayment: cartSum().toFixed(2),
            // Сумма из предоплаты (зачетом аванса) (2 знака после запятой)
            AdvancePayment: 0,
            // Сумма постоплатой(в кредит) (2 знака после запятой)
            Credit: 0,
            // Сумма оплаты встречным предоставлением (сертификаты, др. мат.ценности) (2 знака после запятой)
            CashProvision: 0,

        };

        for(let n in slip)  {

            let slipString = { PrintText: { Text: slip[n] }, }
            Data.CheckStrings.push(slipString)
        }


        for(let i in cart){


            let fiscalString =             {
                Register: {
                    // Наименование товара 64 символа
                    Name: cart[i].name,
                    // Количество товара (3 знака после запятой)
                    Quantity: cart[i].count,
                    // Цена за шт. без скидки (2 знака после запятой)
                    Price: cart[i].price,
                    // Конечная сумма строки с учетом всех скидок/наценок; (2 знака после запятой)
                    Amount: cart[i].price*cart[i].count,
                    // Отдел, по которому ведется продажа
                    Department: 0,
                    // НДС в процентах или ТЕГ НДС: 0 (НДС 0%), 10 (НДС 10%), 20 (НДС 20%), -1 (НДС не облагается), 120 (НДС 20/120), 110 (НДС 10/110)
                    Tax: -1,
                    //Штрих-код EAN13 для передачи в ОФД (не печатется)
                    EAN13: "1254789547853",
                    // Признак способа расчета. тег ОФД 1214. Для ФФД.1.05 и выше обязательное поле
                    // 1: "ПРЕДОПЛАТА 100% (Полная предварительная оплата до момента передачи предмета расчета)"
                    // 2: "ПРЕДОПЛАТА (Частичная предварительная оплата до момента передачи предмета расчета)"
                    // 3: "АВАНС"
                    // 4: "ПОЛНЫЙ РАСЧЕТ (Полная оплата, в том числе с учетом аванса в момент передачи предмета расчета)"
                    // 5: "ЧАСТИЧНЫЙ РАСЧЕТ И КРЕДИТ (Частичная оплата предмета расчета в момент его передачи с последующей оплатой в кредит )"
                    // 6: "ПЕРЕДАЧА В КРЕДИТ (Передача предмета расчета без его оплаты в момент его передачи с последующей оплатой в кредит)"
                    // 7: "ОПЛАТА КРЕДИТА (Оплата предмета расчета после его передачи с оплатой в кредит )"
                    SignMethodCalculation: 1,
                    // Признак предмета расчета. тег ОФД 1212. Для ФФД.1.05 и выше обязательное поле
                    // 1: "ТОВАР (наименование и иные сведения, описывающие товар)"
                    // 2: "ПОДАКЦИЗНЫЙ ТОВАР (наименование и иные сведения, описывающие товар)"
                    // 3: "РАБОТА (наименование и иные сведения, описывающие работу)"
                    // 4: "УСЛУГА (наименование и иные сведения, описывающие услугу)"
                    // 5: "СТАВКА АЗАРТНОЙ ИГРЫ (при осуществлении деятельности по проведению азартных игр)"
                    // 6: "ВЫИГРЫШ АЗАРТНОЙ ИГРЫ (при осуществлении деятельности по проведению азартных игр)"
                    // 7: "ЛОТЕРЕЙНЫЙ БИЛЕТ (при осуществлении деятельности по проведению лотерей)"
                    // 8: "ВЫИГРЫШ ЛОТЕРЕИ (при осуществлении деятельности по проведению лотерей)"
                    // 9: "ПРЕДОСТАВЛЕНИЕ РИД (предоставлении прав на использование результатов интеллектуальной деятельности или средств индивидуализации)"
                    // 10: "ПЛАТЕЖ (аванс, задаток, предоплата, кредит, взнос в счет оплаты, пени, штраф, вознаграждение, бонус и иной аналогичный предмет расчета)"
                    // 11: "АГЕНТСКОЕ ВОЗНАГРАЖДЕНИЕ (вознаграждение (банковского)платежного агента/субагента, комиссионера, поверенного или иным агентом)"
                    // 12: "СОСТАВНОЙ ПРЕДМЕТ РАСЧЕТА (предмет расчета, состоящем из предметов, каждому из которых может быть присвоено вышестоящее значение"
                    // 13: "ИНОЙ ПРЕДМЕТ РАСЧЕТА (предмет расчета, не относящемуся к предметам расчета, которым может быть присвоено вышестоящее значение"
                    // 14: "ИМУЩЕСТВЕННОЕ ПРАВО" (передача имущественных прав)
                    // 15: "ВНЕРЕАЛИЗАЦИОННЫЙ ДОХОД"
                    // 16: "СТРАХОВЫЕ ВЗНОСЫ" (суммы расходов, уменьшающих сумму налога (авансовых платежей) в соответствии с пунктом 3.1 статьи 346.21 Налогового кодекса Российской Федерации)
                    // 17: "ТОРГОВЫЙ СБОР" (суммы уплаченного торгового сбора)
                    // 18: "КУРОРТНЫЙ СБОР"
                    // 19: "ЗАЛОГ"
                    SignCalculationObject: 1,
                    // Единица измерения предмета расчета. Можно не указывать
                    MeasurementUnit: "шт"

                }
            }

            Data.CheckStrings.push(fiscalString)

        }




        //Если чек без ШК то удаляем строку с ШК
        if (IsBarCode == false) {
            //Data.Cash = 100;
            for (var i = 0; i < Data.CheckStrings.length; i++) {
                if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].BarCode != undefined) {
                    Data.CheckStrings[i].BarCode = null;
                };
                if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].PrintImage != undefined) {
                    Data.CheckStrings[i].PrintImage = null;
                };
            };
        };

        //Скидываем данные об агенте - т.к.у Вас невярнека ККТ не зарегистрирована как Агент.
        Data.AgentSign = null;
        Data.AgentData = null;
        Data.PurveyorData = null;
        for (var i = 0; i < Data.CheckStrings.length; i++) {
            if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].Register != undefined) {
                Data.CheckStrings[i].Register.AgentSign = null;
                Data.CheckStrings[i].Register.AgentData = null;
                Data.CheckStrings[i].Register.PurveyorData = null;
            };
        };

        // Вызов команды
        return this.ExecuteCommand(Data);


    }

    async ReturnCheck(NumDevice, cart, slip) {

        let cartSum = function(){

            return cart.reduce((sum, current) => {
                return sum + current.count * current.price
            }, 0);

        }
        // Подготовка данных команды
        var Data = {
            // Команда серверу
            Command: "RegisterCheck",

            //***********************************************************************************************************
            // ПОЛЯ ПОИСКА УСТРОЙСТВА
            //***********************************************************************************************************
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // ИНН ККМ для поиска. Если "" то ККМ ищется только по NumDevice,
            // Если NumDevice = 0 а InnKkm заполнено то ККМ ищется только по InnKkm
            InnKkm: "",
            //---------------------------------------------
            // Заводской номер ККМ для поиска. Если "" то ККМ ищется только по NumDevice,
            KktNumber: "",
            // **********************************************************************************************************

            // Время (сек) ожидания выполнения команды.
            //Если За это время команда не выполнилась в статусе вернется результат "NotRun" или "Run"
            //Проверить результат еще не выполненной команды можно командой "GetRezult"
            //Если не указано или 0 - то значение по умолчанию 60 сек.
            // Поле не обязательно. Это поле можно указывать во всех командах
            Timeout: 30,
            // Уникальный идентификатор команды. Любая строка из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            // Поле не обязательно
            IdCommand: this.guid(),
            // Это фискальный или не фискальный чек
            IsFiscalCheck: true,
            // Тип чека;
            // 0 – продажа;                             10 – покупка;
            // 1 – возврат продажи;                     11 - возврат покупки;
            // 8 - продажа только по ЕГАИС (обычный чек ККМ не печатается)
            // 9 - возврат продажи только по ЕГАИС (обычный чек ККМ не печатается)
            TypeCheck: 1,
            // Не печатать чек на бумагу
            NotPrint: false, //true,
            // Количество копий документа
            NumberCopies: 0,
            // Продавец, тег ОФД 1021
            CashierName: "Киоск самообслуживния",
            // ИНН продавца тег ОФД 1203
            CashierVATIN: "430601071197",
            // Телефон или е-Майл покупателя, тег ОФД 1008
            // Если чек не печатается (NotPrint = true) то указывать обязательно
            // Формат: Телефон +{Ц} Email {С}@{C}
            ClientAddress: "test@mail.com",
            // Aдрес электронной почты отправителя чека тег ОФД 1117 (если задан при регистрации можно не указывать)
            // Формат: Email {С}@{C}
            SenderEmail: "sochi@mama.com",
            // Система налогообложения (СНО) применяемая для чека
            // Если не указанно - система СНО настроенная в ККМ по умолчанию
            // 0: Общая ОСН
            // 1: Упрощенная УСН (Доход)
            // 2: Упрощенная УСН (Доход минус Расход)
            // 3: Единый налог на вмененный доход ЕНВД
            // 4: Единый сельскохозяйственный налог ЕСН
            // 5: Патентная система налогообложения
            // Комбинация разных СНО не возможна
            // Надо указывать если ККМ настроена на несколько систем СНО
            TaxVariant: "",

            // Строки чека
            CheckStrings: [
                // Строка с печатью простого текста
                // При вставке в текст в середину строки символов "<#10#>" Левая часть строки будет выравнена по левому краю, правая по правому, где 10 - это на сколько меньше станет строка ККТ
                // При вставке в текст в середину строки символов "<#10#>>" Левая часть строки будет выравнена по правому краю, правая по правому, где 10 - отступ от правого клая
                { PrintText: { Text: "  " }, },
                // Строка с печатью текста определенным шрифтом
                // Строка с печатью фискальной строки

            ],

            // Наличная оплата (2 знака после запятой)
            Cash: 0.00,
            // Сумма электронной оплаты (2 знака после запятой)
            ElectronicPayment: cartSum().toFixed(2),
            // Сумма из предоплаты (зачетом аванса) (2 знака после запятой)
            AdvancePayment: 0,
            // Сумма постоплатой(в кредит) (2 знака после запятой)
            Credit: 0,
            // Сумма оплаты встречным предоставлением (сертификаты, др. мат.ценности) (2 знака после запятой)
            CashProvision: 0,

        };

        for(let n in slip)  {

            let slipString = { PrintText: { Text: slip[n] }, }
            Data.CheckStrings.push(slipString)
        }


        for(let i in cart){


            let fiscalString =             {
                Register: {
                    // Наименование товара 64 символа
                    Name: cart[i].name,
                    // Количество товара (3 знака после запятой)
                    Quantity: cart[i].count,
                    // Цена за шт. без скидки (2 знака после запятой)
                    Price: cart[i].price,
                    // Конечная сумма строки с учетом всех скидок/наценок; (2 знака после запятой)
                    Amount: cart[i].price*cart[i].count,
                    // Отдел, по которому ведется продажа
                    Department: 0,
                    // НДС в процентах или ТЕГ НДС: 0 (НДС 0%), 10 (НДС 10%), 20 (НДС 20%), -1 (НДС не облагается), 120 (НДС 20/120), 110 (НДС 10/110)
                    Tax: -1,
                    //Штрих-код EAN13 для передачи в ОФД (не печатется)
                    EAN13: "1254789547853",
                    // Признак способа расчета. тег ОФД 1214. Для ФФД.1.05 и выше обязательное поле
                    // 1: "ПРЕДОПЛАТА 100% (Полная предварительная оплата до момента передачи предмета расчета)"
                    // 2: "ПРЕДОПЛАТА (Частичная предварительная оплата до момента передачи предмета расчета)"
                    // 3: "АВАНС"
                    // 4: "ПОЛНЫЙ РАСЧЕТ (Полная оплата, в том числе с учетом аванса в момент передачи предмета расчета)"
                    // 5: "ЧАСТИЧНЫЙ РАСЧЕТ И КРЕДИТ (Частичная оплата предмета расчета в момент его передачи с последующей оплатой в кредит )"
                    // 6: "ПЕРЕДАЧА В КРЕДИТ (Передача предмета расчета без его оплаты в момент его передачи с последующей оплатой в кредит)"
                    // 7: "ОПЛАТА КРЕДИТА (Оплата предмета расчета после его передачи с оплатой в кредит )"
                    SignMethodCalculation: 1,
                    // Признак предмета расчета. тег ОФД 1212. Для ФФД.1.05 и выше обязательное поле
                    // 1: "ТОВАР (наименование и иные сведения, описывающие товар)"
                    // 2: "ПОДАКЦИЗНЫЙ ТОВАР (наименование и иные сведения, описывающие товар)"
                    // 3: "РАБОТА (наименование и иные сведения, описывающие работу)"
                    // 4: "УСЛУГА (наименование и иные сведения, описывающие услугу)"
                    // 5: "СТАВКА АЗАРТНОЙ ИГРЫ (при осуществлении деятельности по проведению азартных игр)"
                    // 6: "ВЫИГРЫШ АЗАРТНОЙ ИГРЫ (при осуществлении деятельности по проведению азартных игр)"
                    // 7: "ЛОТЕРЕЙНЫЙ БИЛЕТ (при осуществлении деятельности по проведению лотерей)"
                    // 8: "ВЫИГРЫШ ЛОТЕРЕИ (при осуществлении деятельности по проведению лотерей)"
                    // 9: "ПРЕДОСТАВЛЕНИЕ РИД (предоставлении прав на использование результатов интеллектуальной деятельности или средств индивидуализации)"
                    // 10: "ПЛАТЕЖ (аванс, задаток, предоплата, кредит, взнос в счет оплаты, пени, штраф, вознаграждение, бонус и иной аналогичный предмет расчета)"
                    // 11: "АГЕНТСКОЕ ВОЗНАГРАЖДЕНИЕ (вознаграждение (банковского)платежного агента/субагента, комиссионера, поверенного или иным агентом)"
                    // 12: "СОСТАВНОЙ ПРЕДМЕТ РАСЧЕТА (предмет расчета, состоящем из предметов, каждому из которых может быть присвоено вышестоящее значение"
                    // 13: "ИНОЙ ПРЕДМЕТ РАСЧЕТА (предмет расчета, не относящемуся к предметам расчета, которым может быть присвоено вышестоящее значение"
                    // 14: "ИМУЩЕСТВЕННОЕ ПРАВО" (передача имущественных прав)
                    // 15: "ВНЕРЕАЛИЗАЦИОННЫЙ ДОХОД"
                    // 16: "СТРАХОВЫЕ ВЗНОСЫ" (суммы расходов, уменьшающих сумму налога (авансовых платежей) в соответствии с пунктом 3.1 статьи 346.21 Налогового кодекса Российской Федерации)
                    // 17: "ТОРГОВЫЙ СБОР" (суммы уплаченного торгового сбора)
                    // 18: "КУРОРТНЫЙ СБОР"
                    // 19: "ЗАЛОГ"
                    SignCalculationObject: 1,
                    // Единица измерения предмета расчета. Можно не указывать
                    MeasurementUnit: "шт"

                }
            }

            Data.CheckStrings.push(fiscalString)

        }



        let IsBarCode = false
        //Если чек без ШК то удаляем строку с ШК
        if (IsBarCode == false) {
            //Data.Cash = 100;
            for (var i = 0; i < Data.CheckStrings.length; i++) {
                if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].BarCode != undefined) {
                    Data.CheckStrings[i].BarCode = null;
                };
                if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].PrintImage != undefined) {
                    Data.CheckStrings[i].PrintImage = null;
                };
            };
        };

        //Скидываем данные об агенте - т.к.у Вас невярнека ККТ не зарегистрирована как Агент.
        Data.AgentSign = null;
        Data.AgentData = null;
        Data.PurveyorData = null;
        for (var i = 0; i < Data.CheckStrings.length; i++) {
            if (Data.CheckStrings[i] != undefined && Data.CheckStrings[i].Register != undefined) {
                Data.CheckStrings[i].Register.AgentSign = null;
                Data.CheckStrings[i].Register.AgentData = null;
                Data.CheckStrings[i].Register.PurveyorData = null;
            };
        };

        // Вызов команды
        return this.ExecuteCommand(Data);


    }

    async returnArrayLetters(my_string){
        let letterS = [
            '  $$$$ ',
            ' $$    ',
            '  $$$  ',
            '    $$ ',
            ' $$$$  ',
        ];
        let letterF = [
            ' $$$$$ ',
            ' $$    ',
            ' $$$$  ',
            ' $$    ',
            ' $$    ',
        ];
        let letterT = [
            ' $$$$$$',
            '   $$  ',
            '   $$  ',
            '   $$  ',
            '   $$  ',
        ];
        let letterK = [
            ' $$  $$',
            ' $$ $$ ',
            ' $$$   ',
            ' $$ $$ ',
            ' $$  $$',
        ];
        let letterG = [
            '  $$$$ ',
            ' $$    ',
            ' $$ $$$',
            ' $$  $$',
            '  $$$$ ',
        ];
        let letterD = [
            ' $$$$$ ',
            ' $$  $$',
            ' $$  $$',
            ' $$  $$',
            ' $$$$$ ',
        ];
        let letter1 = [
            '    $$',
            '  $$$$',
            '    $$',
            '    $$',
            '    $$',
        ];

        let letter2 = [
            '  $$$$ ',
            ' $$  $$',
            '    $$ ',
            '  $$   ',
            ' $$$$$$',
        ];
        let letter3 = [
            '  $$$$ ',
            ' $   $$',
            '   $$$ ',
            ' $   $$',
            '  $$$$ ',
        ];
        let letter4 = [
            ' $$    ',
            ' $$  $$',
            ' $$$$$$',
            '     $$',
            '     $$',
        ];
        let letter5 = [
            ' $$$$$ ',
            ' $$    ',
            ' $$$$$ ',
            '     $$',
            ' $$$$$ ',
        ];
        let letter6 = [
            '  $$$$ ',
            ' $$    ',
            ' $$$$$ ',
            ' $$  $$',
            '  $$$$ ',
        ];
        let letter7 = [
            ' $$$$$$',
            ' $$  $$',
            '    $$ ',
            '   $$  ',
            '  $$   ',
        ];
        let letter8 = [
            '  $$$$ ',
            ' $$  $$',
            '  $$$$ ',
            ' $$  $$',
            '  $$$$ ',
        ];
        let letter9 = [
            '  $$$$ ',
            ' $$  $$',
            '  $$$$$',
            '     $$',
            '  $$$$ ',
        ];
        let letter0 = [
            '  $$$$ ',
            ' $$  $$',
            ' $$  $$',
            ' $$  $$',
            '  $$$$ ',
        ];
        let letterTire = [
            '       ',
            '       ',
            '  $$$  ',
            '       ',
            '       ',
        ];


        my_string = my_string.toLowerCase();
        let my_aray_letters = [
            '      ',
            '      ',
            '      ',
            '      ',
            '      ',
        ];
        for (let index = 0; index < my_string.length; index++)
        {
            let this_array = ['', '', '', '', '',];
            let char = my_string[index];
            if (char == 'k') { this_array = letterK; }
            if (char == 'f') { this_array = letterF; }
            if (char == 'g') { this_array = letterG; }
            if (char == 's') { this_array = letterS; }
            if (char == 'd') { this_array = letterD; }
            if (char == 't') { this_array = letterT; }
            if (char == '1') { this_array = letter1; }
            if (char == '2') { this_array = letter2; }
            if (char == '3') { this_array = letter3; }
            if (char == '4') { this_array = letter4; }
            if (char == '5') { this_array = letter5; }
            if (char == '6') { this_array = letter6; }
            if (char == '7') { this_array = letter7; }
            if (char == '8') { this_array = letter8; }
            if (char == '9') { this_array = letter9; }
            if (char == '0') { this_array = letter0; }
            if (char == '-') { this_array = letterTire; }
            my_aray_letters[0] = my_aray_letters[0] +' '+this_array[0];
            my_aray_letters[1] = my_aray_letters[1] +' '+this_array[1];
            my_aray_letters[2] = my_aray_letters[2] +' '+this_array[2];
            my_aray_letters[3] = my_aray_letters[3] +' '+this_array[3];
            my_aray_letters[4] = my_aray_letters[4] +' '+this_array[4];

        }
        return my_aray_letters;
    }

// Печать закрытия смены
    async CloseShift(NumDevice) {

        // Подготовка данных команды
        var Data = {
            // Команда серверу
            Command: "CloseShift",
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // Продавец, тег ОФД 1021
            CashierName: "Иванов И.И.",
            // ИНН продавца тег ОФД 1203
            CashierVATIN: "430601071197",
            // Не печатать чек на бумагу
            NotPrint: false,
            // Id устройства. Строка. Если = "" то первое не блокированное на сервере
            IdDevice: "",
            // Уникальный идентификатор команды. Любая строока из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            IdCommand: this.guid(),
        };

        // Вызов команды
        return this.ExecuteCommand(Data);

        // Возвращается JSON:
        //{
        //    "CheckNumber": 1,    // Номер документа
        //    "SessionNumber": 23, // Номер смены
        //    "QRCode": "t=20170904T141100&fn=9999078900002287&i=108&fp=605445600",
        //    "Command": "CloseShift",
        //    "Error": "",  // Текст ошибки если была - обязательно показать пользователю - по содержанию ошибки можно в 90% случаях понять как ее устранять
        //    "Status": 0   // Ok = 0, Run(Запущено на выполнение) = 1, Error = 2, NotFound(устройство не найдено) = 3, NotRun = 4
        //}

    }

// Печать X отчета
    async XReport(NumDevice) {

        // Подготовка данных команды
        var Data = {
            // Команда серверу
            Command: "XReport",
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // Id устройства. Строка. Если = "" то первое не блокированное на сервере
            IdDevice: "",
            // Уникальный идентификатор команды. Любая строока из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            IdCommand: this.guid(),
        };

        // Вызов команды
        return this.ExecuteCommand(Data);
    }


// Оплата безналом
    async PaymentByPaymentCard(NumDevice, sum) {

        // Подготовка данных команды
        var Data = {
            Command: "PayByPaymentCard",
            NumDevice: NumDevice,
            CardNumber: "",
            Amount: sum,
            ReceiptNumber: "TEST-01",
            IdCommand: this.guid(),
        }

        // Вызов команды
        return this.ExecuteCommand(Data);
    }

    async ReturnPaymentByPaymentCard(NumDevice, data, operation) {


        var Data = {
            Command: "ReturnPaymentByPaymentCard",
            NumDevice: NumDevice,
            CardNumber: "",

            Amount: data.order.sum,

            ReceiptNumber: data.order.id,
            RRNCode: data.order.RRNCode,
            AuthorizationCode: data.order.AuthorizationCode,
            IdCommand: this.guid()

        };


        return this.ExecuteCommand(Data, false, operation);

    }

    async Settlement(NumDevice) {

        // Подготовка данных команды
        var Data = {
            // Команда серверу
            Command: "Settlement",
            // Номер устройства. Если 0 то первое не блокированное на сервере
            NumDevice: NumDevice,
            // Уникальный идентификатор команды. Любая строка из 40 символов - должна быть уникальна для каждой подаваемой команды
            // По этому идентификатору можно запросить результат выполнения команды
            // Поле не обязательно
            IdCommand: this.guid()

        };

        // Вызов команды
        return this.ExecuteCommand(Data);
    }

}
module.exports = Order