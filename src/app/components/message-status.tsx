"use client";
import { Blockchain } from "../interfaces";
import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ethers, EventLog } from "ethers";
import MessageContractABI from "../../artifacts/contracts/Message.json";
import { Progress } from "@/components/ui/progress";
import { ExternalLinkIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MessageStatus = ({
  sourceBlockChain,
  destinationBlockChain,
}: {
  sourceBlockChain: Blockchain;
  destinationBlockChain: Blockchain;
}) => {
  const searchParams = useSearchParams();
  const message_id = searchParams.get("message_id");
  const [message, setMessage] = useState<EventLog | null>(null);
  const [progress, setProgress] = useState(0);

  const getMessage = useCallback(async () => {
    if (!destinationBlockChain.contract_address) return;

    const provider = new ethers.JsonRpcProvider(
      destinationBlockChain.rpc_url +
        "/" +
        process.env.NEXT_PUBLIC_INFURA_API_KEY
    );

    const receiverContract = new ethers.Contract(
      destinationBlockChain.contract_address,
      MessageContractABI,
      provider
    );
    const messages: EventLog[] = (await receiverContract.queryFilter(
      "ReceivedMessage"
    )) as EventLog[];

    return messages;
  }, [destinationBlockChain.contract_address, destinationBlockChain.rpc_url]);

  const poll = useCallback(() => {
    setInterval(() => {
      setProgress((prev) => {
        if (prev < 70) {
          return prev + 3;
        }
        return prev;
      });
    }, 1500);

    const interval = setInterval(async () => {
      const messages = await getMessage();
      if (!messages) return;
      console.log(messages);
      const matchingMessage = messages.find(
        (message) => message.args[2] === message_id
      );
      if (matchingMessage) {
        console.log(matchingMessage);
        clearInterval(interval);
        setMessage(matchingMessage);
        setProgress(100);
      }
    }, 5000);
    return interval;
  }, [message_id, getMessage]);

  useEffect(() => {
    const interval = poll();
    return () => clearInterval(interval);
  }, [poll]);

  return (
    <div className="max-w-4xl w-full py-8 px-6 lg:px-0 flex flex-col items-center lg:items-start">
      <h1 className="text-3xl font-medium">Message Status</h1>

      <div className="my-8 w-full">
        <p className="text-md font-medium text-center lg:text-left">
          {message
            ? "Message Received"
            : "Waiting for confirmation on destination chain..."}
        </p>
        <Progress value={progress} className="w-full my-2" />
      </div>
      {message ? (
        <div className="flex flex-col gap-2 items-center w-full">
          <h1 className="text-xl font-bold self-start">Details</h1>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Source Blockchain</TableCell>
                <TableCell>{sourceBlockChain?.blockchain_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Destination Blockchain</TableCell>
                <TableCell>{destinationBlockChain?.blockchain_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Message ID</TableCell>
                <TableCell>{message.args[2]}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Receipt Transaction Hash</TableCell>
                <TableCell className="flex items-center">
                  {message.transactionHash}
                  <a
                    href={`${destinationBlockChain?.explorer_url}/tx/${message.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon className="w-4 h-4 ml-2" />
                  </a>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Message</TableCell>
                <TableCell>{message.args[3]}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Link
            href={`https://explorer.hyperlane.xyz/?search=${message.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className=" text-secondary text-sm font-semibold  my-4 cursor-pointer self-center">
              View on Hyperlane Explorer
            </Button>
          </Link>
        </div>
      ) : (
        <p>Fetching message...</p>
      )}
    </div>
  );
};

export default MessageStatus;
