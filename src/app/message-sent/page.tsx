import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getBlockchainByChainId } from "../utils/blockchains";
import { Button } from "@/components/ui/button";

const MessageSent = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) => {
  const params = await searchParams;
  const currentBlockchain = await getBlockchainByChainId(
    parseInt(params.source_blockchain_chain_id)
  );
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full py-8 flex flex-col items-center justify-center px-6 lg:px-0">
        <h1 className="text-3xl font-semibold">Message Sent</h1>
        <p className="my-4">
          Your message has been sent to the destination blockchain. It will be
          processed and relayed to the destination blockchain.
        </p>
        <p className="my-4 flex flex-col items-center lg:flex-row gap-2">
          <span className="font-semibold">Message ID:</span>{" "}
          <span className="text-gray-300 break-all">{params.message_id}</span>
        </p>
        <p className="flex flex-col items-center lg:flex-row gap-2 py-2">
          <span className="font-semibold">Transaction Hash:</span>{" "}
          <span className="flex flex-row items-center gap-2">
            <span className="text-gray-300 break-all">
              {params.transaction_hash}
            </span>
            <a
              href={`${currentBlockchain?.explorer_url}/tx/${params.transaction_hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="size-4" />
            </a>
          </span>
        </p>
        <Link
          href={`/message-status?${new URLSearchParams(params).toString()}`}
        >
          <Button className="bg-button-bg text-secondary text-sm font-semibold px-6 py-2 my-4 cursor-pointer">
            Get Status
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MessageSent;
