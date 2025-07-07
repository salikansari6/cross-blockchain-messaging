"use client";
import { ethers } from "ethers";
import React, { useState } from "react";
import MessageContractABI from "../../artifacts/contracts/Message.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TransactionReceipt } from "ethers";

const Message = ({
  sourceBlockchainContractAddress,
  destinationBlockchainContractAddress,
  destinationBlockchainChainId,
  sourceBlockchainChainId,
}: {
  sourceBlockchainContractAddress: string | null;
  destinationBlockchainContractAddress: string | null;
  destinationBlockchainChainId: number | null;
  sourceBlockchainChainId: number | null;
}) => {
  const [message, setMessage] = useState<string>("");
  const [estimatedGas, setEstimatedGas] = useState<string>("0");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const estimateGas = async () => {
    if (!message) {
      toast.error("Please enter a message");
      return;
    }
    if (!sourceBlockchainContractAddress) return;

    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    if (
      window.ethereum.networkVersion !== sourceBlockchainChainId?.toString()
    ) {
      toast.error(
        "Please switch to the correct network for sending the message"
      );
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      sourceBlockchainContractAddress,
      MessageContractABI,
      signer
    );

    const tx = await contract.getGasForMessage(
      destinationBlockchainChainId,
      destinationBlockchainContractAddress,
      message
    );
    console.log("tx", tx);
    setEstimatedGas(ethers.formatEther(tx));
    console.log("estimatedGas", ethers.parseEther(ethers.formatEther(tx)));
    setIsDialogOpen(true);
  };

  const send = async () => {
    setIsLoading(true);
    if (!sourceBlockchainContractAddress) return;

    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      sourceBlockchainContractAddress,
      MessageContractABI,
      signer
    );

    console.log("estimatedGas", ethers.parseEther(estimatedGas));
    try {
      const txReponse = await contract.sendMessage(
        destinationBlockchainChainId,
        destinationBlockchainContractAddress,
        message,
        {
          value: ethers.parseEther(estimatedGas),
        }
      );

      const txReceipt: TransactionReceipt = await txReponse.wait();
      console.log("txReceipt", txReceipt);
      const latestLog = txReceipt.logs.findLast(
        (log) =>
          log.address.toLowerCase() ===
          sourceBlockchainContractAddress.toLowerCase()
      );
      if (!latestLog) {
        toast.error(
          "Message sent but no log found. Please check the transaction on the explorer."
        );
        setIsLoading(false);
        setIsDialogOpen(false);
        return;
      }
      const messageId = latestLog?.data;
      setIsLoading(false);
      setIsDialogOpen(false);

      router.push(
        `/message-sent?${new URLSearchParams({
          ...Object.fromEntries(searchParams.entries()),
          message_id: messageId,
          transaction_hash: txReceipt.hash,
        }).toString()}`
      );
    } catch (error) {
      console.error(error);
      setIsDialogOpen(false);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full py-8 px-6 lg:px-0 flex flex-col items-center lg:items-start">
      <h1 className="text-3xl font-medium">Message</h1>
      <textarea
        className="p-2 border w-full lg:w-1/2 h-40 border-gray-300 rounded-md my-6"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Button
        className="bg-button-bg text-secondary text-sm font-semibold px-6 py-2 lg:ml-auto cursor-pointer"
        onClick={estimateGas}
        disabled={isLoading}
      >
        {isLoading && <Loader2Icon className="animate-spin" />}
        {isLoading ? "Sending..." : "Send"}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estimated Gas</DialogTitle>
            <DialogDescription>
              The estimated gas for this message is {estimatedGas} ETH. You will
              need to pay this amount to send the message.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={send}
              disabled={isLoading}
              className="bg-button-bg  text-secondary text-sm font-semibold px-6 py-2 lg:ml-auto cursor-pointer"
            >
              {isLoading && <Loader2Icon className="animate-spin" />}
              {isLoading ? "Sending..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Message;
