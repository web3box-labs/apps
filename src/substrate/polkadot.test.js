/* eslint-disable jest/valid-title */
const { assert } = require('@polkadot/util');
const { async } = require('rxjs');
const { tokenPrice } = require('./risk');
const { seedCreateAddress,cryptoWaitReady ,jsonRestore,saveAccountsCreate,formatAddressByChain,accountsExport,transferFree,transfer,queryBalance } = require('./polkadot.js');
const json = '{"encoded":"cOA/2X8ZcEI5d6/OMp5SJscZZwF30k0W7Lbh+00i94kAgAAAAQAAAAgAAACLwH9TeAzVvvjX9iWwuV4jTEwV2FBCQVLM4KooBPsHYSXpOhf87CDMhio+n4HxCA9ZGD88e8zngnb2KsHm8DK4PQfzpUslN4xnU06BshGSxFh+RxaiTgqIi2Vucn91j5aTH+QLdSS9fS73gBge6ccfpP72W7RMDShDuFBWNL4PeO6WkD6l2APDoKKyboRZg+kt2Kb8zHMroTGg8ser","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"5CSMqmBPNBdAHGmL6XCEH2VTJ8mWNfKJePzoXL3oypbb3kAk","meta":{"genesisHash":null,"isHidden":false,"name":"测试账户","whenCreated":1661235707935}}';
// const address = '5Gb9AfeJnhedZN4H6xVEEixLmSatLmpZaacPLVMesZuRZxgr';//'5CSMqmBPNBdAHGmL6XCEH2VTJ8mWNfKJePzoXL3oypbb3kAk'

const rpc = "wss://rococo-rpc.polkadot.io";
const address = "5G9nJdAhNVncmmydKBkq7N7SZ2ZsPNr2hz86a5XxUqxKKnrU";
const ksmaddress = "DtngC2WHe44QL9FFobZQELZM9oAWqX92pyjhEY8QrPfJjxy";
const seed =  "penalty casual garment mosquito panic blind kangaroo feel tobacco meadow crime return"
const oldpasswd = '123456';
const newPasswd = '123456';
const genesisHash = '0x7e4e32d0feafd4f9c9414b0be86373f9a1efa904809b683453a9af6856d38ad5';
const name = "test_account"
const defaul = 1000000000000;

describe(' polkadot wallet manager ',()=>{

      beforeAll( async() => {
         await cryptoWaitReady()
      });

      test(' create wallat address and set passwd ',async() => {
        await saveAccountsCreate(genesisHash,name,seed,address,oldpasswd)
      }) 

      test(' account address format ',async() => {
        let prefix = 105;
        await formatAddressByChain(address,prefix)
      })

      test(' export account ',async() => {
            await accountsExport (address,oldpasswd);
      }) 

      test(' import account ',async() => {
          await jsonRestore(json,oldpasswd);
      })
} )


describe(' account transaction ',()=>{

  beforeAll( async() => {
    jest.setTimeout(820000);
  });

  test(' Account balance inquiry ',async() => {
    let { data: { free: previousFree }, nonce: previousNonce } = await queryBalance(address,rpc);
  }) 

  test(' Account transfer token', async() => {
    const to = '5G9nJdAhNVncmmydKBkq7N7SZ2ZsPNr2hz86a5XxUqxKKnrU';
    const money = 1 * defaul ;
    // await transfer(address,oldpasswd,to,money,rpc);
  }) 

} )


describe(' Dashboard query ',()=>{

  beforeAll( async() => {
         jest.setTimeout(100820000);
        //  await cryptoWaitReady()
  });


  test(' balance ',async() => {
    let { data: { free: previousFree }, nonce: previousNonce } = await queryBalance(address,rpc);
  }) 

  
  test('Assets Pie Chart',async() => {
    const rpcs = {
      "0":'wss://rpc.polkadot.io',
      "2":'wss://kusama-rpc.dwellir.com',
      "10":'wss://acala.polkawallet.io', 
      "1284":'wss://moonbeam.public.blastapi.io',
      "5":'wss://rpc.astar.network',
      "30":'wss://api.phala.network/ws',
      "31":'wss://rpc.litentry-parachain.litentry.io'
    };
    let { account,address,ethaddress,mnemonic} = await seedCreateAddress(seed);

    await Promise.all([queryBalance(formatAddressByChain(address,0),rpcs[0]),
          queryBalance(formatAddressByChain(address,2),rpcs[2]),
          queryBalance(formatAddressByChain(address,10),rpcs[10]),
          queryBalance(ethaddress,rpcs[1284]),
          // queryBalance(formatAddressByChain(address,5),rpcs[5]),
          // queryBalance(formatAddressByChain(address,30),rpcs[30]),
          // queryBalance(formatAddressByChain(address,31),rpcs[31]),
    ]);
  }) 

  test(' market ',async() => {
     tokenPrice().then(item => {
        const polkadotusdt = item.polkadot.usd.toFixed(2);
        const kusamaudst = item.kusama.usd.toFixed(2);
        const acalausdt = item.acala.usd.toFixed(2);
        const moonbeamusdt = item.moonbeam.usd.toFixed(2);
        const astarusdt = item.astar.usd.toFixed(2);
        const phausdt = item.pha.usd.toFixed(2);
        const litentryusdt = item.litentry.usd.toFixed(2);
     });
  }) 
  
} )
