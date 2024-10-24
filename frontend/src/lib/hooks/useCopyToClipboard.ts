import { SuccessToast } from '@app/components/molecules/CustomToasts';

export const useCopyClipboard = () => {
    const copyToClipboard = async (text: string, toastMsg: string) => {
        try {
            await navigator.clipboard.writeText(text);
            SuccessToast(toastMsg);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    return { copyToClipboard };
};
