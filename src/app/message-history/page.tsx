import React from "react";
import MessageHistory from "../components/message-history";
import { getBlockchains } from "../utils/blockchains";

const MessageHistoryPage = async () => {
  const blockchains = await getBlockchains();
  return (
    <div className="flex flex-col justify-center items-center">
      <MessageHistory blockchains={blockchains} />
    </div>
  );
};

export default MessageHistoryPage;
