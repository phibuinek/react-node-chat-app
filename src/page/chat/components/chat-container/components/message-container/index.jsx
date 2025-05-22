import { useAppStore } from "@/store";
import moment from "moment";
import { useEffect, useRef } from "react";

const MessageContainer = () => {
  const scrollerRef = useRef();
  const { selectedChatData, selectedChatType, userInfo, selectedChatMessages } = useAppStore();
  
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const renderDMMessage = (message) => {
    const isOwnMessage = message.sender === userInfo.id;
    
    return (
      <div className={`${isOwnMessage ? "text-right" : "text-left"}`}>
        {message.messageType === "text" && (
          <div className={`${isOwnMessage ?
            "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" :
            "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} 
            border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
            {message.content}
          </div>
        )}
        <div className="text-xs text-gray-600">
          {moment(message.timeStamp || message.timestamp).format("LT")}
        </div>
      </div>
    );
  };

  if (!selectedChatMessages || selectedChatMessages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 px-8 flex items-center justify-center">
        <div className="text-gray-400">No messages yet</div>
      </div>
    );
  }

  let lastDate = null;
  const messageElements = selectedChatMessages.map((message, index) => {
    const messageDate = moment(message.timeStamp || message.timestamp).format("DD/MM/YYYY");
    const showDate = messageDate !== lastDate;
    lastDate = messageDate;
    
    return (
      <div key={index}>
        {showDate && (
          <div className="text-center text-gray-500 my-2">
            {moment(message.timeStamp || message.timestamp).format("LL")}
          </div>
        )}
        {selectedChatType === "contact" && renderDMMessage(message)}
      </div>
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw]">
      {messageElements}
      <div ref={scrollerRef} />
    </div>
  );
};

export default MessageContainer;
