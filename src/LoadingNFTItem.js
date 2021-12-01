import { CurrencyDollarIcon, CloudDownloadIcon, StarIcon } from '@heroicons/react/solid'
import { displayAddress } from './utils'

export default function LoadingNFTItem() {

    return (
        <div
            className="animate-pulse border-green-600 group bg-green-600 text-green-600 relative border-2 opacity-10 rounded-lg flex flex-col overflow-hidden"
        >
            <div className="aspect-w-3 aspect-h-4 bg-gray-200 opacity-75 sm:aspect-none sm:h-96 max-h-72">
                <StarIcon className={`w-7 h-7 z-10 absolute top-1 right-1`} />
            </div>
            <div className="divide-y divide-gray-500 bg-gray-200">
                <div className="mt-1 p-2 opacity-100">
                    <div className="flex items-center justify-between text-base font-medium">
                        <p className="text-sm italic ">{displayAddress("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65")}</p>
                        <p className="text-sm italic ">Price</p>
                    </div>
                    <div className="flex items-center justify-between text-base font-medium">
                        <h3>{"NFTree"}</h3>
                        <p>
                            {0.0}
                            <img className="inline-block aligne-middle ml-1 mb-1" src="ethereum.svg" alt="ethereum.svg" width="9px" height="9px" />
                        </p>
                    </div>
                </div>
                <div className="opacity-75">
                    {/* Bottom buttons to buy or branch */}
                    <div className="-mt-px flex divide-x divide-gray-800">
                        <div className="w-0 flex-1 flex">
                            <button
                                className="relative -mr-px w-0 flex-1 bg-gray-200 opacity-75 inline-flex items-center justify-center py-4 text-sm font-medium border border-transparent rounded-bl-lg"
                            >
                                <CurrencyDollarIcon className="w-5 h-5 text-white-400" aria-hidden="true" />
                                <span className="ml-3">Buy</span>
                            </button>
                        </div>

                        <div className="-ml-px w-0 flex-1 flex">
                            <button
                                className="relative w-0 flex-1 bg-gray-200 opacity-75 inline-flex items-center justify-center py-4 text-sm  font-medium border border-transparent rounded-br-lg "
                            >
                                <CloudDownloadIcon className="w-5 h-5 text-white-400" aria-hidden="true" />
                                <span className="ml-3">Branch</span>

                            </button>
                        </div>

                    </div>
                </div>
            </div>

        </div >
    )
}
