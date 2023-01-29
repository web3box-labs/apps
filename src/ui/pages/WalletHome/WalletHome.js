import React, { useState, useEffect } from "react";
import './WalletHome.scss';
//react-redux
import { connect, useDispatch, useSelector } from 'react-redux';
import { setAccount, setSeed,setAddress,setethAddress,setUserimg } from '../../store/action';
import { useNavigate } from 'react-router-dom';
import UserInfo from '../UserInfo/UserInfo'
import statu_pending from '../../images/pending.png';
import statu_success from '../../images/success_status.png';
import { Button, Spin ,message,Pagination} from 'antd';
import axios  from 'axios';
const { TransferService }  = require("../../store/transfer");

const WalletHome = (props) => {
    const { account,address,seed} = props;
    const [tabType, setTabType] = useState(true);
    const [lodingL, setLodingL] = useState(false);
    const [record, setRecord] = useState([])
    const Navigate = useNavigate();
    const RecordBtn = () => {
        Navigate('/sendRecord')
    }
   
    const getTransList = async() =>{
        var indexdb = new TransferService();
        var query = indexdb.getTransfers(address).then(res=>{
            setRecord(res)
        });
    }

    const copyHash=(hash)=>{
        let copyContent = hash;
        var input = document.createElement("input");
        input.value = copyContent;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        document.body.removeChild(input);
        message.success('Copy success message');
    }

    const copyhashfilter =(hash) =>{
       return hash.slice(0,4) + "*****" + hash.slice(hash.length - 4, hash.length);
    }
    useEffect(() => {
        getTransList(address);
    }, [address])
    return (
        <div className={account !== '' ? "WalletHome": 'hide'}>
            <UserInfo></UserInfo>
            <div className='LoginWallet_c'>
                <div className={tabType ? 'active' : 'key'}>
                    <ul className='Assets_record'>
                    <div className={lodingL?'Spin_modal':'key'}>
                    <Spin></Spin>
                    </div>
                    <li className='title'>
                            <p>Transaction Hash</p >
                            <p>Time (UTC+0)</p >
                            <p>Token</p >
                            <p>Amount</p >
                            <p>Status</p >
                        </li>
                                                        {/* <img src={statu_pending} ></img> */}
                                                        {
                        record.map((item,index)=>{
                        
                        return  <li key={index}>
                        <p onClick={()=>copyHash(item.hash)}>{ copyhashfilter (item.hash)}</p> 
                        <p>{new Date(parseInt((item.createTime).getTime())).toLocaleString()}</p> 
                        <p>{item.symbols}</p> 
                        <p>{item.balance }</p> 
                        <p ><img src={item.status==1?statu_success:statu_pending} ></img></p> 
                     </li>
                        })
                    }
                    </ul>
                </div>
                

            </div>

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
export default connect(mapStateToProps, mapDispatchToProps)(WalletHome)