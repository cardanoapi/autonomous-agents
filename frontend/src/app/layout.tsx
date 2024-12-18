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
                <script
                    defer
                    src="/script.js"
                    data-website-id="4a162fd2-d6ec-403e-8a69-7927e2f0db3f"
                ></script>
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
                            <div className="flex h-full w-full  bg-gradient-to-r from-[#F8F9FC] via-[#F5F5FC] to-[#E9EAF8]">
                                <div className="hidden h-screen min-w-[256px] max-w-[256px] overflow-hidden lg:flex 3xl:min-w-[290px] 3xl:max-w-[290px]">
                                    <SideNav />
                                </div>
                                <div className="max-h-screen flex-grow flex-col overflow-y-auto overflow-x-clip px-[24px] pt-[3%] 2xl:px-[45px] ">
                                    <TopNav />
                                    <div className="mt-10">{children}</div>
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
