import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ethers } from "ethers";
import { create as ipfsHttpClient } from 'ipfs-http-client'

import {
  nftaddress, nftmarketaddress
} from './config'

import NFT from './artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from './artifacts/contracts/NFTMarket.sol/NFTMarket.json'


const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function NFTForm({ open, setOpen, parentItem, setParentItem }) {

  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ name: "", description: "", price: "0", royalty_rate: "0", allow_children: false, child_min_royalty_rate: "0", child_royalty_rate: "0" })


  async function onFileUpload(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log("file upload successful", added)
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function createMarketItem() {
    console.log("inside createMarketItem")

    const { name, description, price, royalty_rate, allow_children, child_min_royalty_rate, child_royalty_rate } = formInput
    if (!name || !description || !price || !fileUrl || !royalty_rate || (allow_children && (!child_min_royalty_rate || !child_royalty_rate))) return

    // first, upload to IPFS 
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      // after file is uploaded to IPFS, pass the URL to save it on Polygon 
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function createSale(url) {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const signer = provider.getSigner()

    // next, create the item 
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    // then list the item for sale on the marketplace 
    contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    const { price, royalty_rate, allow_children, child_min_royalty_rate, child_royalty_rate } = formInput

    console.log("createmarketItem", nftaddress, tokenId, price, parentItem, royalty_rate, allow_children, child_min_royalty_rate, child_royalty_rate);

    transaction = await contract.createMarketItem(
      nftaddress,
      tokenId,
      ethers.utils.parseUnits(price, 'ether'),
      parentItem ? parentItem.itemId : 0,
      parseInt(royalty_rate),
      allow_children,
      parseInt(child_min_royalty_rate),
      parseInt(child_royalty_rate),
      { value: listingPrice }
    )

    await transaction.wait()
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={() => { setOpen(false); setParentItem(null); }}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Create a NFTree
                    </Dialog.Title>
                    <div className="mt-2">
                      <form className="space-y-8 divide-y divide-gray-200">
                        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">

                          <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">

                            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                              <label htmlFor="title" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Title
                              </label>
                              <div className="mt-1 sm:mt-0 sm:col-span-2">
                                <input
                                  type="text"
                                  name="title"
                                  id="title"
                                  autoComplete="title"
                                  className="max-w-lg block w-full shadow-sm focus:ring-green-600 focus:border-green-600 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                  onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                              <label htmlFor="about" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Description
                              </label>
                              <div className="mt-1 sm:mt-0 sm:col-span-2">
                                <textarea
                                  id="about"
                                  name="about"
                                  rows={3}
                                  className="max-w-lg shadow-sm block w-full focus:ring-green-600 focus:border-green-600 sm:text-sm border border-gray-300 rounded-md"
                                  defaultValue={''}
                                  onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                                />
                                <p className="mt-2 text-sm text-gray-500">Write something about the piece.</p>
                              </div>
                            </div>

                            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                              <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Media
                              </label>
                              <div className="mt-1 sm:mt-0 sm:col-span-2">
                                <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">




                                  <div className="space-y-1 text-center">
                                    <svg
                                      className="mx-auto h-12 w-12 text-gray-400"
                                      stroke="currentColor"
                                      fill="none"
                                      viewBox="0 0 48 48"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>


                                    {fileUrl && (<p>{fileUrl.length > 20 ? `${fileUrl.slice(0, 6)}...${fileUrl.slice(fileUrl.length - 4, fileUrl.length)}` : fileUrl}</p>)}

                                    <div className="flex text-sm text-gray-600">
                                      <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                                      >
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileUpload} />
                                      </label>
                                      <p className="pl-1">or drag and drop</p>
                                    </div>


                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                  </div>


                                </div>
                              </div>
                            </div>

                            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                              <label htmlFor="price" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Price
                              </label>
                              <div className="mt-1 sm:mt-0 sm:col-span-2">
                                <input
                                  type="text"
                                  name="price"
                                  id="price"
                                  autoComplete="price"
                                  className="max-w-lg block w-full shadow-sm focus:ring-green-600 focus:border-green-600 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                  onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                              <label htmlFor="royaly-rate" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Royalty Rate
                              </label>
                              <div className="mt-1 sm:mt-0 sm:col-span-2">
                                <input
                                  type="text"
                                  name="royalty-rate"
                                  id="royalty-rate"
                                  autoComplete="royalty-rate"
                                  className="max-w-lg block w-full shadow-sm focus:ring-green-600 focus:border-green-600 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                  onChange={e => updateFormInput({ ...formInput, royalty_rate: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5 flex items-center justify-between">
                              <div className="flex items-center col-span-1">
                                <input
                                  id="allow-children"
                                  name="allow-children"
                                  type="checkbox"
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  onChange={e => { updateFormInput({ ...formInput, allow_children: e.target.checked }) }}
                                  checked={formInput.allow_children}
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                  Allow Branches?
                                </label>
                              </div>

                              {
                                formInput.allow_children ? (
                                  <>
                                    <div className="col-span-2">
                                      <label htmlFor="child-royalty-rate" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        Branch Minimum Royalty Requirement
                                      </label>
                                      <div className="mt-1 sm:mt-0 ">
                                        <input
                                          type="text"
                                          name="child-royalty-limit"
                                          id="child-royalty-limit"
                                          autoComplete="child-royalty-rate"
                                          className="max-w-lg block w-full shadow-sm focus:ring-green-600 focus:border-green-600 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                          onChange={e => updateFormInput({ ...formInput, child_min_royalty_rate: e.target.value })}
                                        />
                                        <p className="mt-2 text-sm text-gray-500">A minimum royalty that branches must list with</p>
                                      </div>
                                    </div>

                                    <div className="col-span-2">
                                      <label htmlFor="child-royalty-rate" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        Branch Royalty Rate
                                      </label>
                                      <div className="mt-1 sm:mt-0 ">
                                        <input
                                          type="text"
                                          name="child-royalty-limit"
                                          id="child-royalty-limit"
                                          autoComplete="child-royalty-rate"
                                          className="max-w-lg block w-full shadow-sm focus:ring-green-600 focus:border-green-600 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                          onChange={e => updateFormInput({ ...formInput, child_royalty_rate: e.target.value })}
                                        />
                                        <p className="mt-2 text-sm text-gray-500">The percentage of branch royalties you desire</p>
                                      </div>
                                    </div>

                                  </>
                                ) : null
                              }

                            </div>

                          </div >

                        </div>

                      </form >

                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    ("I should be creating market item now")
                    createMarketItem();
                    setOpen(false);
                    setParentItem(null);
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setOpen(false);
                    setParentItem(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

