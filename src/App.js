import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { connect } from './redux/blockchain/blockchainActions'
import { fetchData } from './redux/data/dataActions'
import * as s from './styles/globalStyles'
import styled from 'styled-components'
import Web3 from 'web3'
import Navbar from './components/Navbar'
const { NFTUris } = require('./NFTUris.js')

export const StyledButton = styled.button`
  border-radius: 4px;
  background: firebrick;
  padding: 10px 22px;
  color: #fff;
  outline: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  &:hover {
    transition: all 0.2s ease-in-out;
    background: #fff;
    color: #010606;
  }
`
const Input = styled.input`
  padding: 0.5em;
  margin: 0.5em;
  color: black;
  background: papayawhip;
  border: none;
  border-radius: 3px;
`

function App() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [mintCount, setMintCount] = useState('1')

  const dispatch = useDispatch()
  const blockchain = useSelector((state) => state.blockchain)
  const totalItems = 10000

  useEffect(() => {
    if (blockchain.account !== '' && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account))
    }
  }, [blockchain.smartContract, dispatch])

  const Initiatemint = () => {
    if (!isNaN(parseInt(mintCount))) {
      mint()
    } else {
      setLoading(false)
      setStatus('Please pass a number to the input')
    }
  }
  const spliceUri = (parseUri) => {
    var arr = parseUri.split('/')
    return arr[5]
  }

  const mint = () => {
    try {
      setLoading(true)
      setStatus('Begun minting process')
      blockchain.smartContract.methods
        .GetPrice()
        .call()
        .then((tokenPrice) => {
          blockchain.smartContract.methods
            .GetAllExistingTokens()
            .call()
            .then((receipt) => {
              let existingUri = receipt.map((a) => a.uri)
              if (existingUri.length >= totalItems) {
                setLoading(false)
                setStatus('All possible Tokens minted')
                return
              }
              const selectedUris = []
              var parsedExistingUriArr = existingUri.map((s) => spliceUri(s))
              for (var i = 0; i < parseInt(mintCount); i++) {
                var uri = NFTUris[Math.floor(Math.random() * totalItems)]
                while (parsedExistingUriArr.includes(uri)) {
                  uri = NFTUris[Math.floor(Math.random() * totalItems)]
                }
                selectedUris.push(uri)
              }

              blockchain.smartContract.methods
                .CreateMultipleCollectibles(blockchain.account, selectedUris)
                .estimateGas({
                  from: blockchain.account,
                  value: tokenPrice,
                })
                .then(function (gasAmount) {
                  blockchain.smartContract.methods
                    .CreateMultipleCollectibles(
                      blockchain.account,
                      selectedUris,
                    )
                    .send({
                      from: blockchain.account,
                      value: tokenPrice * parseInt(mintCount),
                      gas: gasAmount,
                    })
                    .once('error', () => {
                      setLoading(false)
                      setStatus('Transaction rejected')
                    })
                    .then(() => {
                      setLoading(false)
                      setStatus('Success')
                    })
                    .catch((err) => {
                      setLoading(false)
                      setStatus('Something went wrong. Please try again')
                      console.log(err)
                    })
                })
                .catch((err) => {
                  setLoading(false)
                  setStatus(
                    'Something went wrong. Please try again (Verify that you have enough funds in wallet to initate this transaction).',
                  )
                  console.log(err)
                })
            })
        })
    } catch (error) {
      setLoading(false)
      setStatus(error)
    }
  }

  return (
    <s.Screen>
      <Navbar />
      {blockchain.account === '' || blockchain.smartContract === null ? (
        <s.Container flex={1} ai={'center'} jc={'center'}>
          <s.TextTitle>Connect to the Blockchain</s.TextTitle>
          <s.SpacerSmall />
          <StyledButton
            onClick={(e) => {
              e.preventDefault()
              dispatch(connect())
            }}
          >
            CONNECT
          </StyledButton>
          <s.SpacerSmall />
          {blockchain.errorMsg !== '' ? (
            <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
          ) : null}
        </s.Container>
      ) : (
        <s.Container
          flex={1}
          ai={'center'}
          jc={'center'}
          style={{ padding: 24 }}
        >
          {loading ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: 'center' }}>
                Loading....
              </s.TextDescription>
            </>
          ) : null}
          {status !== '' ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: 'center' }}>
                {status}
              </s.TextDescription>
            </>
          ) : null}
          <s.SpacerLarge />
          <Input
            type="number"
            value={mintCount}
            onChange={(e) => {
              if (e.target.value > 0) {
                setMintCount(e.target.value)
              } else {
                e.target.value = 1
              }
            }}
          ></Input>
          <s.SpacerSmall />
          <StyledButton
            onClick={(e) => {
              e.preventDefault()
              Initiatemint()
            }}
          >
            MINT
          </StyledButton>
          <s.SpacerLarge />
        </s.Container>
      )}
    </s.Screen>
  )
}

export default App
