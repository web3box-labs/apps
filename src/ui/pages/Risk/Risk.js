import React, {useEffect } from "react";
import './Risk.scss';
import { connect } from 'react-redux';
import { setAccount, setPrivateKey} from '../../store/action';
import { useNavigate } from 'react-router-dom';
import riks_logo from '../../images/risk_logo.png';

const Risk = (props) => {
    const { account,privateKey} = props;
    const Navigate = useNavigate();

    useEffect(()=>{
       

    },[])

    return (
        <div className='Risk'  >
            <div className='user_Risk'>
                <img src={riks_logo}></img>
                <span><br></br>Risk Assessment<br/>
                For Polkadot Ecosystem Projects<br/>
                Coming Soon......</span>
            </div>
        </div>

        

    )
}
const mapDispatchToProps = (dispatch) => { 
   return {
    setAccount:(account) => dispatch(setAccount(account)),
    setPrivateKey:(privateKey) => dispatch(setPrivateKey(privateKey)),
    }
}
const mapStateToProps = (state) => {
    return { 
        account: state.account ,
        privateKey:state.privateKey,
    }
}  
export default  connect(mapStateToProps,mapDispatchToProps)(Risk)
