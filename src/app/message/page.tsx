import React, { Suspense } from "react";
import Message from "../components/message";

const MessagePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) => {
  const {
    source_blockchain_contract_address,
    destination_blockchain_contract_address,
    destination_blockchain_chain_id,
    source_blockchain_chain_id,
  } = await searchParams;

  return (
    <Suspense>
      <div className="flex flex-col justify-center items-center">
        <Message
          sourceBlockchainContractAddress={source_blockchain_contract_address}
          destinationBlockchainContractAddress={
            destination_blockchain_contract_address
          }
          destinationBlockchainChainId={parseInt(
            destination_blockchain_chain_id
          )}
          sourceBlockchainChainId={parseInt(source_blockchain_chain_id)}
        />
      </div>
    </Suspense>
  );
};

export default MessagePage;
