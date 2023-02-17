import React, { useState, useEffect ,createContext} from "react";
import './CreatWallte.scss';
//react-redux
import { connect } from 'react-redux';
import { setAccount, setAddress, setethAddress} from '../../store/action';
import { useNavigate } from 'react-router-dom';
import Top from '../../images/spile_left.png';
import Warring from '../../images/warring.png';
import CreatWalletFile from '../CreatWalletFile/CreatWalletFile'
import { Button, message,Modal} from 'antd';
import { mnemonicGenerate,seedCreateAddress,saveAccountsCreate} from "../../../substrate/polkadot.js";

export const CreatWalletContext = createContext({});


function CreatWallte(props) {
    const { dispatch } = props
    const Navigate = useNavigate();
    const outWalletRouter = (props) => {
        console.log(props)
        Navigate('/Wallet')
    };
    useEffect(() => {
        
    }, [])

    const [isModalVisible, setIsModalVisible] = useState(true);
    
    const [passwords, setPasswords] = useState('');
    const [passwordv, setPasswordv] = useState('');
    const [styleHiden, setStyleHiden] = useState(false);
    const [seed, setSeed] = useState(false);
    const [list, setlist] = useState([]);
    const [loadings, setLoadings] = useState(false);

    
    const creatAccount = () => {
        if (passwords == passwordv && passwords !== '') {
            let mnemonic = mnemonicGenerate(); 
            let keys = seedCreateAddress(mnemonic);
            let genesisHash = '';
            saveAccountsCreate(genesisHash, 'xxx',mnemonic,keys.address, passwordv);
            dispatch(setAccount(keys.account))
            dispatch(setAddress(keys.address))
            dispatch(setethAddress(keys.ethaddress))
            setSeed(mnemonic)
            setStyleHiden(true);
        }
        else {
            message.error('Failed to set password !');
        }

    }

    const password = (value) => {
        // console.log(value.target.value)
        setPasswords(value.target.value)
    }
    const password_void = (value) => {
        setPasswordv(value.target.value)
        // console.log(value.target.value)

    }
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <Modal wrapClassName='CreatWallet' width='700px' visible={isModalVisible} onCancel={handleCancel}>
            <div className={styleHiden ? 'hide':'show'}>
                <p className="title">Set Password</p>
                {/* <Select className='select_main' defaultValue="1">
                    <Option value="1">Secp Wallet</Option>
                    <Option value="3">BLS Wallet</Option>
                </Select> */}
                <from>
                        <p>New Password</p>
                        <input type='password' placeholder='Password' onChange={password}></input>
                        <p>Confirm password</p>
                        <input type='password' placeholder='Password' onChange={password_void}></input>
                        <h6><img src={Warring}></img>Keep your own password and avoid sharing it to anyone.</h6>
                        <div className='Confirm_c'>
                            <Button onClick={outWalletRouter} src={Top} className='Cancel'>Cancel</Button>
                            <Button onClick={creatAccount} className='Confirm'>Confirm</Button>
                        </div>
                </from>
                
            </div>
           
            <div className={styleHiden==false ? 'hide':'show'}>
                <CreatWalletContext.Provider
                    value={{
                        seed: seed,
                        password:passwordv,
                        list:list
                    }}
                >
                    {
                        styleHiden?<CreatWalletFile></CreatWalletFile>:''
                    }
                </CreatWalletContext.Provider>
            </div>
           
            </Modal>

    )
}

const mapStateToProps=(state)=>{
    return {account:state.account,address:state.address}
  }
export default connect(mapStateToProps)(CreatWallte)
