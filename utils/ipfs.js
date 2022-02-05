import { create } from "ipfs-http-client";

let node;

(async () => {
  node = create("https://api.ipfs.tapoon.house/");

  const version = await node.version();

  console.log("Version:", version.version);
})();

async function upload(buffer) {
  try {
    const file = await node.add({ content: JSON.stringify(buffer) });

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
