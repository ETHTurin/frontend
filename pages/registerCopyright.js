import { ethers } from "ethers";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import EthersSafe from "@gnosis.pm/safe-core-sdk";

import GnosisSafeArtifact from "../contracts/GnosisSafe.json";
import CMORegistryArtifact from "../contracts/CMORegistry.json";
import { useDropzone } from "react-dropzone";

import IPFSUtils from "../utils/ipfs";
import { BsFillTrash2Fill } from "react-icons/bs";

export default function RegisterCopyright() {
  const [safeContractInstance, setSafeContractInstance] = useState(null);

  const [file, setFile] = useState("");
  const [cid, setCid] = useState("");

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(0);
  const [year, setYear] = useState(0);
  const [description, setDescription] = useState("");

  const [members, setMembers] = useState([]);
  const [shares, setShares] = useState([]);

  const [lyricists, setLyricists] = useState([]);
  const [composers, setComposers] = useState([]);

  const [tags, setTags] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    console.log("acceptedFiles[0]", acceptedFiles[0]);
    setFile(acceptedFiles[0]);
  }, []);

  useEffect(() => {
    console.log("file", file);
  }, [file]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  function getArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        console.log("passo");
        return resolve(reader.result);
      };
      reader.onerror = (error) => {
        console.log("nbon passo");
        return reject(error);
      };
    });
  }

  async function deployMultiSig() {
    const fileContent = await getArrayBuffer(file);

    const fileCid = await IPFSUtils.upload(fileContent);
    const _cid = await IPFSUtils.upload(
      JSON.stringify({
        title,
        description,
        duration,
        year,
        lyricists,
        composers,
        tags,
        content: fileCid,
      })
    );

    console.log("cid", _cid);

    setCid(_cid);

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
          console.log("txReceipt", txReceipt);
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
        process.env.NEXT_PUBLIC_CMO_CONTRACT_ADDRESS,
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
        process.env.NEXT_PUBLIC_CMO_CONTRACT_ADDRESS,
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
          {typeof file.name !== "undefined" ? (
            <div className="space-y-8">
              <div className="flex justify-around">
                <p className="text-bold text-2xl">{file.name} uploaded!</p>

                <BsFillTrash2Fill
                  className="cursor-pointer w-8 h-8"
                  onClick={() => {
                    setFile("");
                    setCid("");
                  }}
                />
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>

        {typeof file.name !== "undefined" ? (
          <div>
            <div className="mt-8 p-4 w-full bg-white shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col flex-grow">
                <label className="font-bold">Title</label>
                <input
                  className="p-4 bg-gray-100 mt-2"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col flex-grow">
                <label className="font-bold">Duration</label>
                <input
                  type={"number"}
                  className="p-4 bg-gray-100 mt-2"
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="flex flex-col flex-grow">
                <label className="font-bold">Year</label>
                <input
                  type={"number"}
                  className="p-4 bg-gray-100 mt-2"
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <div className="flex flex-col flex-grow">
                <label className="font-bold">Description</label>
                <input
                  className="p-4 bg-gray-100 mt-2"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <div>
                  <h2 className="font-bold text-2xl mt-8 mb-2">Lyricists</h2>
                  <div className="space-y-4">
                    {lyricists.map((lyricist, i) => {
                      return (
                        <div className="flex items-end">
                          <div className="flex flex-col flex-grow">
                            <label
                              for={`lyricists_last_name_${i}`}
                              className="font-bold"
                            >
                              Lyricist
                            </label>
                            <input
                              id={`lyricists_last_name_input_${i}`}
                              className="p-4 bg-gray-100 mt-2"
                              onChange={(e) =>
                                setLyricists((lyricists) =>
                                  lyricists.map((lyricist, lyricistIndex) =>
                                    i === lyricistIndex
                                      ? e.target.value
                                      : lyricist
                                  )
                                )
                              }
                            />
                          </div>

                          <div className="flex p-2">
                            <BsFillTrash2Fill
                              id={`img${i}`}
                              className="cursor-pointer w-8 h-8"
                              onClick={() => {
                                setLyricists((lyricists) =>
                                  lyricists.filter(
                                    (lyricist, lyricistIndex) =>
                                      i !== lyricistIndex
                                  )
                                );
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="border-dashed border-2 border-gray-400 p-4 w-full mt-4"
                    onClick={() =>
                      setLyricists((lyricists) => [...lyricists, ""])
                    }
                  >
                    + Add lyricist
                  </button>
                </div>
                <div>
                  <h2 className="font-bold text-2xl mt-8 mb-2">Composers</h2>
                  <div className="space-y-4">
                    {composers.map((composer, i) => {
                      return (
                        <div className="flex items-end">
                          <div className="flex flex-col flex-grow">
                            <label
                              for={`lyricists_last_name_${i}`}
                              className="font-bold"
                            >
                              Composer
                            </label>
                            <input
                              id={`lyricists_last_name_input_${i}`}
                              className="p-4 bg-gray-100 mt-2"
                              onChange={(e) =>
                                setComposers((composers) =>
                                  composers.map((composer, compIndex) =>
                                    i === compIndex ? e.target.value : composer
                                  )
                                )
                              }
                            />
                          </div>

                          <div className="flex p-2">
                            <BsFillTrash2Fill
                              id={`img${i}`}
                              className="cursor-pointer w-8 h-8"
                              onClick={() => {
                                setComposers((composers) =>
                                  composers.filter(
                                    (composers, compIndex) => i !== compIndex
                                  )
                                );
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="border-dashed border-2 border-gray-400 p-4 w-full mt-4"
                    onClick={() =>
                      setComposers((composers) => [...composers, ""])
                    }
                  >
                    + Add composer
                  </button>
                </div>
                <div>
                  <h2 className="font-bold text-2xl mt-8 mb-2">Tags</h2>
                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                    {tags.map((tag, i) => {
                      return (
                        <div className="flex items-end" key={i}>
                          <div className="flex flex-col flex-grow">
                            <label for={`tag${i}`} className="font-bold">
                              Tag
                            </label>
                            <input
                              id={`tag${i}`}
                              className="p-4 bg-gray-100 mt-2"
                              onChange={(e) =>
                                setTags((tags) =>
                                  tags.map((tag, tagIndex) =>
                                    i === tagIndex ? e.target.value : tag
                                  )
                                )
                              }
                            />
                          </div>
                          <div className="p-3">
                            <BsFillTrash2Fill
                              id={`img${i}`}
                              className="w-8 h-8 cursor-pointer"
                              onClick={() => {
                                setTags((tags) =>
                                  tags.filter((tag, tagIndex) => i !== tagIndex)
                                );
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="border-dashed border-2 border-gray-400 p-4 w-full mt-4"
                    onClick={() => setTags((tags) => [...tags, ""])}
                  >
                    + Add tag
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-8 mb-2">Owners</h2>
              <div className="space-y-4">
                {members.map((member, i) => {
                  return (
                    <div
                      className="p-4 w-full bg-white shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4"
                      key={i}
                    >
                      <div className="flex flex-col flex-grow">
                        <label id={`memberLabel${i}`} className="font-bold">
                          Address
                        </label>
                        <input
                          id={`memberInput${i}`}
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
                      <div className="flex justify-center col-start-2">
                        <BsFillTrash2Fill
                          id={`img${i}`}
                          className="cursor-pointer w-8 h-8"
                          onClick={() => {
                            setMembers((members) =>
                              members.filter(
                                (member, memberIndex) => i !== memberIndex
                              )
                            );

                            setShares((shares) =>
                              shares.filter(
                                (share, shareIndex) => i !== shareIndex
                              )
                            );
                          }}
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
            </div>
          </div>
        ) : (
          <></>
        )}

        {members.length > 0 && typeof file.name !== "undefined" ? (
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-4">
            <button
              className="p-4 bg-purple-700 text-white disabled:opacity-50"
              onClick={() => deployMultiSig()}
              disabled={
                members.filter((member) => member === "").length !== 0 ||
                shares.filter((share) => share === "").length !== 0 ||
                file.name === ""
              }
            >
              Deploy multisig
            </button>
            <button
              className="p-4 bg-purple-700 text-white disabled:opacity-50"
              onClick={() => signTx()}
              disabled={safeContractInstance == null}
            >
              Sign multisig
            </button>
            <button
              className="p-4 bg-purple-700 text-white disabled:opacity-50"
              onClick={() => confirmTx()}
              disabled={safeContractInstance == null}
            >
              Confirm deposit
            </button>
          </div>
        ) : (
          <></>
        )}
      </Layout>
    </>
  );
}
