const { Conflux, Drip } = require("js-conflux-sdk");
const walletConfig = require("./wallet.json");
const mintConfig = require("./config.json");

const rpcURL = mintConfig.rpcurl;
const conflux = new Conflux({
  url: rpcURL,
  networkId: 1029,
});
const crossSpaceCall = conflux.InternalContract("CrossSpaceCall");
const account = conflux.wallet.addPrivateKey(walletConfig.pk);

let timer = 0;
let latstUsedTime = mintConfig.timepermint;

function handleTime(usedTime) {
  if (usedTime < latstUsedTime) {
    offsetGas(-2, `usedTime: ${usedTime}`);
  } else {
    offsetGas(2, `usedTime: ${usedTime}`);
  }
}

let gasPrice = Drip.fromGDrip(mintConfig.gasPrice);

function offsetGas(offset, cause) {
  gasPrice = Drip.fromGDrip(Number(gasPrice.toGDrip()) + offset);
  console.log(`update gasPrice to ${gasPrice.toGDrip()}, cause: ${cause}`);
}

async function doWork(acc) {
  if (Number(gasPrice.toGDrip()) > mintConfig.maxGasPrice) {
    await sleep(10 * 1000);
    offsetGas(-5);

    return false;
  }

  return Promise.race([mint(acc), timeout(mintConfig.timeout)]);
}

function timeout(ms) {
  clearInterval(timer);
  const start = Date.now();

  return new Promise((resolve) => {
    timer = setInterval(() => {
      const end = Date.now();
      if (end - start >= ms) {
        clearInterval(timer);
        console.log("timeout: ", ms);
        resolve(false);
      }
    });
  });
}

async function mint(acc) {
  const nonce = await conflux.getNextNonce(acc.address);
  console.log(
    `nonce: ${nonce}, gas: ${gasPrice.toGDrip()}, maxGas: ${
      mintConfig.maxGasPrice
    }`
  );
  const startTime = Date.now();
  await crossSpaceCall
    .transferEVM("0xc6e865c213c89ca42a622c5572d19f00d84d7a16")
    .sendTransaction({
      from: acc.address,
      value: 0,
      gasPrice: gasPrice,
      nonce,
    })
    .executed();

  const endTime = Date.now();
  const usedTime = endTime - startTime;

  handleTime(usedTime);

  return true;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function start(num) {
  let minted = 0;
  while (true) {
    clearInterval(timer);

    try {
      console.log("minting the ", minted, "th");
      const reuslt = await doWork(account);

      if (reuslt) {
        minted += 1;
        if (minted >= num) {
          return;
        }
      }
    } catch (error) {
      offsetGas(10);
      console.log("error", error);
    }
  }
}

start(100);
