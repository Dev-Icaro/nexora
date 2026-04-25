import { type ExternalToast, toast as sonnerToast } from 'sonner';

export type ToastOptions = ExternalToast;

export const toast = {
  success: (message: string, options?: ToastOptions) => sonnerToast.success(message, options),

  error: (message: string, options?: ToastOptions) => sonnerToast.error(message, options),

  info: (message: string, options?: ToastOptions) => sonnerToast.info(message, options),

  warning: (message: string, options?: ToastOptions) => sonnerToast.warning(message, options),

  loading: (message: string, options?: ToastOptions) => sonnerToast.loading(message, options),

  promise: <T>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) =>
    sonnerToast.promise(promise, msgs),

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};
