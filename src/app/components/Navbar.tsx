import Image from "next/image";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-background border-b-1 border-secondary px-12">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/favicon.ico" alt="ChainConnect" width={24} height={24} />
        <h1 className="text-xl font-bold">ChainConnect</h1>
      </Link>
      <div className="flex items-center gap-2">
        <Link className="text-sm" href="/message-history">
          Message History
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
