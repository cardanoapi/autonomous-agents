/* eslint-disable @next/next/no-sync-scripts */
import React from 'react';

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

import { Provider } from 'jotai';
// import '@uiw/react-markdown-preview/dist/markdown.min.css';
// import '@uiw/react-markdown-preview/esm/styles/markdown.css';
// import '@uiw/react-md-editor/dist/mdeditor.min.css';
// import 'katex/dist/katex.min.css';
// import 'react-phone-input-2/lib/style.css';
import 'nprogress/nprogress.css';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'vanilla-cookieconsent/dist/cookieconsent.css';

import '@app/assets/css/globals.css';
import '@app/assets/css/tailwind.css';
import ModalContainer from '@app/components/Modals/container';
import SideNav from '@app/components/layout/SideNav/SideNav';
import TopNav from '@app/components/layout/TopNav';
import environments from '@app/configs/environments';
import ThemeProvider from '@app/shared/hocs/ThemeProvider';
import ReactQueryProvider from '@app/utils/providers/ReactQueryProvider';
import NextNProgress from '@app/views/atoms/NextNProgress';

// const inter = Inter({ subsets: ['latin'] });
// const queryClient = new QueryClient();

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['100', '200', '400', '500', '600', '700', '800'],
    display: 'swap'
});

export const metadata: Metadata = {
    title: 'Cardano AAT',
    description: 'Cardano Autonomous Agent Testing'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="">
            <head>
                {process.env.NEXT_PUBLIC_UMAMI_ENABLED ? (
                    <script
                        defer
                        src="/script.js"
                        data-website-id="4a162fd2-d6ec-403e-8a69-7927e2f0db3f"
                    ></script>
                ) : (
                    <></>
                )}
                {embedApmScript()}
            </head>
            <body className={poppins.className}>
                <ThemeProvider>
                    <NextNProgress
                        color="#0764EB"
                        startPosition={0}
                        stopDelayMs={400}
                        height={2}
                        options={{ easing: 'ease' }}
                    />
                    <ToastContainer
                        position="bottom-center"
                        autoClose={5000}
                        hideProgressBar
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss={false}
                        draggable
                        pauseOnHover={false}
                        theme="dark"
                    />
                    <Provider>
                        <ReactQueryProvider>
                            <Toaster />
                            <div className="w-dvh flex h-dvh bg-brandDefault">
                                <SideNav
                                    desktopClassName={
                                        'hidden md:flex w-[256px] 3xl:w-[290px]'
                                    }
                                />
                                <div
                                    className={
                                        'flex h-full w-full flex-col gap-4 px-6 md:pt-10 py-2 2xl:px-8 pb-4'
                                    }
                                >
                                    <TopNav className={"mb-4"}/>
                                    {children}
                                </div>
                            </div>
                            <ModalContainer />
                        </ReactQueryProvider>
                    </Provider>
                </ThemeProvider>
            </body>
        </html>
    );
}

function embedApmScript() {
    const config = {
        serviceName: 'autonomous-agents-webapp',
        serverUrl: '/',
        environment: environments.IS_IN_PRODUCTION_MODE
            ? environments.network
            : 'local',
        serverUrlPrefix: '/status'
    };
    const htmlStr = 'elasticApm.init(' + JSON.stringify(config) + ')';
    return process.env.NEXT_PUBLIC_APM_ENABLED ? (
        <>
            {/* <script
                src="https://unpkg.com/@elastic/apm-rum@5.16.1/dist/bundles/elastic-apm-rum.umd.min.js"
                crossOrigin={'anonymous'}
            /> */}

            <script src="/scripts/auth.js" crossOrigin={'anonymous'} />
            <script dangerouslySetInnerHTML={{ __html: htmlStr }} />
        </>
    ) : (
        <></>
    );
}
