import Head from "next/head";
import Layout from "../components/Layout";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import CMORegistryArtifact from "../contracts/CMORegistry.json";
import { resolve } from "../utils/ipfs";
import AlertFloat from "../components/AlertFloat";
import Combobox from "../components/Combobox";

function PayCopyright({ data }) {
  const items = data.map((item) => {
    return {
      label: `${item.title}`,
      value: `${item.content}`,
      component: (
        <div className="flex flex-col">
          <p className="font-bold">{item.title}</p>
          <div className="grid grid-cols-6">
            <p className="uppercase text-sm text-gray-700">Duration</p>
            <p className="uppercase text-sm text-gray-700">Year</p>
            <p className="uppercase text-sm text-gray-700">Description</p>
            <p className="uppercase text-sm text-gray-700">Composers</p>
            <p className="uppercase text-sm text-gray-700">Lyricists</p>
            <p className="uppercase text-sm text-gray-700">Tags</p>
            <p>{item.duration} min</p>
            <p>{item.year}</p>
            <p>{item.description}</p>
            <p>{item.composers.join(", ")}</p>
            <p>{item.lyricists.join(", ")}</p>
            <p>{item.tags.join(", ")}</p>
          </div>
        </div>
      ),
    };
  });

  const [cids, setCids] = useState([]);
  const [balance, seBalance] = useState(0);
  const [buyCids, setBuyCids] = useState([]);
  const [selectedCids, setSelectedCids] = useState([]);
  const [alert, setAlert] = useState();

  async function updateBalance() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const cmoRegistry = new ethers.Contract(
        process.env.NEXT_PUBLIC_CMO_CONTRACT_ADDRESS,
        CMORegistryArtifact.abi,
        signer
      );
      const signerAddress = await signer.getAddress();
      var balance = await cmoRegistry.balanceOf(signerAddress, 1);
      seBalance(ethers.BigNumber.from(balance).toNumber());
    } catch {}
  }

  useEffect(() => {
    updateBalance();
  }, []);

  return (
    <>
      <Head>
        <title>CMOFrontend</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <h1 className="text-4xl font-bold">Pay copyright</h1>
        <div className="flex flex-col space-y-4 mt-8">
          <p className="text-3xl text-right">{balance}.00 $CMO balance</p>
          {buyCids.length !== 0 ? (
            <>
              {buyCids.map((cidSave, index) => {
                return (
                  <div className="bg-white flex justify-between p-8 gap-4 w-full">
                    <div className="flex-grow">
                      <Combobox
                        items={items}
                        handleSelectedItemChange={(item) => {
                          setBuyCids((buyCids) =>
                            buyCids.map((buyCid, i) =>
                              i !== index ? buyCid : item
                            )
                          );
                        }}
                        selectedItem={cidSave}
                        placeholder="Select an option"
                      />
                    </div>
                    <button
                      className=" border border-purple-700 p-2 text-purple-700 hover:bg-purple-700 hover:text-white hover:border"
                      onClick={() => {
                        window.open(resolve(cidSave.value));
                      }}
                    >
                      Show content
                    </button>
                    <button
                      className="border border-red-500 p-2 text-red-500 hover:bg-red-500 hover:text-white hover:border"
                      onClick={() => {
                        // var buyCidsAux = buyCids.filter((buyCid) => {buyCids !== cidSave})
                        setBuyCids((buyCids) =>
                          buyCids.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </>
          ) : (
            <></>
          )}

          <button
            className="border-dashed border-2 border-gray-400 p-4 w-full mt-8"
            onClick={() => {
              setBuyCids((buyCids) => [...buyCids, ""]);
            }}
          >
            + Add copyright
          </button>
          {buyCids.length > 0 ? (
            <div className="flex">
              <button
                className="bg-purple-700 p-4 border-4 text-white"
                onClick={async () => {
                  const provider = new ethers.providers.Web3Provider(
                    window.ethereum
                  );

                  await provider.send("eth_requestAccounts", []);

                  const signer = provider.getSigner();
                  const cmoRegistry = new ethers.Contract(
                    process.env.NEXT_PUBLIC_CMO_CONTRACT_ADDRESS,
                    CMORegistryArtifact.abi,
                    signer
                  );

                  try {
                    var payRightsTx = await cmoRegistry.payRights(buyCids, {
                      value: 1000,
                    });

                    const payRightsTxReceipt = await payRightsTx.wait();
                    if (payRightsTxReceipt) {
                      setAlert({
                        alertHeader: "PAGATO <3",
                        alertBody: "PAGAMENTO AVVENUTO CON SUCCESSO",
                        alertColor: "bg-green-500 text-white p-4 text-center",
                      });

                      updateBalance();
                      setBuyCids([]);
                    }
                  } catch (err) {
                    console.error(err);
                    setAlert({
                      alertHeader: "ERRORE",
                      alertBody: "ERRORE NEL PAGAMENTO",
                      alertColor: "bg-red-500 text-white p-4 text-center",
                    });
                  }
                }}
              >
                Pay copyright license
              </button>
            </div>
          ) : null}

          {alert && <AlertFloat alert={alert} />}
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps() {
  let provider;
  if (process.env.RPC_NETWORK === "goerli")
    provider = new ethers.providers.InfuraProvider("goerli", {
      projectId: process.env.RPC_ID,
      projectSecret: process.env.RPC_SECRET,
    });
  else provider = new ethers.providers.JsonRpcProvider();

  const cmoRegistry = new ethers.Contract(
    process.env.NEXT_PUBLIC_CMO_CONTRACT_ADDRESS,
    CMORegistryArtifact.abi,
    provider
  );

  const cids = await cmoRegistry.getRightsCids();

  const data = await Promise.all(
    cids.map(async (cid) => {
      const data = await fetch(`https://ipfs.tapoon.house/ipfs/${cid}`);
      const res = await data.json();

      return res;
    })
  );

  return {
    props: { data },
  };
}

export default PayCopyright;
