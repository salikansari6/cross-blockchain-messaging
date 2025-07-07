import fs from "fs/promises";
import path from "path";
import { Blockchain } from "../interfaces";

/**
 * Centralized function to get blockchains data
 * Uses file-based approach for server-side rendering and API approach for client-side
 */
export async function getBlockchains(): Promise<Blockchain[]> {
  "use server";

  try {
    const file = await fs.readFile(
      path.join(process.cwd(), "src", "data", "blockchains.json"),
      "utf8"
    );
    const data = JSON.parse(file);
    return data;
  } catch (error) {
    console.error("Error reading blockchains from file:", error);
    throw new Error("Failed to load blockchains data");
  }
}

/**
 * Client-side function to get blockchains data from API
 * Use this for client-side components that need to fetch blockchains
 */
export async function getBlockchainsFromAPI(): Promise<Blockchain[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blockchains`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blockchains from API:", error);
    throw new Error("Failed to fetch blockchains from API");
  }
}

/**
 * Find a blockchain by chain ID
 */
export async function getBlockchainByChainId(
  chainId: number
): Promise<Blockchain | undefined> {
  try {
    const blockchains = await getBlockchains();
    return blockchains.find((blockchain) => blockchain.chain_id === chainId);
  } catch (error) {
    console.error("Error fetching blockchain by chain ID:", error);
    throw new Error("Failed to fetch blockchain by chain ID");
  }
}
