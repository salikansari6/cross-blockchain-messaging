"use client";
import React, { useCallback, useEffect, useState } from "react";
import { ethers, EventLog } from "ethers";
import MessageContractABI from "../../artifacts/contracts/Message.json";
import { Blockchain } from "../interfaces";
import { RateLimiter } from "limiter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLinkIcon, Loader } from "lucide-react";

const MessageHistory = ({ blockchains }: { blockchains: Blockchain[] }) => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const limiter = new RateLimiter({
    tokensPerInterval: 1,
    interval: 5000,
  });

  const [allContractLogs, setAllContractLogs] = useState<
    Map<
      string,
      {
        source_blockchain_name: string;
        source_blockchain_explorer_url: string;
        destination_blockchain_name: string;
        destination_blockchain_explorer_url: string;
        sending_transaction_hash: string;
        receiving_transaction_hash: string;
        message: string;
      }
    >
  >(new Map());

  const getContractLogs = useCallback(async (blockchain: Blockchain) => {
    await limiter.removeTokens(1);

    const provider = new ethers.JsonRpcProvider(
      blockchain.rpc_url + "/" + process.env.NEXT_PUBLIC_INFURA_API_KEY
    );

    const receiverContract = new ethers.Contract(
      blockchain.contract_address,
      MessageContractABI,
      provider
    );

    const receivedLogs = (await receiverContract.queryFilter(
      "ReceivedMessage"
    )) as EventLog[];
    const sentLogs = (await receiverContract.queryFilter(
      "MessageSent"
    )) as EventLog[];

    return {
      receivedLogs,
      sentLogs,
    };
  }, []);

  const groupAllContractLogsByMessageId = useCallback(
    (
      allContractLogs: {
        blockchain: Blockchain;
        contractLogs: {
          receivedLogs: EventLog[];
          sentLogs: EventLog[];
        };
      }[]
    ) => {
      console.log("groupAllContractLogsByMessageId being called");
      const messageIdToLogs = new Map<
        string,
        {
          source_blockchain_name: string;
          source_blockchain_explorer_url: string;
          destination_blockchain_name: string;
          destination_blockchain_explorer_url: string;
          sending_transaction_hash: string;
          receiving_transaction_hash: string;
          message: string;
        }
      >();

      allContractLogs.forEach(({ blockchain, contractLogs }) => {
        const destinationBlockChain = blockchain;
        contractLogs.receivedLogs.forEach((receivedLog) => {
          const messageId = receivedLog.args[2];
          const sourceBlockChain = blockchains.find(
            (blockchain) =>
              blockchain.contract_address.toLowerCase() ===
              receivedLog.args[1].toLowerCase()
          );

          const sentLog = allContractLogs
            .find(
              ({ blockchain }) =>
                blockchain.contract_address ===
                sourceBlockChain?.contract_address
            )
            ?.contractLogs.sentLogs.find((sl) => sl.args[0] === messageId);
          if (sourceBlockChain && destinationBlockChain) {
            messageIdToLogs.set(messageId, {
              source_blockchain_name: sourceBlockChain.blockchain_name,
              source_blockchain_explorer_url: sourceBlockChain.explorer_url,
              destination_blockchain_name:
                destinationBlockChain.blockchain_name,
              destination_blockchain_explorer_url:
                destinationBlockChain.explorer_url,
              sending_transaction_hash: sentLog?.transactionHash || "",
              receiving_transaction_hash: receivedLog.transactionHash,
              message: receivedLog.args[3],
            });
          }
        });
      });

      return messageIdToLogs;
    },
    [blockchains]
  );

  const getMessagesHistory = useCallback(async () => {
    setLoading(true);
    try {
      const allContractLogs = await Promise.all(
        blockchains.map(async (blockchain) => {
          const contractLogs = await getContractLogs(blockchain);

          return {
            blockchain,
            contractLogs,
          };
        })
      );

      setLoading(false);
      return allContractLogs;
    } catch {
      setIsError(true);
      setLoading(false);
      return [];
    }
  }, [blockchains, getContractLogs]);

  useEffect(() => {
    getMessagesHistory().then((logs) => {
      setAllContractLogs(groupAllContractLogsByMessageId(logs));
    });
  }, [getMessagesHistory, groupAllContractLogsByMessageId]);

  return (
    <div className="max-w-7xl w-full py-8 flex flex-col items-center justify-center">
      {loading || isError ? (
        <div className="flex flex-col items-center justify-center min-h-48 gap-4">
          {loading && <Loader className="size-18 animate-spin" />}
          {isError && (
            <p className="text-sm font-medium">
              API has been called too many times. Please try again later.
            </p>
          )}
          {loading && (
            <p className="text-sm font-medium">
              Loading message history by fetching logs from all blockchain
              contracts...
            </p>
          )}
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold self-start my-4">
            Message History
          </h1>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message ID</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Source Blockchain</TableHead>
                <TableHead>Destination Blockchain</TableHead>
                <TableHead>Sending Transaction Hash</TableHead>
                <TableHead>Receiving Transaction Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(allContractLogs.entries()).map(
                ([messageId, log], index) => (
                  <TableRow key={index}>
                    <TableCell className="truncate max-w-30">
                      {messageId}
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>{log.source_blockchain_name}</TableCell>
                    <TableCell>{log.destination_blockchain_name}</TableCell>
                    <TableCell>
                      <span className="truncate inline-block max-w-30">
                        {log.sending_transaction_hash}
                      </span>
                      <a
                        href={`${log.source_blockchain_explorer_url}/tx/${log.sending_transaction_hash}`}
                        target="_blank"
                        className="inline-block"
                        rel="noopener noreferrer"
                      >
                        <ExternalLinkIcon className="size-4" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="truncate inline-block max-w-30">
                        {log.receiving_transaction_hash}
                      </span>
                      <a
                        href={`${log.destination_blockchain_explorer_url}/tx/${log.receiving_transaction_hash}`}
                        target="_blank"
                        className="inline-block"
                        rel="noopener noreferrer"
                      >
                        <ExternalLinkIcon className="size-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default MessageHistory;
