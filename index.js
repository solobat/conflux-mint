const { Conflux } = require("js-conflux-sdk");
const walletConfig = require("./wallet.json");

// NOTE: 填写 RPC url，可以去 https://unifra.io 申请
const rpcURL = "https://cfx-core.unifra.io/v1/{apiKey}"
const conflux = new Conflux({
  url: rpcURL,
  networkId: 1029,
});
const crossSpaceCall = conflux.InternalContract("CrossSpaceCall");
const account = conflux.wallet.addPrivateKey(walletConfig.pk);

let latstUsedTime = 25 * 1000;
let autoGasPrice = 45000000000n;
async function mint(acc) {
  const nonce = await conflux.getNextNonce(acc.address);
  console.log("nonce: ", nonce);
  console.log("autoGasPrice: ", autoGasPrice / 1000000000n);
  const startTime = Date.now();
  const receipt = await crossSpaceCall
    .transferEVM("0xc6e865c213c89ca42a622c5572d19f00d84d7a16")
    .sendTransaction({
      from: acc.address,
      value: 0,
      gasPrice: autoGasPrice,
      nonce,
    })
    .executed();
  const endTime = Date.now();
  const usedTime = endTime - startTime;
  console.log("usedTime: ", usedTime);
  if (usedTime < latstUsedTime) {
    autoGasPrice = autoGasPrice - 2000000000n;
    console.log("减少 2 Gas");
  } else {
    console.log("添加 2 Gas");
    autoGasPrice = autoGasPrice + 2000000000n;
  }
}

async function start(num) {
  let minted = 0;
  while (true) {
    try {
      console.log("minting the ", minted, "th");
      await mint(account);
      minted += 1;
      if (minted >= num) {
        return;
      }
    } catch (error) {
      console.log("error", error);
    }
  }
}

start(100);
