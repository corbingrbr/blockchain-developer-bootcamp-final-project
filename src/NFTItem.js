import { CurrencyDollarIcon, CloudDownloadIcon, StarIcon } from '@heroicons/react/solid'
import { displayAddress } from './utils'

const getStarColor = (depth) => `text-${["yellow-400", "gray-200", "yellow-700"][depth]}`

export default function NFTItem({ id, image, href, name, description, seller, price, setIsNFTModalOpen, setCurrentItem, allow_children, depth }) {

    return (
        <div
            key={id}
            className="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden"
        >
            <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-96 max-h-72">
                <StarIcon className={`w-7 h-7 ${getStarColor(depth)} z-10 absolute top-1 right-1`} />
                <img
                    src={image}
                    alt={"blehhh"}
                    className="w-full h-full object-center object-cover sm:w-full sm:h-full"
                />
            </div>
            <div className="divide-y divide-gray-500">
                <div className="mt-1 p-2">
                    <div className="flex items-center justify-between text-base font-medium text-gray-500">
                        <p className="text-sm italic text-gray-500">{displayAddress(seller)}</p>
                        <p className="text-sm italic text-gray-500">Price</p>
                    </div>
                    <div className="flex items-center justify-between text-base font-medium text-gray-700">
                        <h3>{name}</h3>
                        <p>
                            {price}
                            <img className="inline-block aligne-middle ml-1 mb-1" src="ethereum.svg" alt="ethereum.svg" width="9px" height="9px" />
                        </p>
                    </div>
                </div>
                <div>
                    {/* Bottom buttons to buy or branch */}
                    <div className="-mt-px flex divide-x divide-gray-800">
                        <div className="w-0 flex-1 flex">
                            <button

                                className="relative -mr-px w-0 flex-1 bg-gray-100 hover:bg-gray-50 inline-flex items-center justify-center py-4 text-sm text-gray-500 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                            >
                                <CurrencyDollarIcon className="w-5 h-5 text-white-400" aria-hidden="true" />
                                <span className="ml-3">Buy</span>
                            </button>
                        </div>
                        {
                            allow_children && (
                                <div className="-ml-px w-0 flex-1 flex">
                                    <button
                                        onClick={() => setIsNFTModalOpen(true)}
                                        className="relative w-0 flex-1 bg-gray-100 hover:bg-gray-50 inline-flex items-center justify-center py-4 text-sm text-green-600 font-medium border border-transparent rounded-br-lg hover:text-green-500"
                                    >
                                        <CloudDownloadIcon className="w-5 h-5 text-white-400" aria-hidden="true" />
                                        <span className="ml-3">Branch</span>

                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

        </div >
    )
}

