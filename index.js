const express = require('express')
const app = express()
const port = 5000

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://papaya502:abcd1234@boilerplate.yenve3v.mongodb.net/', {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    // useCreateIndex: true, 
    // useFindAnyModify : false
}).then(() => console.log('MongoDB Connected..'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))