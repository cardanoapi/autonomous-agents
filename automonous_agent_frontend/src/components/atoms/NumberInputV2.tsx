export default function NumberInputV2() {
    return (
        <div
            className="rounded-lg bg-gray-100 px-3 py-2 dark:bg-neutral-700"
            data-hs-input-number=""
        >
            <div className="flex w-full items-center justify-between gap-x-5">
                <div className="grow">
                    <input
                        className="w-full border-0 bg-transparent p-0 text-gray-800 focus:ring-0 dark:text-white"
                        type="text"
                        value="1"
                        data-hs-input-number-input=""
                    />
                </div>
                <div className="flex items-center justify-end gap-x-1.5">
                    <button
                        type="button"
                        className="inline-flex size-6 items-center justify-center gap-x-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                        data-hs-input-number-decrement=""
                    >
                        <svg
                            className="size-3.5 flex-shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M5 12h14"></path>
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="inline-flex size-6 items-center justify-center gap-x-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                        data-hs-input-number-increment=""
                    >
                        <svg
                            className="size-3.5 flex-shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
