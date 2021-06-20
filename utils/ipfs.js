import { create } from "ipfs-http-client";
import IPFS from "ipfs";

let node;

(async () => {
  node = await IPFS.create();
  const version = await node.version();

  console.log("Version:", version.version);
})();

async function upload(buffer) {
  try {
    const file = await node.add({ content: buffer });

    return file.path;
  } catch (error) {
    throw error;
  }
}

function resolve(cid) {
  try {
    return `https://ipfs.io/ipfs/${cid}`;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  upload,
  resolve,
};
