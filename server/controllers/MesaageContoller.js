import cloudinary from "../lib/cloudinary.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { io, userSocketap } from "../server.js";

// get all user except logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteresUser = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    //count nimber of messages not seen
    const unSeenMessages = {};
    const promisses = filteresUser.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        reciverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unSeenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promisses);
    res.status(200)
      .json({ success: true, users: filteresUser, unSeenMessages });
  } catch (error) {}
  console.log(error.messages);
  res.status(500).json({ success: false, message: error.message });
};

// get all message for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserid } = req.params;
    const myId = req.user._id;

    const messsages = await Message.find({
      $or: [
        { senderId: myId, reciverId: selectedUserid },
        { senderId: selectedUserid, reciverId: myId },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserid, reciverId: myId },
      { seen: true }
    );
    res.status(200).json({ success: true, messsages });
  } catch (error) {
    console.log(error.messages);
    res.status(500).json({ success: false, message: error.message });
  }
};

//api to mark message as seen using message id

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.messages);
    res.status(500).json({ success: false, message: error.message });
  }
};

// send message to selected user
export const sendMessage = async (req, res)=>{
    try {
        const {text, image} = req.body;
        const reciverId = req.params.id;
        const senderId = req.user._id;
        let imageUrl;
        if(image){
            const uploadResponse = cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            reciverId,
            text,
            image: imageUrl
        })
        // Emit the new messages to the reciver's socket
        const reciversSocketId = userSocketap[reciverId]
        if(reciversSocketId){
            io.to(reciversSocketId).emit("newMessage", newMessage)
        }
        res.json({success: true, newMessage})
    } catch (error) {
        console.log(error.messages);
    res.status(500).json({ success: false, message: error.message });
    }
}