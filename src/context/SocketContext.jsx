import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      // Clean up previous socket if it exists
      if (socket.current) {
        socket.current.disconnect();
      }
      
      // Create new socket connection
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true
      });
      
      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });
      
      socket.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
      
      socket.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      const handleReceiveMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage } = useAppStore.getState();
        if (
          selectedChatType !== undefined && 
          selectedChatData && 
          (selectedChatData._id === message.sender._id || 
           selectedChatData._id === message.recipient._id)
        ) { 
          addMessage(message);
        }
      };
      
      socket.current.on("receiveMessage", handleReceiveMessage);
      
      return () => {
        if (socket.current) {
          socket.current.off("connect");
          socket.current.off("connect_error");
          socket.current.off("disconnect");
          socket.current.off("receiveMessage");
          socket.current.disconnect();
        }
      };
    }
  }, [userInfo]);
  
  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
