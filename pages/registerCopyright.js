import { ethers } from "ethers";
import Head from "next/head";
import { useState } from "react";
import Layout from "../components/Layout";
import EthersSafe, {
  SafeTransactionDataPartial,
} from "@gnosis.pm/safe-core-sdk";


import GnosisSafeArtifact from "../contracts/GnosisSafe.json";
import CMORegistryArtifact from "../contracts/CMORegistry.json";

export default function RegisterCopyright() {
  const [members, setMembers] = useState([]);

  async function deployMultiSig() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    const safeContractFactory = new ethers.ContractFactory(
      GnosisSafeArtifact.abi,
      GnosisSafeArtifact.bytecode,
      signer
    );

    const cmoRegistry = new ethers.Contract(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      CMORegistryArtifact.abi,
      signer
    );

    try {
      const safeContractInstance = await safeContractFactory.deploy();

      const txReceipt = await safeContractInstance.deployTransaction.wait();

      if (txReceipt) {
        const setupSafeTx = await safeContractInstance.setup(
          members,
          members.length,
          ethers.constants.AddressZero,
          ethers.utils.toUtf8Bytes(""),
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          0,
          ethers.constants.AddressZero
        );

        const txReceipt = await setupSafeTx.wait();

        if (txReceipt) {
          console.log(txReceipt);
          const owners = await safeContractInstance.getOwners();

          console.log(owners);

          const safeSdk = await EthersSafe.create(
            ethers,
            safeContractInstance.address,
            signer
          );

          const submitCidTx = await cmoRegistry.populateTransaction.submitCid(
            "test_cid",
            owners,
            [50, 50]
          );

          const partialTx = {
            to: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
            data: "0x<data>",
            value: "0",
          };
          const safeTransaction = await safeSdk.createTransaction(partialTx);

          console.log(safeTransaction);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <Head>
        <title>CMOFrontend</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <h1 className="text-4xl font-bold">Register copyright</h1>
        <div className="space-y-4 mt-8">
          {members.map((member, i) => {
            return (
              <div className="p-4 flex flex-col bg-white shadow-md">
                <label>Address</label>
                <input
                  className="p-4 bg-gray-100 mt-2"
                  onChange={(e) =>
                    setMembers((members) =>
                      members.map((member, memberIndex) =>
                        i === memberIndex ? e.target.value : member
                      )
                    )
                  }
                ></input>
              </div>
            );
          })}
        </div>
        
                <button
          className="border-dashed border-2 border-gray-400 p-4 w-full mt-8"
          onClick={() => setMembers((members) => [...members, { address: "" }])}
        >
          + Add member
        </button>
        {members.length > 0 ? (
          <button
            className="p-4 bg-purple-700 text-white mt-4"
            onClick={() => deployMultiSig()}
          >
            Deploy multisig
          </button>
        ) : (
          <></>
        )}
      </Layout>
    </>
  );
}
