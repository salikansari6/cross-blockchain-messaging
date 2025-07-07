import React, { Suspense } from "react";
import { Blockchain } from "../interfaces";
import SelectDestination from "../components/select-destination";
import { getBlockchains } from "../utils/blockchains";

const SelectDestinationPage = async () => {
  const blockchains: Blockchain[] = await getBlockchains();

  return (
    <Suspense>
      <div className="flex flex-col justify-center items-center">
        <SelectDestination blockchains={blockchains} />
      </div>
    </Suspense>
  );
};

export default SelectDestinationPage;
