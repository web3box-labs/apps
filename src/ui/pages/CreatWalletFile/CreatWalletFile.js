import React, { useContext,useEffect } from "react";
import './CreatWalletFile.scss';
import { connect } from 'react-redux';
import { setAccount, setSeed } from '../../store/action';
// import SuperChain from '../SuperChain/SuperChain'
import Warring from '../../images/warring.png';
import { Button } from 'antd';
import { CreatWalletContext } from '../CreatWallte/CreatWallte'
import { useNavigate } from 'react-router-dom';

const CreatWalletFile = (props) => {
    const { account,address} = props;
    const { seed,password,list } = useContext(CreatWalletContext)
    const seedCODE = seed.split(/\s+/);
    const Navigate = useNavigate();
    const walletHome=()=>{
        Navigate('/Dashboard')
    }

    useEffect(() => {
    }, [])
    return (
        <div className="CreatWalletFile" >
            <div className='CreatWallet_c'>
                <div className='SecretPhrase'>
                    <ul>
                        {
                            seedCODE.map((item, index) => {
                                return <li key={index}><a>{index + 1}</a><span>{item}</span></li>
                            })
                        }
                    </ul>
                </div>
                <h6><img src={Warring}></img>Note: Never disclose this Secret Phrase.</h6>
                <div className='Confirm_c'>
                    <Button onClick={walletHome} className='Confirm'>Confirm</Button>
                </div>
            </div>
        </div>

    )
}
const mapDispatchToProps = () => {
    return {
        setAccount, setSeed
    }
}
const mapStateToProps=(state)=>{
    return {account:state.account,address:state.address}
  }
//Link building rudux
export default connect(mapStateToProps)(CreatWalletFile)
