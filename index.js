const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')

const { User } = require("./models/User")
const { auth } = require('./middleware/auth')

//application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({extended: true}))


//application/json
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected..'))
    .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/api/users/register', async (req, res) => {
    //회원 가입할 때 필요한 정보들을 client에서 가져오면 (bodyParser 사용)
    const user = new User(req.body)

    //그것들을 데이터베이스에 넣어준다. 
    const result = await user.save().then(()=>{
        res.status(200).json({
          success: true
        })
      }).catch((err)=>{
        res.json({ success: false, err })
      })
})


app.post('/api/users/login', (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({email: req.body.email})
    .then(user => {
      if(!user){
        return res.json({
          loginSuccess : false, 
          message : "제공된 이메일에 해당하는 유저가 없습니다."
        })
      }

      //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인한다.
      user.comparePassword(req.body.password, (err, isMatch) => {
        if(!isMatch)  
          return res.json({loginSuccess : false, message : "비밀번호가 틀렸습니다."})

        //비밀번호까지 맞다면 토큰을 생성한다.
        user.generateToken((err, user) => {
          if(err) return res.status(400).send(err)

          // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지, 세션 등등.. 여기서는 쿠키에 저장
          res.cookie("x_auth", user.token)
            .status(200)
            .json({loginSuccess: true, userId: user._id})
        })
      })

    }).catch((err) => {
      return res.status(400).send(err)
    })

})

app.post('/api/users/auth', auth,  (req, res) => {
  //req 에는 auth 에서 성공되었다면 받아온 정보가 포함되어 있을 것이다.
  //여기까지 미들웨어를 통과했다면 auth가 true라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  })
})


app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({_id: req.user._id}, {token: ""})
    .then((err, user) => {
      if(err) return res.json({success: false, message: err})
      return res.status(200).send({success: true})
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))