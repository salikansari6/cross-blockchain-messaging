import React from "react";
import { Blockchain } from "./interfaces";
import SelectBlockChain from "./components/select-blockchain";
import { getBlockchains } from "./utils/blockchains";

const SelectBlockchain = async () => {
  const blockchains: Blockchain[] = await getBlockchains();

  return (
    <div className="flex flex-col justify-center items-center">
      <SelectBlockChain blockchains={blockchains} />
    </div>
  );
};

export default SelectBlockchain;
