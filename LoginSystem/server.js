const express = require('express')
const express_session = require('express-session')
const User = require('./user')
const connectDB = require('./database')
const loginRoute = require('./routes/login_route')
const logoutRoute = require('./routes/logout_route')
const registerRoute = require('./routes/register_route')

//////////////////////////////////////////////////////////

const app = express()

connectDB();

app.use(express.json())

app.use(express_session({
    secret: 'qwe',
    resave: false,
    saveUninitialized: false
}))

app.use(loginRoute)
app.use(logoutRoute)
app.use(registerRoute)


app.listen(3000, () => {
    console.log('Server running on port 3000')
})
