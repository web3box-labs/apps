/* eslint-disable no-unused-vars */
import axios from 'axios';
// proxy 
// const tokenPrice_url = "/api/api/v3/simple/price?ids=Polkadot,Kusama,moonbeam,Acala,Astar,pha,Litentry&vs_currencies=usd";

const tokenPrice_url = "https://api.coingecko.com/api/v3/simple/price?ids=Polkadot,Kusama,moonbeam,Acala,Astar,pha,Litentry&vs_currencies=usd";

export async function tokenPrice(){
  let r =  await axios.get(tokenPrice_url,{}, 
    {
    headers:{
        'Content-Type':'application/json',
    }
  })
  return r.data;
}

