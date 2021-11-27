/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from 'react'
import { Disclosure } from '@headlessui/react'
import { ethers } from "ethers";
import axios from 'axios'
import NFTItem from './NFTItem';
import NFTForm from './NFTForm';
import ConnectButton from './ConnectButton';


import {
    nftaddress, nftmarketaddress
} from './config'

import NFT from './artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from './artifacts/contracts/NFTMarket.sol/NFTMarket.json'

/*
const IMG_URL1 = "https://static01.nyt.com/images/2021/03/11/arts/11nft-auction-cryptopunks2/11nft-auction-cryptopunks2-jumbo.jpg";
const IMG_URL2 = "https://lh3.googleusercontent.com/y3-W6sk12vw138ZhaWLYUZLnlFgTAqiD5msQxitv6Rw4Gs0Z0kfMxxqa2zOA3GkqL93HZ75njMBBpGuB5FRvEzMK1jdjgykYScR7=w600";
const IMG_URL3 = "https://lh3.googleusercontent.com/fHfq1USd7Wd7do01aVRtJh0rxaLbTuE-QpjitZaf3tOiI2hr8uLiCYPFsTBwzxEhLcR_4ogCimNOapovovzlkLbDxB9yhMl0B_yKpQ=w600";
const IMG_URL4 = "https://lh3.googleusercontent.com/9fCTuUfwLsCNdyq7fHFV7DcSR79vKgqPUxyBN3_yv_40D-cUIJYSHXXFHefYxDc4FcnMvARpFIOvkmrjjCrI3ErZ6ejmOrJG65vsiQ=w600";

const nft_items = [
    { id: 1, imageSrc: IMG_URL1, href: "#", name: "Bunky 1", description: "NFT Item 1", seller: "0xB0Ce...7359", price: "0.1" },
    { id: 2, imageSrc: IMG_URL2, href: "#", name: "Bunky 2", description: "NFT Item 2 blaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", seller: "0xB0Ce...7359", price: "0.2" },
    { id: 3, imageSrc: IMG_URL3, href: "#", name: "Bunky 3", description: "NFT Item 3. This one features more text just to get an idea of a larger description ", seller: "0xB0Ce...7359", price: "0.3" },
    { id: 4, imageSrc: IMG_URL4, href: "#", name: "Bunky 4", description: "NFT Item 4", seller: "0xB0Ce...7359", price: "0.4" }
]
*/

const getRandomInt = (max) => Math.floor(Math.random() * max)


export default function App() {

    const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [parentItem, setParentItem] = useState(null);

    useEffect(() => {
        loadNFTs()
    }, [])

    async function loadNFTs() {
        // create a generic provider and query for unsold market items
        const provider = new ethers.providers.JsonRpcProvider()
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider)
        const data = await marketContract.fetchMarketItems()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                itemId: i.itemId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
                depth: getRandomInt(3),
                allow_children: i.allow_children
            }
            return item
        }))

        //console.log(items);
        setNfts(items)
        //setNfts(nft_items)
        setIsLoaded(true);
    }

    return (
        <>
            <div className="min-h-full">
                <Disclosure as="nav" className="bg-gray-100">
                    {({ open }) => (
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center">
                                    <div className="flex-nowrap">
                                        <span className="h-8 text-2xl text-green-600">NFTree</span>
                                    </div>
                                </div>
                                <div className="md:block">
                                    <ConnectButton />
                                </div>
                            </div>
                        </div>
                    )}
                </Disclosure>

                <header className="">
                    <div className="flex max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 justify-center">
                        <button onClick={() => setIsNFTModalOpen(true)} type="button" className="self-center w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 sm:w-auto sm:text-sm">Create a NFTree</button>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="px-4 py-4 sm:px-0">
                            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-4">
                                {
                                    isLoaded ?
                                        (
                                            nfts.length ?
                                                nfts.map((nft, ndx) => <NFTItem key={ndx} {...nft} setIsNFTModalOpen={setIsNFTModalOpen} setParentItem={setParentItem} />)
                                                :
                                                <h3>No NFTs availble on the market. Create one to get started</h3>
                                        )
                                        :
                                        (
                                            <h3>Loading NFTs ...</h3>
                                        )
                                }
                            </div>
                        </div>
                    </div>

                    <NFTForm open={isNFTModalOpen} setOpen={setIsNFTModalOpen} parentItem={parentItem} setParentItem={setParentItem} />

                </main>
            </div>
        </>
    )
}

/*
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    // create a generic provider and query for unsold market items
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }
  async function buyNft(nft) {
    // needs the user to sign the transaction, so will use Web3Provider and sign it
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    // user will be prompted to pay the asking proces to complete the transaction
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  */