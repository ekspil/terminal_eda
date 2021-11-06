const nodemailer = require("nodemailer")

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            secure: true,
            tls: {rejectUnauthorized: false},
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER, // generated ethereal user
                pass: process.env.SMTP_PASS, // generated ethereal password
            }
        })

        this.sendEmailDarall = this.sendEmailDarall.bind(this)
        this.parseDataToTextEmail = this.parseDataToTextEmail.bind(this)
    }

    async sendEmailDarall(subject, text) {
        try {
            await this.transporter.sendMail({
                from: `order@infiniti-group.ru`, // sender address
                to: "parse@darall.pro", // list of receivers
                subject, // Subject line
                text
            })
        }
        catch (e) {
            console.log(e)
        }

    }

    parseDataToTextEmail(data){
        const now = new Date().getTime()
        let text = `
Новый заказ №${data.id}
Источник: ТерминалЕда
Дата создания: ${new Date(now).toLocaleString()}
Время забора: ${new Date(now + (10 * 60 * 1000)).toLocaleString()}
Время доставки: ${new Date(data.delivery_time_local).toLocaleString()}
Имя клиента: ${data.client_name}
Телефон клиента: ${data.client_phone}
Адрес откуда: г.Владивосток, ул.Батарейная 3а
Адрес куда: ${data.address.city + " " + data.address.street + " " + data.address.building + " - " + data.address.flat + " , подъезд: " + data.address.entrance + " , этаж: " + data.address.floor}
Состав: `

for (let i of data.positions)  {
    text += `
${i.quantity} - ${i.name}`
}

text += `
Оплачен: Да
Тип оплаты: Безнал
Сумма: ${data.sum}
Комментарий: ${data.comment}`
        return text
    }

}

module.exports = MailService