import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "./AuthContext";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})
    const {socket, axios} = useAuthContext()
    //function to get all users for sidebar
    const getUsers = async () => {
        try {
            const {data} = await axios.get('/api/messages/users');            
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unSeenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to get messages for selected user

    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`)            
            if(data.success){
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to send message to selected user
    const sendMessages = async (messageData) => {
        try {            
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);            
            if(data.success){
                setMessages((prev) => [...prev, data.newMessage])
            }else{
                toast.error(error.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to subscribe to messages for selected user
     const subscribeToMessages = async () => {
       if(!socket) return
       socket.on("newMessage", (newMessage) => {
        if(selectedUser && newMessage.senderId === selectedUser._id){
            newMessage.seen = true;
            setMessages((prev) => [...prev, newMessage])
            axios.put(`/api/messages/mark/${newMessage._id}`)
        }else{
            setUnseenMessages((prev)=>({
                ...prev, [newMessage.senderId] : prev[newMessage.senderId]? prev[newMessage.senderId] + 1: 1 
            }))
        }
       })
    }

    // function to unsubscribe from messages
    const unSubscribeToMessages = async () => {
       if(socket) socket.off("newMessage")
      
    }

    useEffect(() => {
        subscribeToMessages();
        return () => unSubscribeToMessages()
    }, [socket,selectedUser])
     
     const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        setMessages,
        sendMessages,
        getMessages,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
    }
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  return useContext(ChatContext);
};
