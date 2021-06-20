import { ethers } from "ethers";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import EthersSafe from "@gnosis.pm/safe-core-sdk";

import GnosisSafeArtifact from "../contracts/GnosisSafe.json";
import CMORegistryArtifact from "../contracts/CMORegistry.json";
import { useDropzone } from "react-dropzone";

import IPFSUtils from "../utils/ipfs";

export default function RegisterCopyright() {
  const [members, setMembers] = useState([]);
  const [shares, setShares] = useState([]);
  const [safeContractInstance, setSafeContractInstance] = useState(null);

  const [fileName, setFileName] = useState("");
  const [cid, setCid] = useState("");

  const onDrop = useCallback(async (acceptedFiles) => {
    const _cid = await IPFSUtils.upload(acceptedFiles[0]);

    setFileName(acceptedFiles[0].name);
    setCid(_cid);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const cmoRegistry = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        CMORegistryArtifact.abi,
        signer
      );

      const submitCidTx = await cmoRegistry.populateTransaction.submitCid(
        cid,
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
        cid,
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
        <h2 className="font-bold text-2xl mt-8 mb-2">Stuff to copyright</h2>
        <div className="space-y-2 p-4 flex flex-col w-full bg-white shadow-md">
          <p className="font-bold">File</p>
          <div
            {...getRootProps()}
            className="border-dashed border-2 p-4 bg-gray-100"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag 'n' drop some files here, or click to select files</p>
            )}
          </div>
          {fileName !== "" ? <p>{fileName} uploaded!</p> : <></>}
        </div>
        <h2 className="font-bold text-2xl mt-8 mb-2">Owners</h2>
        <div className="space-y-4">
          {members.map((member, i) => {
            return (
              <div
                className="p-4 w-full bg-white shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4"
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
                    type="number"
                    min="0"
                    max="100"
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
          className="border-dashed border-2 border-gray-400 p-4 w-full mt-4"
          onClick={() => {
            setMembers((members) => [...members, ""]);
            setShares((shares) => [...shares, ""]);
          }}
        >
          + Add owner
        </button>
        {members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-4">
            <button
              className="p-4 bg-purple-700 text-white disabled:opacity-50"
              onClick={() => deployMultiSig()}
              disabled={
                members.filter((member) => member === "").length !== 0 ||
                shares.filter((share) => share === "").length !== 0 ||
                cid === ""
              }
            >
              Deploy multisig
            </button>
            <button
              className="p-4 bg-purple-700 text-white disabled:opacity-50"
              onClick={() => signTx()}
              disabled={safeContractInstance == null}
            >
              Sign tx
            </button>
            <button
              className="p-4 bg-purple-700 text-white disabled:opacity-50"
              onClick={() => confirmTx()}
              disabled={safeContractInstance == null}
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
