import React, { useState } from "react";
import './PrivateWallet.scss';
//react-redux
import { connect } from 'react-redux';
import { setAccount, setSeed ,setethAddress} from '../../store/action';
import { useNavigate } from 'react-router-dom';
import Top from '../../images/spile_left.png';
import { Button,Input,Modal } from 'antd';

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
      
      
      const seed=(e)=>{
          console.log(e.target.value)
          setSeedValue(e.target.value)
      }
      const Secret=async()=>{
    //     if(!newpasswords){
    //         message.error(`Wrong Password！`);
    //         return;
    //     }
    //       seedWasmAddressByPrivatekey(seedValue,newpasswords).then(keys => {
    //       dispatch(setAccount(keys.address))
    //       dispatch(setAddress(keys.address))
    //       dispatch(setPrivateKey(encrypt(keys.private_hexstring,newpasswords)))
    //       Navigate('/Dashboard');
    //   });
    }
    return (
        <Modal wrapClassName='LoginWallet' width='700px' visible={isModalVisible} onCancel={handleCancel}>
            <div className='LoginWallet_c'>

                <div>

                       <div className='_password'>
                       <span>Private key</span>
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
