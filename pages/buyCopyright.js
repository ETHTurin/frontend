import Head from "next/head";
import Layout from "../components/Layout";

import { ethers } from "ethers";
import { useEffect, useState } from "react";

import CMORegistryArtifact from "../contracts/CMORegistry.json";

function RegisterCopyright() {
  const [cids, setCids] = useState("");

  useEffect(() => {
    async function getCids() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const cmoRegistry = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        CMORegistryArtifact.abi,
        signer
      );

      const numOfCids = await cmoRegistry.numOfCids();

      let tempCids = [];
      for (let i = 0; i < numOfCids; i++) {
        const tempCid = await cmoRegistry.rightsCids(i);
        tempCids.push(tempCid);
      }

      setCids(tempCids);
    }

    getCids();
  }, []);

  useEffect(() => {
    console.log(cids);
  }, [cids]);

  return (
    <>
      <Head>
        <title>CMOFrontend</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <h1 className="text-4xl font-bold">Buy copyright</h1>
        <div className="flex flex-col space-y-4 mt-8">
          {cids.length === 0 ? <>Still no copyrights!</> : <></>}
        </div>
      </Layout>
    </>
  );
}

export default RegisterCopyright;
