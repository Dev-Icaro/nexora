type FormErrorProps = {
  message: string;
};

export function FormError({ message }: FormErrorProps) {
  return <p className="text-sm font-medium text-destructive bg-destructive/20 p-1 rounded-sm">{message}</p>;
}
