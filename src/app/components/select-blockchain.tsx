"use client";
import { useState } from "react";
import { Blockchain } from "../interfaces";
import Link from "next/link";
import BlockchainSelector from "./blockchain-selector";
import { Button } from "@/components/ui/button";

const SelectBlockChain = ({ blockchains }: { blockchains: Blockchain[] }) => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<
    Blockchain | undefined
  >(undefined);

  return (
    <div className="max-w-4xl w-full py-8 flex flex-col items-center lg:items-start">
      <h1 className="text-3xl font-medium">Select a blockchain</h1>
      <BlockchainSelector
        blockchains={blockchains}
        onSelectionChange={setSelectedBlockchain}
        placeholder="Select your blockchain"
      />

      <Link
        href={`/select-destination?source_blockchain_contract_address=${selectedBlockchain?.contract_address}&source_blockchain_chain_id=${selectedBlockchain?.chain_id}`}
        className="lg:ml-auto inline-block cursor-pointer"
      >
        <Button className="text-sm font-semibold px-6 py-2 cursor-pointer">
          Next
        </Button>
      </Link>
    </div>
  );
};

export default SelectBlockChain;
