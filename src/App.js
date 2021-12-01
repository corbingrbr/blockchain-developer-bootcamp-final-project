/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from 'react'
import { Disclosure } from '@headlessui/react'
import { ethers } from "ethers";
import axios from 'axios'
import NFTItem from './NFTItem';
import NFTForm from './NFTForm';
import ConnectButton from './ConnectButton';
import LoadingNFTItem from './LoadingNFTItem';
import AlertSuccess from './AlertSuccess';
import AlertError from './AlertError';

import 'react-input-range/lib/css/index.css';
import './App.css';

import {
    nftaddress, nftreemarketaddress
} from './config'

import NFT from './artifacts/contracts/NFT.sol/NFT.json'
import NFTreeMarket from './artifacts/contracts/NFTreeMarket.sol/NFTreeMarket.json'

let provider = new ethers.providers.Web3Provider(window.ethereum, "any");

export default function App() {

    const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [parentItem, setParentItem] = useState(null);
    const [alert, setAlert] = useState(null);
    const [balance, setBalance] = useState(0);
    const [address, setAddress] = useState(null);


    if (!provider) {
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    }

    // Connect wallet functionality
    async function activateBrowserWallet() {
        if (window.ethereum) {
            try {

                const [addr] = await window.ethereum.request({ method: 'eth_requestAccounts' });

                let balance = await provider.getBalance(addr);

                setAddress(addr);
                setBalance(balance);
            } catch (err) {
                setAlert({ isSuccess: false, message: err.message });
            }
        }
    }

    // Update address and balance state upon account change detected
    useEffect(() => {
        async function updateAddressAndBalance(addr) {
            if (addr) {
                let balance = await provider.getBalance(addr);

                setAddress(addr);
                setBalance(balance)
            }
        }

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                const [addr] = accounts;
                updateAddressAndBalance(addr);
            })
        }
    }, []);


    async function loadNFTs() {
        // create a generic provider and query for unsold market items
        if (!provider) { provider = new ethers.providers.Web3Provider(window.ethereum, "any"); }
        //const provider = new ethers.providers.JsonRpcProvider()
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftreemarketaddress, NFTreeMarket.abi, provider)
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
                depth: meta.data.depth,
                allow_children: i.allow_children,
                royalty_rate: i.royalty_rate,
                child_min_royalty_rate: i.child_min_royalty_rate,
                child_royalty_rate: i.child_royalty_rate
            }
            return item
        }))

        setNfts(items);
        setIsLoaded(true);
    }

    // Load NFTs when first hitting page
    useEffect(() => {
        loadNFTs()
    }, [])

    // Setup event listeners
    useEffect(() => {
        async function getWalletBalance(address) {
            if (provider && address) {
                try {
                    setBalance(await provider.getBalance(address))
                } catch (error) {
                    console.log(error)
                }
            }
        }

        const marketContract = new ethers.Contract(nftreemarketaddress, NFTreeMarket.abi, provider);

        if (address) {
            marketContract.filters.MarketItemCreated(address);
        }

        // listen to market item creations
        marketContract.on("MarketItemCreated", async (seller, itemId, nftContract, tokenId) => {

            if (address) {
                getWalletBalance(address);
            }

            try {
                let meta = await getMetaData(tokenId);

                setAlert({
                    isSuccess: true,
                    message: `'${meta.data.name}' is now listed on the market`,
                });
            } catch (err) {
                setAlert({ isSuccess: false, message: err.message })
            }
        }, []);

        if (address) {
            marketContract.filters.MarketItemSale(address, address);
        }

        // Listen to market item sales
        marketContract.on("MarketItemSale", async (buyer, seller, itemId, nftContract, tokenId) => {

            if (address) {
                getWalletBalance(address);
            }

            try {
                let meta = await getMetaData(tokenId);

                setAlert({
                    isSuccess: true,
                    message: `'${meta.data.name}' has been purchased from the market`,
                });
            } catch (err) {
                setAlert({ isSuccess: false, message: err.message })
            }
        });

        // Returns listener clean up function
        return () => {
            marketContract.off("MarketItemCreated");
            marketContract.off("MarketItemSale");
        };
    }, [address])

    // Gets meta data for a given nft's tokenId
    async function getMetaData(tokenId) {
        if (!provider) { provider = new ethers.providers.Web3Provider(window.ethereum, "any"); }

        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

        const tokenUri = await tokenContract.tokenURI(tokenId)
        const meta = await axios.get(tokenUri)

        return meta;
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
                                        <img className="h-6 mb-3 inline-block" src="palm-tree.svg" alt="nftree_logo.png" />
                                        <span className="h-8 text-2xl text-green-600">NFTree</span>
                                    </div>
                                </div>
                                <div className="md:block">
                                    <ConnectButton address={address} balance={balance} handleConnectWallet={() => { activateBrowserWallet() }} />
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
                            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
                                {
                                    isLoaded ?
                                        (
                                            nfts.length ?
                                                nfts.map((nft, ndx) => <NFTItem key={ndx} {...nft} setIsNFTModalOpen={setIsNFTModalOpen} setParentItem={setParentItem} loadNFTs={loadNFTs} setAlert={setAlert} />)
                                                :
                                                null
                                        )
                                        :
                                        (
                                            [0, 0, 0, 0].map((placeholder, ndx) => <LoadingNFTItem key={ndx} />)
                                        )
                                }
                            </div>
                        </div>
                    </div>
                    <div className="fixed inset-x-0 bottom-3 w-90 justify-center content-center">
                        <div className="w-2/6 m-auto">
                            {
                                alert ? (
                                    alert.isSuccess ?
                                        <AlertSuccess message={alert.message} handleDismiss={() => { setAlert(null); }} />
                                        :
                                        <AlertError message={alert.message} handleDismiss={() => { setAlert(null); }} />
                                )
                                    :
                                    null
                            }
                        </div>
                    </div>

                    {
                        isNFTModalOpen &&
                        <NFTForm setOpen={setIsNFTModalOpen} parentItem={parentItem} setParentItem={setParentItem} loadNFTs={loadNFTs} setAlert={setAlert} />
                    }

                </main>
            </div >
        </>
    )
}