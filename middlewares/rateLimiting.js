const accessModel = require("../models/accessModel");

const rateLimit = async (req, res, next) => {
  // getting if user made a req already or not
  const sessionId = req.session.id
  try {
    // if user didnt made a req crate a req in db
    const accessDb = await accessModel.findOne({ sessionId });
    if (!accessDb) {
        const accessObj = accessModel({
          sessionId: sessionId,
          time : Date.now()
        })
      await accessObj.save();
      next();
      return;
    }

    // if user already made a req update time when user made req last time
    const diff = (Date.now() - accessDb.time) / 1000;
    console.log(diff);
    if (diff < 3) {
      alert("Too many requests. Please try again after some time");
      return;
    }
    await accessModel.findOneAndUpdate({ sessionId },{time : Date.now()});
    next();

  } catch (error) {
    return res.send({
      status: 500,
      message: "Too many requests. Please try again after some time",
    })
  }
}

module.exports = rateLimit;