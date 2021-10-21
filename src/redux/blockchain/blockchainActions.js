import Web3 from 'web3'
import SmartContract from '../../contracts/SmartContract.json'
import { fetchData } from '../data/dataActions'

const connectRequest = () => {
  return {
    type: 'CONNECTION_REQUEST',
  }
}

const connectSuccess = (payload) => {
  return {
    type: 'CONNECTION_SUCCESS',
    payload: payload,
  }
}

const connectFailed = (payload) => {
  return {
    type: 'CONNECTION_FAILED',
    payload: payload,
  }
}

const updateAccountRequest = (payload) => {
  return {
    type: 'UPDATE_ACCOUNT',
    payload: payload,
  }
}

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest())
    if (window.ethereum) {
      let web3 = new Web3(window.ethereum)
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        const networkId = await window.ethereum.request({
          method: 'net_version',
        })
        if (networkId == 4) {
          //rinkeby network id
          const SmartContractObj = new web3.eth.Contract(
            SmartContract.abi,
            '0xD2E15F0D2B6D9082b4fEbCE16932d2ac28A4fAdA', //contract address
          )
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: SmartContractObj,
              web3: web3,
            }),
          )
          window.ethereum.on('accountsChanged', (accounts) => {
            dispatch(updateAccount(accounts[0]))
          })
          window.ethereum.on('chainChanged', () => {
            window.location.reload()
          })
        } else {
          dispatch(connectFailed('Change network to Rinkeby.'))
        }
      } catch (err) {
        dispatch(connectFailed('Something went wrong. Please try again.'))
      }
    } else {
      dispatch(connectFailed('Install Metamask.'))
    }
  }
}

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }))
    dispatch(fetchData(account))
  }
}
