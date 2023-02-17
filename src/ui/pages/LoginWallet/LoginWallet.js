import React, { useState } from "react";
import './LoginWallet.scss';
//react-redux
import { connect } from 'react-redux';
import { setAccount, setSeed ,setethAddress, setAddress} from '../../store/action';
import { seedCreateAddress,saveAccountsCreate} from "../../../substrate/polkadot.js";
import { useNavigate } from 'react-router-dom';
import Top from '../../images/spile_left.png';
import { Button, message,Input,Modal } from 'antd';
const { TextArea } = Input;


function LoginWallet(props){
    const { setAccount,setethAddress, dispatch} = props
    const [isModalVisible, setIsModalVisible] = useState(true);
    
    const [tabType, setTabType] = useState(true);
    const [filesContent, setFilesContent] = useState('')
    const [fileName, setFileName] = useState('')
    const [passwords, setPasswords] = useState('')
    const [newpasswords, setNewpasswords] = useState('')
    const [seedValue, setSeedValue] = useState('')
    const [loadings, setLoadings] = useState(false);
    
    const Navigate = useNavigate();
    const outWalletRouter = () => {
      Navigate('/Wallet')
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const WalletHomeRouter = () => {
        Navigate('/WalletHome')
      };
    
    
      const PassClick=(e)=>{
        setPasswords(e.target.value);
      }
      const newPassClick=(e)=>{
        setNewpasswords(e.target.value);

      }
      const ConfirmLogin= async()=>{
        setLoadings(true)
        if(!filesContent){
            message.error(`Not upload File!`);
            setLoadings(false)
            return;
        }
        if(!passwords){
            message.error(`Wrong Password！`);
             setLoadings(false)
            return;
        }
        let ps4 = {
            'json':JSON.parse(filesContent),
            'newPass':passwords
          }
      }
      
      const seed=(e)=>{
          console.log(e.target.value)
          setSeedValue(e.target.value)
      }
      const Secret=async()=>{
        if(!newpasswords){
            message.error(`Wrong Password！`);
            return;
        }
        let keys = seedCreateAddress(seedValue);
        let genesisHash = '';
        saveAccountsCreate(genesisHash, 'xxx',seedValue,keys.address, newpasswords);


        console.log(keys.address);
        console.log(keys.ethaddress);
        dispatch(setAccount(keys.account))
        dispatch(setAddress(keys.address))
        dispatch(setethAddress(keys.ethaddress))
        Navigate('/Dashboard');
    }
    return (
        <Modal wrapClassName='LoginWallet' width='700px' visible={isModalVisible} onCancel={handleCancel}>
            <div className='LoginWallet_c'>
                <div>
                       <div className='_password'>
                       <span>seed words</span>
                        <TextArea onChange={seed} rows={6}  ></TextArea>
                        </div>
              
                        <div className='_password'>
                        <span>Enter password</span>
                        <Input type='password'  placeholder='PassWord' onChange={newPassClick}></Input>
                        </div>
                        <div className='Confirm_c'>
                        <Button onClick={outWalletRouter} src={Top} className='Cancel'>Cancel</Button>
                            <Button onClick={Secret} className='Confirm'>Confirm</Button>
                        </div>
                </div>


            </div>
        </Modal>

    )
}
const mapDispatchToProps = () => {
    return {
        setAccount,
        setSeed,
        setethAddress
    }
}
export default connect(mapDispatchToProps)(LoginWallet)
