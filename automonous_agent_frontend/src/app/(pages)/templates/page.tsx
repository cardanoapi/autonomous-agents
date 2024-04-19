import Head from "next/head";
import { SearchField } from "@app/components/atoms/SearchField";
import { DropdownMenu, DropdownMenuTrigger } from "@app/components/atoms/DropDownMenu";
import { Button } from "@app/components/atoms/Button";
import Link from "next/link";


export default function TemplatesPage(){
    return(
        <div>
            <Head>
                <title>Template Form</title>
            </Head>
            <div className="flex justify-between">
             <div className="flex gap-x-4">
                <SearchField variant="secondary" className="w-[240px] h-[40px]" placeholder="Search Templates"></SearchField>
                <DropdownMenu>
                    <DropdownMenuTrigger border={true}>Function</DropdownMenuTrigger>
                </DropdownMenu>
             </div>
             <Link href="/templates/create-template">
             <Button variant="primary" className="h-[36px] w-[145px]">
                Create Template
             </Button>
             </Link>
            </div>
        </div>
    )
}