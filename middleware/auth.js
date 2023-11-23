const { User } = require('../models/User')

let auth = (req, res, next) => {
    //인증처리를 하는 곳

    //클라이언트 쿠키에서 토큰을 가져온다. x_auth(쿠키명)
    let token = req.cookies.x_auth

    //토큰을 복호화한 후 유저를 찾는다.
    User.findByToken(token, (err, user) => {
        if(err) throw err
        if(!user){
            return res.json({isAuth: false, error: true})
        }
        req.token = token
        req.user = user
        next()  //이걸 해줘야 index.js에서 사용할 수 있음, 없으면 auth 안에만 있는 것임
    })

    //유저가 있으면 인증 성공, 없으면 인증 실패

}

module.exports = { auth }