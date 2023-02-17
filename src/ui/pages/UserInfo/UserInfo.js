import React, { useState,useEffect } from "react";
import './UserInfo.scss';
import { connect } from 'react-redux';
import { setAccount, setSeed,setAddress,setethAddress } from '../../store/action';
import { useNavigate,useLocation } from 'react-router-dom';
import Loding from '../../images/loding.png';
import Success from '../../images/success.png';
import Error from '../../images/error.png';
import QRCode from 'qrcode.react';
import tx from '../../images/tx.png';
import File from '../../images/file.png';
import {knownSubstrate} from '../../../substrate/network'
import { Button, Select, message, Input,Modal } from 'antd';
import { formatAddressByChain,accountsExport,transferFree,transfer,queryBalance } from "../../../substrate/polkadot.js";
const { Option } = Select;
const { TransferService }  = require("../../store/transfer");


const UserInfo = (props) => {
    const useLocations= useLocation()
    const { account,address,seed,setSeed, setAddress,ethAddress,setethAddress} = props;
    const Navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalTransVisible, setIsModalTransVisible] = useState(false);
    const [isModalVisibleLoading, setIsModalVisibleLoading] = useState(false);
    const [isModalPasswordVisible, setIsModalPasswordVisible] = useState(false);
    const [selectTab, setSelectTab] = useState('2');
    const [receiveAddress, setReceiveAddress] = useState('');
    const [tokenAccount, setTokenAccount] = useState('');
    const [gasfees, setGasfees] = useState('');
    const [isLoding, setIsLoding] = useState('3');
    const [balances, setBalances] = useState(0);
    const [decimal, setDecimal] = useState(true);
    const [passwords, setPasswords] = useState('');
    const [exportPasswords, setExportPasswords] = useState('');
    const [rpc, setRpc] = useState('');
   
    const symbols = {
        "0":'DOT',
        "2":'KSM',
        "10":'ACA', 
        "1284":'GLMR',
        "5":'ASTR'
    };

    const handleCancelLoading = () => {
        setIsModalVisibleLoading(false);
      };
    const clearinput = () =>{
        setReceiveAddress('');
        setTokenAccount('');
        setPasswords('');
        setGasfees('');
    }
    const showModalRecive = () => {
        setIsModalOpen(true);
        setSelectTab(1);
        clearinput();

    };
      const showModalSend = () => {
        if(seed == 31){
           
            message.error(' Inquiry only ');
            return;
        }
        setIsModalOpen(true);
        setSelectTab(2);
        clearinput();
      };
    
      const handleChange = async (value) => {
        setBalances(0);
        let r = formatAddressByChain(account,value);
        console.log(r)
        if(value == 1284){
            setSeed(value);
            setAddress(ethAddress);
        }else{
            setAddress(r);
            setSeed(value);
        } 

        console.log(seed);
    }

      const handleOk = () => {

        if(tokenAccount <= 0.001){
            message.error('Minimum account amount must be greater than 0.001' );
            return;
        }
      
        if(passwords==''){
            message.error('Wrong Password.');
            return;
        }
        if(tokenAccount==''){
            message.error('Amount not entered.');
            return;
        }
        if(receiveAddress==''){
            message.error('The Address is not entered.');
            return;
        }

        try{
            transferFree(address,receiveAddress.trim(),tokenAccount).then(r =>{
                setGasfees( (r.result.GasLimit * 1 * r.result.GasFeeCap * 1 ) / 1000000000000000000);
            })
        }catch(error){

        }finally{
            setIsModalOpen(false);
            setIsModalTransVisible(true);
        }
      };

      const handleCancel = () => {
        setIsModalOpen(false);
        setIsModalTransVisible(false);
        setIsModalPasswordVisible(false);
        handleCancelLoading();

        clearinput();
        
      };
    
    const tab_recive = () => {
        setSelectTab(1);
    }
    const tab_send = () => {
        setSelectTab(2);
    }
    
    const copyAddress = () => {
            let copyContent = address;
            var input = document.createElement("input");
            input.value = copyContent;
            document.body.appendChild(input);
            input.select();
            document.execCommand("Copy");
            document.body.removeChild(input);
            message.success('Successfully copied Address.');
    };
    
    const SendToken= async()=>{
        setIsModalTransVisible(false);
        setIsModalVisibleLoading(true);
        setIsLoding(0);
        try{
            let newFrom = address;
            if(seed === 1284){
                newFrom = ethAddress;
            }
            transfer(newFrom,passwords,receiveAddress.trim(),tokenAccount*decimal+'',rpc).then((resolve) => {
                setIsModalVisibleLoading(false);
                var obj = {
                    hash:resolve,
                    from:newFrom,
                    to:tokenAccount,
                    formatFrom:account,
                    balance:tokenAccount*1,
                    symbols:symbols[seed],
                    status:'1',
                    desc:'',
                    createTime:new Date(),
                }
                if(resolve !== 0 ){
                    var indexdb = new TransferService();
                    var r = indexdb.add(obj);
                    getBalance(newFrom);
                    setIsLoding(1);
                }else{
                    obj.hash = 'xxx';
                    obj.status = '2';
                    var indexdb = new TransferService();
                    var r = indexdb.add(obj);
                    setIsLoding(2);
                }
             
            })

        }catch(error){
            console.log(error);
            setIsLoding(2);
        }finally{
            clearinput();
        }
       
    }
    const showExportodel = () =>{
        setIsModalPasswordVisible(true);
    }

    const exportConfirm=async()=>{
        let pkey = '';
        if(exportPasswords == ''){
            message.error('Wrong Password.');
            return;
        }
       
        let r = accountsExport(address,exportPasswords);
        funDownload(JSON.stringify(r), `${symbols[seed]}-${address}.json`);
        setIsModalPasswordVisible(false);
    }
    const funDownload = (content, filename) => {
        var eleLink = document.createElement("a");
        eleLink.download = filename;
        eleLink.style.display = "none";
        var blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    };

    const getBalance =  (value) =>{
        knownSubstrate.map( async(item)=>{
            if(value === 1284 &&  value == item.prefix){
                  setDecimal(item.decimals);
                  setRpc(item.rpc);
                  let { data: { free: previousFree }, nonce: previousNonce } = await queryBalance(ethAddress,item.rpc);
                  setBalances(`${previousFree}`/item.decimals);
            }else if(value == item.prefix){
                  setDecimal(item.decimals);
                  setRpc(item.rpc);
                  let { data: { free: previousFree }, nonce: previousNonce } = await queryBalance(address,item.rpc);
                  setBalances(`${previousFree}`/item.decimals);
            }})
    }

    useEffect(()=>{
        if( typeof account == 'undefined'  || account == ''){
            Navigate('/WalletConfirm');
        }
        console.log('seed' + seed);
        getBalance(seed);
    },[address])

    const receiveChange=(e)=>{
        setReceiveAddress(e.target.value);
    }
    const accountChange=(e)=>{
        setTokenAccount(e.target.value);
    }
    
    const passwordChange=(e)=>{
        setPasswords(e.target.value)
    }
    const exportPasswordChange=(e)=>{
        setExportPasswords(e.target.value)
    }
    const clickMax = () =>{
        setTokenAccount(balances > 0 ? balances * 1 - 0.01:0);
    }

    return (
        <div className={account !== '' ? "UserInfo": 'hide'}  >
            <div className='user_wallet'>
                <img className='avatar' src={tx}></img>

                <div className='address_ehem'>
                    <p>Balance: <span>{balances}</span>
                    <Select className='select_main' defaultValue={seed?seed:knownSubstrate[0].prefix} style={{ width: 200 }} onChange={handleChange}>
                       {
                           knownSubstrate.map(item=>{
                           return <Option value={item.prefix} key={item.prefix}>{item.symbols[0]}( {item.displayName} )</Option>
                           })
                       }
                    </Select>
                    </p>
                    <p>Address：
                    <span>{typeof address != 'undefined'?address.slice(0, 4):''} </span>
                    <span> *****</span>
                    <span>{typeof address != 'undefined'?address.slice(address.length - 4, address.length):''}</span>
                    <img onClick={copyAddress} src={File}></img></p>
                </div>

                <div className='not'>
                    <Button className='send' onClick={showModalSend}>Send</Button>
                    <Button className='receive' onClick={showModalRecive}>Receive</Button>
                    <Button className='export' onClick={showExportodel}>Export</Button>
                </div>
            </div>

            <Modal wrapClassName='ModalSendAndReceive' width='600px'  open={isModalOpen} >
                
                <div className='head'>
                    <span className="point"></span>
                    <div className="btn_div">
                        <span className={selectTab == '1' ? 'active' : 'btn'} onClick={tab_recive}>Receive</span>
                        <span className={selectTab == '2' ? 'active' : 'btn'} onClick={tab_send}>Send</span>
                    </div>
                </div>
                <div className="line"></div>

                <div  className={selectTab == '2' ? 'show' : 'hide'} >
                                <div className='_address'>
                                <Input placeholder="Enter Address" value={receiveAddress} onChange={receiveChange} className='_address_input'></Input>
                                </div>
                                <div className='_Amount'>
                                <Input placeholder="Enter Amount" value={tokenAccount}   onChange={accountChange} ></Input>
                                <Button onClick={clickMax} >MAX</Button>
                                </div>
                            
                                <div className='_address'>
                                <Input type='password' value={passwords}  onChange={passwordChange}   placeholder="Enter Password" className='_address_input'></Input>
                                </div>
                                <p className='balance'> Balance: {balances}</p>
                </div>

                <div  className={selectTab == '1' ? 'show' : 'hide'} >
                        <div className="QR_CODE">
                                 <QRCode value={address} size={170}></QRCode>
                                    </div>
                                    <p> Your Address </p>
                                    <span className='address_'>{address}</span>
                        </div>
                            
                <div className="modal_footer"  >
                    <Button  className="Cancel" onClick={handleCancel} >Cancel</Button>
                    <Button  className={selectTab == '2' ? 'Confirm' : 'hide'} onClick={handleOk} >Send</Button>
                </div>
            </Modal>


            <Modal wrapClassName='ModalDiag' title="Transaction Confirm" width='600px' visible={isModalTransVisible} onCancel={handleCancel}>
            <p><span>Send：</span> <a>{typeof address != 'undefined' ? address.slice(0, 4) :''}****{typeof address != 'undefined' ? address.slice(address.length - 4, address.length):''}</a></p>
            <p><span>Receive：</span> <a>{receiveAddress}</a></p>
            <p><span>Total amount：</span> <a>{tokenAccount}</a></p>
            <p><span>Transaction  Fee：</span> <a>{gasfees}</a></p>
            <div className='modal_footer'>
                <Button onClick={handleCancel} className='Cancel'>Cancel</Button>
                <Button onClick={SendToken} className='Confirm'>Confirm</Button>
            </div>
            </Modal>

            <Modal wrapClassName='ModalDiag' title="Input Password" width='600px' visible={isModalPasswordVisible} onCancel={handleCancel}>
            <Input type='password'  onChange={exportPasswordChange}   placeholder="Enter Password" className='_address_input'></Input>
            <div className='modal_footer'>
                <Button onClick={exportConfirm} className='Confirm'>Confirm</Button>
            </div>
            </Modal>


            <Modal wrapClassName='ModalDiag' title="Transaction Confirmation" width='600px' visible={isModalVisibleLoading} onCancel={handleCancelLoading}>
                    <div className={isLoding==0?'loding madelHide':'loding '}>
                    <img src={Loding}></img>
                    </div>
                    <div className={isLoding==1?'success madelHide':'success '}>
                    <img src={Success}></img>
                    </div>
                    <div className={isLoding==2?'success madelHide':'success '}>
                    <img src={Error}></img>
                    <p> Please try again.</p>
                    </div>

            </Modal>
        </div>

        

    )
}
const mapDispatchToProps = (dispatch) => { 
   return {
    setAccount:(account) => dispatch(setAccount(account)),
    setAddress:(address) => dispatch(setAddress(address)),
    setethAddress:(ethAddress) => dispatch(setethAddress(ethAddress)),
    setSeed:(seed) => dispatch(setSeed(seed)),
    }
}
const mapStateToProps = (state) => {
    return { 
        account: state.account ,
        address: state.address,
        ethAddress:state.ethAddress,
        seed:state.seed
    }
}  
export default  connect(mapStateToProps,mapDispatchToProps)(UserInfo)
