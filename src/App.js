import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { connect } from './redux/blockchain/blockchainActions'
import { fetchData } from './redux/data/dataActions'
import * as s from './styles/globalStyles'
import styled from 'styled-components'
import { create } from 'ipfs-http-client'
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

const ipfsClient = create('https://ipfs.infura.io:5001/api/v0')

function App() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [metadatCreation, setMetadataCreation] = useState(false)
  const [mintCount, setMintCount] = useState('1')

  const dispatch = useDispatch()
  const blockchain = useSelector((state) => state.blockchain)
  const ipfsBaseUrl = 'https://ipfs.infura.io/ipfs/'

  useEffect(() => {
    if (blockchain.account !== '' && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account))
    }
  }, [blockchain.smartContract, dispatch])

  const createMetadata = () => {
    try {
      setLoading(true)
      setStatus('Creating Metadata')
      toDataURL(image, useBuffer)
    } catch (err) {
      setLoading(false)
      setStatus('Error')
    }
  }
  const useBuffer = async (imageUri) => {
    const addedImage = await ipfsClient.add(imageUri)
    const metaDataObj = {
      name: name,
      description: description,
      image: ipfsBaseUrl + addedImage.path,
      attributes: [
        {
          trait_type: 'Agility',
          value: Math.floor(1 + Math.random() * (250 - 1)),
        },
        {
          trait_type: 'Strength',
          value: Math.floor(1 + Math.random() * (250 - 1)),
        },
        {
          trait_type: 'Intelligence',
          value: Math.floor(1 + Math.random() * (250 - 1)),
        },
      ],
    }
    const addedMetadata = await ipfsClient.add(JSON.stringify(metaDataObj))
    const tokenUri = ipfsBaseUrl + addedMetadata.path
  }

  const Initiatemint = () => {
    if (!isNaN(parseInt(mintCount))) {
      for (var i = 0; i < parseInt(mintCount); i++) {
        mint()
      }
    } else {
      setLoading(false)
      setStatus('Please pass a number to the input')
    }
  }

  const mint = () => {
    try {
      setLoading(true)
      setStatus('Begun minting process')
      blockchain.smartContract.methods
        .GetAllExistingTokens()
        .call()
        .then((receipt) => {
          let existingUri = receipt.map((a) => a.uri)
          if (existingUri.length >= 30) {
            setLoading(false)
            setStatus('All possible Tokens minted')
            return
          }
          var uri = NFTUris[Math.floor(Math.random() * 30)]
          while (existingUri.includes(uri)) {
            uri = NFTUris[Math.floor(Math.random() * 30)]
          }
          blockchain.smartContract.methods
            .CreateCollectible(blockchain.account, uri)
            .send({
              from: blockchain.account,
              value: Web3.utils.toWei('0.07', 'ether'),
            })
            .once('error', (err) => {
              setLoading(false)
              setStatus('Transaction rejected')
            })
            .then((receipt) => {
              setLoading(false)
              setStatus('Success')
            })
            .catch((err) => console.log(err))
        })
    } catch (error) {
      setLoading(false)
      setStatus(error)
    }
  }

  async function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.open('get', url)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      var fr = new FileReader()

      fr.onload = function () {
        const buffer = Buffer(this.result.split(',')[1], 'base64')
        callback(buffer)
      }

      fr.readAsDataURL(xhr.response) // async call
    }

    xhr.send()
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
              setMintCount(e.target.value)
            }}
          ></Input>
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
