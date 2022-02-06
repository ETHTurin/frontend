import { create } from "ipfs-http-client";

let node;

(async () => {
<<<<<<< HEAD
  node = create("https://ipfs.tapoon.house/");
=======
  node = create("https://api.ipfs.tapoon.house/");

>>>>>>> b1e4052735903a89477bb478b8feaf385fda5443
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
