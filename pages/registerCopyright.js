import { ethers } from "ethers";
import Head from "next/head";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import EthersSafe from "@gnosis.pm/safe-core-sdk";

import GnosisSafeArtifact from "../contracts/GnosisSafe.json";
import CMORegistryArtifact from "../contracts/CMORegistry.json";

export default function RegisterCopyright() {
  const [members, setMembers] = useState([]);
  const [shares, setShares] = useState([]);
  const [safeContractInstance, setSafeContractInstance] = useState();

  async function deployMultiSig() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    const safeContractFactory = new ethers.ContractFactory(
      GnosisSafeArtifact.abi,
      GnosisSafeArtifact.bytecode,
      signer
    );

    try {
      let _safeContractInstance = await safeContractFactory.deploy();

      const txReceipt = await _safeContractInstance.deployTransaction.wait();

      if (txReceipt) {
        const setupSafeTx = await _safeContractInstance.setup(
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
          setSafeContractInstance(_safeContractInstance);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function signTx() {
    try {
      console.log(shares);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const cmoRegistry = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        CMORegistryArtifact.abi,
        signer
      );

      const submitCidTx = await cmoRegistry.populateTransaction.submitCid(
        "test_cid",
        members,
        shares
      );

      const safeSdk = await EthersSafe.create(
        ethers,
        safeContractInstance.address,
        signer
      );

      const safeTransaction = await safeSdk.createTransaction({
        ...submitCidTx,
        value: "0",
      });

      const txHash = await safeSdk.getTransactionHash(safeTransaction);

      const approveTxResponse = await safeSdk.approveTransactionHash(txHash);

      const txReceipt = await approveTxResponse.wait();

      console.log(txReceipt);
    } catch (err) {
      console.error(err);
    }
  }

  async function confirmTx() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const cmoRegistry = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        CMORegistryArtifact.abi,
        signer
      );

      const submitCidTx = await cmoRegistry.populateTransaction.submitCid(
        "test_cid",
        members,
        shares
      );

      const safeSdk = await EthersSafe.create(
        ethers,
        safeContractInstance.address,
        signer
      );

      const safeTransaction = await safeSdk.createTransaction({
        ...submitCidTx,
        value: "0",
      });

      const executeTxResponse = await safeSdk.executeTransaction(
        safeTransaction
      );
      const txReceipt = await executeTxResponse.wait();

      console.log(txReceipt);
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
              <div
                className="p-4 flex w-full bg-white shadow-md space-x-8"
                key={i}
              >
                <div className="flex flex-col flex-grow">
                  <label for={`member${i}`} className="font-bold">
                    Address
                  </label>
                  <input
                    id={`member${i}`}
                    className="p-4 bg-gray-100 mt-2"
                    onChange={(e) =>
                      setMembers((members) =>
                        members.map((member, memberIndex) =>
                          i === memberIndex ? e.target.value : member
                        )
                      )
                    }
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <label for={`share${i}`} className="font-bold">
                    Shares
                  </label>
                  <input
                    id={`share${i}`}
                    className="p-4 bg-gray-100 mt-2"
                    onChange={(e) =>
                      setShares((shares) =>
                        shares.map((share, shareIndex) =>
                          i === shareIndex ? e.target.value : share
                        )
                      )
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="border-dashed border-2 border-gray-400 p-4 w-full mt-8"
          onClick={() => {
            setMembers((members) => [...members, ""]);
            setShares((shares) => [...shares, 0]);
          }}
        >
          + Add member
        </button>
        {members.length > 0 ? (
          <div className="space-x-4">
            <button
              className="p-4 bg-purple-700 text-white mt-4"
              onClick={() => deployMultiSig()}
            >
              Deploy multisig
            </button>
            <button
              className="p-4 bg-purple-700 text-white mt-4"
              onClick={() => signTx()}
            >
              Sign tx
            </button>
            <button
              className="p-4 bg-purple-700 text-white mt-4"
              onClick={() => confirmTx()}
            >
              Confirm tx
            </button>
          </div>
        ) : (
          <></>
        )}
      </Layout>
    </>
  );
}
