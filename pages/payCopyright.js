import Head from "next/head";
import Layout from "../components/Layout";

import { ethers } from "ethers";
import { useEffect, useState } from "react";

import CMORegistryArtifact from "../contracts/CMORegistry.json";

import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

import { resolve } from "../utils/ipfs";

import AlertFloat from "../components/AlertFloat";

function PayCopyright() {
  const [cids, setCids] = useState("");
  const [balace, seBalance] = useState(0);
  const [buyCids, setBuyCids] = useState([]);
  const [selectedCids, setSelectedCids] = useState([]);
  const [alert, setAlert] = useState();

  async function updateBalance() {
    try {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);

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
    } catch (e) {
      throw new Error("Something went wrong");
    }
  }

  useEffect(() => {
    async function getCids() {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const cmoRegistry = new ethers.Contract(
        process.env.NEXT_PUBLIC_CMO_CONTRACT_ADDRESS,
        CMORegistryArtifact.abi,
        signer
      );

      try {
        const numOfCids = await cmoRegistry.numOfCids();
        console.log(numOfCids);

        let tempCids = [];
        for (let i = 0; i < numOfCids; i++) {
          const tempCid = await cmoRegistry.rightsCids(i);

          tempCids.push(tempCid);
        }

        setCids(tempCids);
      } catch (err) {
        console.error(err);
      }
      updateBalance();
    }
    getCids();
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
          <p className="text-3xl text-right">{balace}.00 $ token total</p>
          {buyCids.length !== 0 ? (
            <>
              {buyCids.map((cidSave, index) => {
                return (
                  <div className="bg-white flex  p-10">
                    <Dropdown
                      className="flex-grow"
                      options={cids}
                      onChange={(value) => {
                        setBuyCids((buyCids) =>
                          buyCids.map((buyCid, i) =>
                            i !== index ? buyCid : value.value
                          )
                        );
                      }}
                      value={cidSave}
                      placeholder="Select an option"
                    />

                    <button
                      className="border-2 border-purple-700 p-4 text-purple-700"
                      onClick={() => {
                        window.open(resolve(cidSave));
                      }}
                    >
                      Show content
                    </button>

                    <button
                      className="bg-red-500 p-4 border-4 text-white"
                      onClick={() => {
                        // var buyCidsAux = buyCids.filter((buyCid) => {buyCids !== cidSave})

                        setBuyCids((buyCids) =>
                          buyCids.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      REMOVE
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
            <div className="flex justify-center">
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

                  console.log(buyCids);
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

          <textBox></textBox>

          {alert && <AlertFloat alert={alert} />}
        </div>
      </Layout>
    </>
  );
}

export default PayCopyright;
