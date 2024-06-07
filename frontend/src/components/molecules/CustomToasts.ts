import toast from 'react-hot-toast';

export function SuccessToast(msg: string) {
    return toast.success(msg);
}

export function ErrorToast(msg: string) {
    return toast.error(msg, {
        duration: 1000
    });
}
