import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { Jazzicon } from '@ukstv/jazzicon-react';
import { displayAddress } from './utils';

export default function ConnectButton() {
    const [account, setAccount] = useState({ address: 0, balance: 0 });

    let provider;

    window.ethereum.on('accountsChanged', function (accounts) {
        activateBrowserWallet();
    })

    function handleConnectWallet() {
        console.log("handling connect wallet")
        activateBrowserWallet();
    }

    async function changeAccounts() {
        await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [
                {
                    eth_accounts: {}
                }
            ]
        });
    }

    async function activateBrowserWallet() {
        if (window.ethereum) {
            try {
                console.log('eth_request_accounts')
                const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log('eth_request_accounts completed')

                provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                let balance = await provider.getBalance(address);
                console.log(address, balance)
                setAccount({ address, balance })
            } catch (error) {
                console.log(error)
            }
        }
    }

    return account.address ? (
        <div onClick={changeAccounts} className="px-2 bg-gray-300 shadow rounded-lg overflow-hidden py-1">
            <div className="px-2 py-1 mr-1 text-gray-500 inline-block align-middle">{`${(+ethers.utils.formatEther(account.balance)).toFixed(4)} ETH`}</div>
            <div className="px-2 py-1 bg-gray-100 text-gray-500 shadow rounded-lg overflow-hidden inline-block align-middle">
                {
                    displayAddress(account.address)
                }
                <div className="inline-block align-middle ml-1 mb-2" style={{ width: '1rem', height: '1rem' }}>
                    <Jazzicon address={account.address} />
                </div>
            </div>
        </div>
    ) : (
        <button onClick={handleConnectWallet} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 sm:w-auto sm:text-sm">Connect Wallet</button>
    )
}