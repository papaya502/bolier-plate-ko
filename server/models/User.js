const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10;  //salt 를 이용해서 비밀번호를 암호화 해야하는데, salt를 먼저 생성 -> salt 가 몇글자인지 설정
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

//save 를 하기 전에 수행하겠다는 것
userSchema.pre('save', function( next ){
    var user = this;        //값이 들어온 userSchema를 할당함

    //비밀번호 변경할 때만 작동되게 하기
    if(user.isModified('password')){
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err)
                user.password = hash    //원래 입력한 비밀번호를 hash 값으로 교체해주기
                next()
            })
        })
    }else{
        next()   
    }

})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    //plainPassword -> 입력한 비밀번호, 암호화해서 DB에 저장된 암호화된 비밀번호와 비교해야 함
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;

    //jsonwebtoken을 이용해서 token을 생성하자
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save().then((err, user) => {
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    //토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decoded){
        //유저 아이디를 이용해서 유저를 찾은 다음에 
        //클라이언트에서 가져온 token 과 db에 보관된 토큰이 일치하는지 확인한다.
        user.findOne({"_id" : decoded, "token" : token})
            .then((err, user)=>{
                if(err) return cb(err)
                cb(null, user)
            })
    })
}

const User = mongoose.model('User', userSchema)
module.exports = { User }