import React, { Suspense } from "react";
import MessageStatus from "../components/message-status";
import { getBlockchainByChainId } from "../utils/blockchains";

const MessageStatusPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) => {
  const params = await searchParams;
  const sourceBlockChain = await getBlockchainByChainId(
    parseInt(params.source_blockchain_chain_id)
  );
  const destinationBlockChain = await getBlockchainByChainId(
    parseInt(params.destination_blockchain_chain_id)
  );

  if (!sourceBlockChain || !destinationBlockChain) {
    return <div>Invalid source or destination blockchain</div>;
  }

  return (
    <Suspense>
      <div className="flex flex-col justify-center items-center">
        <MessageStatus
          sourceBlockChain={sourceBlockChain}
          destinationBlockChain={destinationBlockChain}
        />
      </div>
    </Suspense>
  );
};

export default MessageStatusPage;
