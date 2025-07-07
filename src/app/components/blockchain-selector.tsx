"use client";
import { useState } from "react";
import { Blockchain } from "../interfaces";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface BlockchainSelectorProps {
  blockchains: Blockchain[];
  placeholder?: string;
  onSelectionChange: (blockchain: Blockchain | undefined) => void;
  value?: string;
  className?: string;
}

const BlockchainSelector = ({
  blockchains,
  placeholder = "Select your blockchain",
  onSelectionChange,
  value,
  className = "my-5 w-72",
}: BlockchainSelectorProps) => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<
    Blockchain | undefined
  >(value ? blockchains.find((b) => b.contract_address === value) : undefined);

  const handleValueChange = (contractAddress: string) => {
    const blockchain = blockchains.find(
      (blockchain) => blockchain.contract_address === contractAddress
    );
    setSelectedBlockchain(blockchain);
    onSelectionChange(blockchain);
  };

  return (
    <Select
      value={selectedBlockchain?.contract_address || value}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {blockchains.map((blockchain) => (
          <SelectItem
            key={blockchain.contract_address}
            value={blockchain.contract_address}
          >
            {blockchain.blockchain_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BlockchainSelector;
