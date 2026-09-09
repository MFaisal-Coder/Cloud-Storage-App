// import usersData from '../usersDB.json' with {type: "json"}
import Session from '../models/sessionModel.js';
import User from '../models/userModel.js'

export default async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;
  // console.log(sid)

  const session = await Session.findById(sid)
  if (!sid || !session) {
    res.clearCookie('sid')
    return res.status(401).json({ error: "1 Not logged!" });
  }
  const user = await User.findOne({_id: session.userId})

  if(!user){
    res.clearCookie('sid')
    return res.status(401).json({ error: "2 Not logged!" });
  }
  // console.log(user)
  req.user = user
  next()
}
