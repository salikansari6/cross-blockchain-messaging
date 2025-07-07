"use client";
import { useState } from "react";
import { Blockchain } from "../interfaces";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BlockchainSelector from "./blockchain-selector";
import { Button } from "@/components/ui/button";

const SelectDestination = ({ blockchains }: { blockchains: Blockchain[] }) => {
  const searchParams = useSearchParams();

  const [selectedBlockchain, setSelectedBlockchain] = useState<
    Blockchain | undefined
  >(undefined);

  return (
    <div className="max-w-4xl w-full py-8 flex flex-col items-center lg:items-start">
      <h1 className="text-3xl font-medium">Select a destination</h1>
      <BlockchainSelector
        blockchains={blockchains.filter(
          (blockchain) =>
            blockchain.contract_address !==
            searchParams.get("source_blockchain_contract_address")
        )}
        onSelectionChange={setSelectedBlockchain}
        placeholder="Select your blockchain"
      />
      <Link
        className="ml-auto inline-block"
        href={`/message?${new URLSearchParams({
          ...Object.fromEntries(searchParams.entries()),
          destination_blockchain_contract_address:
            selectedBlockchain?.contract_address || "",
          destination_blockchain_chain_id:
            selectedBlockchain?.chain_id.toString() || "",
        }).toString()}`}
      >
        <Button className="text-sm font-semibold px-6 py-2 cursor-pointer">
          Next
        </Button>
      </Link>
    </div>
  );
};

export default SelectDestination;
