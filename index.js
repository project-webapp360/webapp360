const express = require('express');
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const exphbs = require('express-handlebars')
const mongoose = require("mongoose");
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const bodyParser = require('body-parser')
const path = require('path')
const welcomeRoutes = require('./routes/welcome')
const loginRoutes = require('./routes/auth')
const mainRoutes = require('./routes/main')
const registrationRoutes = require('./routes/registration')

const app = express();

const hbs = exphbs.create({
    defaultLayout: 'welcome',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers'),
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
// const jsonParser = bodyParser.json()
// app.use(bodyParser.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.use('/', welcomeRoutes)
app.use('/auth', loginRoutes)
app.use('/app', mainRoutes)
app.use('/app', registrationRoutes)

const PORT = process.env.PORT || 4000

async function start() {
    try {
        const url = 'mongodb+srv://ultrauser:ultrapassword@cluster0.wzzr3.mongodb.net/webapp360'
        await mongoose.connect(url, {
            useNewUrlParser: true
        })
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }

}

start();