/* eslint-disable no-unused-vars */
const TypeRegistry = require('@polkadot/types');
// const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const  _uiKeyring  = require('@polkadot/ui-keyring').default;
const  _crypto = require('@polkadot/util-crypto');
const { assert, isHex } = require('@polkadot/util');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract'); 
const { HttpProvider } = require('@polkadot/rpc-provider');
const { formatBalance, nextTick } = require('@polkadot/util');
const {ethers,utils} = require("ethers")
const sha3 = require("js-sha3");

const axios = require('axios').default;
const {
  ScProvider,
  WellKnownChain,
} = require("@polkadot/rpc-provider/substrate-connect");
const { async } = require('rxjs');
const _type = "sr25519";
const SEED_DEFAULT_LENGTH = 12;
const ETH_DERIVE_DEFAULT = "/m/44'/60'/0'/0/0";
let provider,polkadotApi;

// 日期格式化
export function parseTime(time, pattern) {
	if (arguments.length === 0 || !time) {
		return null
	}
	const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
	let date
	if (typeof time === 'object') {
		date = time
	} else {
		if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
			time = parseInt(time)
		} else if (typeof time === 'string') {
			time = time.replace(new RegExp(/-/gm), '/');
		}
		if ((typeof time === 'number') && (time.toString().length === 10)) {
			time = time * 1000
		}
		date = new Date(time)
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		a: date.getDay()
	}
	const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
		let value = formatObj[key]
		// Note: getDay() returns 0 on Sunday
		if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
		if (result.length > 0 && value < 10) {
			value = '0' + value
		}
		return value || 0
	})
	return time_str
}

// init crypto
export async function cryptoWaitReady(){
   await _crypto.cryptoWaitReady();
   _uiKeyring.loadAll({type: 'sr25519' });
}

// Randomly generated mnemonic
export function mnemonicGenerate(){
   const seed = _crypto.mnemonicGenerate(SEED_DEFAULT_LENGTH);
   return seed;
} 
// Create address
export function seedCreateAddress(mnemonic){
   let account, address,ethaddress;
   ethaddress =  _uiKeyring.createFromUri(getSuri( mnemonic, 'ethereum'), {}, 'ethereum').address;
   account =  _uiKeyring.createFromUri(getSuri( mnemonic,_type), {},_type).address;
   address = formatAddressByChain(account,0);
   return {
      account,
      address,
      ethaddress,
      mnemonic
   };
}

// different chain format addresses
// When choosing a different network, display the address
export function formatAddressByChain( address,prefix){
   const publicKey = _crypto.decodeAddress(address);
   const _prefix = prefix === -1 ? 42 : prefix;
   return _crypto.encodeAddress(publicKey, _prefix)
}

// save account
export function saveAccountsCreate(genesisHash,name,seed,address,oldpasswd) {
   let r = _uiKeyring.addUri(getSuri(seed, _type), oldpasswd, {
     genesisHash,
     name
   }, _type);
   let s = _uiKeyring.addUri(getSuri( seed, 'ethereum'),oldpasswd, {}, 'ethereum');
   return true;
 }

// Account setup password
function accountsChangePassword(data){
   let {
      address,
      newPass,
      oldPass
    } = data;
    const pair = _uiKeyring.getPair(address);
    assert(pair, 'Unable to find pair');
    try {
      if (!pair.isLocked) {
        pair.lock();
      }
      pair.decodePkcs8(oldPass);
    } catch (error) {
      throw new Error('oldPass is invalid');
    }
    _uiKeyring.encryptAccount(pair, newPass);
    return true;
}

// Verify account address
function seedValidate (data) {
   let {
      suri,
      type
   } = data;
   const { phrase } = _crypto.keyExtractSuri(suri);

   if (_crypto.isHex(phrase)) {
     assert(_crypto.isHex(phrase, 256), 'Hex seed needs to be 256-bits');
   } else {
     assert(_crypto.mnemonicValidate(phrase), 'Not a valid mnemonic seed');
   }
   return {
     address: _uiKeyring.createFromUri(suri, {}, type).address,
     suri
   };
 }

// account validate 
 function accountsValidate (data) {
   let {
      address,
      newPass
   } = data
   try {
      _uiKeyring.backupAccount(_uiKeyring.getPair(address), newPass);
     return true;
   } catch (e) {
     return false;
   }
 }
 
 // export account to json file
 export function accountsExport (address,newPass){
   return _uiKeyring.backupAccount(_uiKeyring.getPair(address),newPass)
 }

 // jsonstore import 
 function jsonRestore (data) {
   let {
      json,
      newPass
   } = data;
   try {
      _uiKeyring.restoreAccount(json, newPass);
      return true;
   } catch (error) {
      return false;
    //  throw new Error(error);
   }
 }

export async function queryBalance(address,chain){
  polkadotApi = await ApiPromise.create({ provider:new WsProvider(chain) });
  let r = await polkadotApi.query.system.account(address);
  return r;
}

// transfer 
export async function transfer(from,passwd,to,balance,chain){
  const pair = _uiKeyring.getPair(from);
  if(pair.isLocked){
    pair.unlock(passwd)
  }
  polkadotApi = await ApiPromise.create({ provider:new WsProvider(chain) });
  return new Promise((resolve, reject) => {
      let hash = polkadotApi.tx.balances
      .transfer(to, balance)
      .signAndSend(pair, ({ status, events, dispatchError }) => {
          if(status.isInBlock){
              // status would still be set, but in the case of error we can shortcut
              // to just check it (so an error would indicate InBlock or Finalized)
              if (dispatchError) {
                if (dispatchError.isModule) {
                  // for module errors, we have the section indexed, lookup
                  const decoded = polkadotApi.registry.findMetaError(dispatchError.asModule);
                  const { docs, name, section } = decoded;
                  
                  console.log(`${section}.${name}: ${docs.join(' ')}`);   
                } else {
                  // Other, CannotLookup, BadOrigin, no extra info
                  console.log(dispatchError.toString());
                }
                resolve(0)
              }else{
                resolve(String(status.hash))
              }
          }
          
        }
      )
  }).catch(e => {
    throw new Error('trans fail');
  });;
 
}

export async function transferFree(from,to,balance,chain){
  polkadotApi = await ApiPromise.create({ provider:new WsProvider(chain) });
  const extrinsic = polkadotApi.tx.balances.transfer(to, balance);

  // const  partialFee  = await polkadotApi.tx.utility
  // .batch(extrinsic)
  // .paymentInfo(from);
  // console.log(partialFee);
  const { partialFee } = await extrinsic.paymentInfo(from);
  return formatBalance(partialFee, { withSiFull: true })
}

function getSuri (seed, type) {
  var s = (type === 'ethereum'
    ? `${seed}${ETH_DERIVE_DEFAULT}`
    : seed);
  return s;
}
