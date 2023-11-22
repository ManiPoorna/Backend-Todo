const isLoggedIn = (req, res,next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  else{
    next();
  }
}

module.exports = {isLoggedIn}