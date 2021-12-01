import { XCircleIcon, XIcon } from '@heroicons/react/solid'

export default function ErrorAlert({ message, handleDismiss }) {
    return (
        <div className="rounded-md bg-red-50 p-4 z-20">
            <div className="flex">
                <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{message}</h3>
                    {/*<div className="mt-2 text-sm text-red-700">
                        <ul role="list" className="list-disc pl-5 space-y-1">
                            <li>Your password must be at least 8 characters</li>
                            <li>Your password must include at least one pro wrestling finishing move</li>
                        </ul>
    </div>*/}
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                        >
                            <span className="sr-only">Dismiss</span>
                            <XIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}