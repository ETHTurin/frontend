import Head from "next/head";
import Layout from "../components/Layout";

import { ethers } from "ethers";
import { useEffect, useState } from "react";

import CMORegistryArtifact from "../contracts/CMORegistry.json";

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

function RegisterCopyright() {
  const [cids, setCids] = useState("");
  const [balace, seBalance] = useState(0);
  const [buyCids, setBuyCids] = useState([]);
  const [selectedCid, setSelectedCid] = useState("");

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

      try{
      const numOfCids = await cmoRegistry.numOfCids();
      console.log(numOfCids)

      let tempCids = [];
      for (let i = 0; i < numOfCids; i++) {
        const tempCid = await cmoRegistry.rightsCids(i);
        tempCids.push(tempCid);
      }

      setCids(tempCids);
    }catch(err){console.error(err)}
    try{    
      const provider = new ethers.providers.Web3Provider(window.ethereum);
  
      await provider.send("eth_requestAccounts", []);
  
      const signer = provider.getSigner();
      
      const cmoRegistry = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        CMORegistryArtifact.abi,
        signer
      );
  
     var balance = await cmoRegistry.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",1)
  
     seBalance(ethers.BigNumber.from(balance).toNumber())
      }catch{}
    }



    getCids();
  }, []);
  useEffect(() => {

  }, []);

  return (
    <>
      <Head>
        <title>CMOFrontend</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <h1 className="text-4xl font-bold">Buy copyright</h1>
        <div className="flex flex-col space-y-4 mt-8">
          <p className="text-3xl text-right">{balace}.00 $ COPYRIGHTS TOTAL</p>
          {buyCids.length === 0 ? <>Still no copyrights!</> : <>
          {
            buyCids.map((cidSave)=> {
              return <div className="bg-white flex justify-around align-middle p-10">
                <p>{cidSave.toUpperCase()}</p> 
                
                <button className="bg-red-500 p-4 border-4 text-white" onClick={() => {
                  var index = buyCids.indexOf(cidSave)
              if (index === -1) {
                var cids = buyCids.splice(index, 1);
                setBuyCids(cids);
              }
              console.log(buyCids)
                console.log("remove" + cids)
              }
              }>
                  REMOVE
                  </button>
               </div>
              })
          }
          </>
          }
          <Dropdown options= {cids} onChange={(value) => { setSelectedCid(value.value) }} value={selectedCid} placeholder="Select an option" />

          <button
          className="border-dashed border-2 border-gray-400 p-4 w-full mt-8"
          onClick={() => {
            if(selectedCid){
              var index = cids.indexOf(selectedCid)
              console.log(index, selectedCid)
              if (index !== -1) {        
              let cids = buyCids
              cids.push(selectedCid)
              
                    
                setBuyCids(cids)
                setSelectedCid("")
              }

            }
          }}
        >
          + Add member
        </button>
        {buyCids.length > 0 ?
        <div className="flex justify-center">
          <button className="bg-yellow-500 p-4 border-4 text-white" onClick={async () => {
                // payRights
                
                const provider = new ethers.providers.Web3Provider(window.ethereum);

                await provider.send("eth_requestAccounts", []);

                const signer = provider.getSigner();
                const cmoRegistry = new ethers.Contract(
                  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                  CMORegistryArtifact.abi,
                  signer
                );

                console.log(buyCids)

                var a = await cmoRegistry.payRights(buyCids, {value: 1000})
                console.log(a)
              }}>BUY COPYRIGHT LICESE</button>
              </div>
              : null
              
        }
          {/* <button onClick={async () => {    
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            await provider.send("eth_requestAccounts", []);

            const signer = provider.getSigner();

            const cmoRegistry = new ethers.Contract(
              "0x5FbDB2315678afecb367f032d93F642f64180aa3",
              CMORegistryArtifact.abi,
              signer
            );

            const submitCidTx = await cmoRegistry.submitCid(
            "test_cid_2",
            ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
            [50, 50]
          );
          
          console.log(submitCidTx)
        }
          }>ciao</button>
          <button onClick={async () => {  
            console.log("---> ")
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            await provider.send("eth_requestAccounts", []);

            const signer = provider.getSigner();

            const cmoRegistry = new ethers.Contract(
              "0x5FbDB2315678afecb367f032d93F642f64180aa3",
              CMORegistryArtifact.abi,
              signer
            );

            try{
            const numOfCids = await cmoRegistry.numOfCids();
              console.log(numOfCids)
            let tempCids = [];
            for (let i = 0; i < numOfCids; i++) {
              const tempCid = await cmoRegistry.rightsCids(i);
              tempCids.push(tempCid);
            }

            setCids(tempCids);
            console.log("---> ", tempCids)
          }catch(err){console.error(err)}
        }
          }>addio</button> */}
        </div>
      </Layout>
    </>
  );
}

export default RegisterCopyright;
