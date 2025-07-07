import { ethers } from "ethers";

export interface ParsedMessage {
  version: number;
  nonce: number;
  origin: number;
  sender: string;
  destination: number;
  recipient: string;
  body: string;
}

export function parseMessage(message: string): ParsedMessage {
  const VERSION_OFFSET = 0;
  const NONCE_OFFSET = 1;
  const ORIGIN_OFFSET = 5;
  const SENDER_OFFSET = 9;
  const DESTINATION_OFFSET = 41;
  const RECIPIENT_OFFSET = 45;
  const BODY_OFFSET = 77;

  const buf = Buffer.from(ethers.getBytes(message));
  const version = buf.readUint8(VERSION_OFFSET);
  const nonce = buf.readUInt32BE(NONCE_OFFSET);
  const origin = buf.readUInt32BE(ORIGIN_OFFSET);
  const sender = ethers.hexlify(
    buf.subarray(SENDER_OFFSET, DESTINATION_OFFSET)
  );
  const destination = buf.readUInt32BE(DESTINATION_OFFSET);
  const recipient = ethers.hexlify(buf.subarray(RECIPIENT_OFFSET, BODY_OFFSET));
  const body = ethers.hexlify(buf.subarray(BODY_OFFSET));
  return { version, nonce, origin, sender, destination, recipient, body };
}
