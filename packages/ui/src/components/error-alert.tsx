interface ErrorAlertProps {
  message: string;
  title?: string;
}

export function ErrorAlert({ message, title = 'Something went wrong' }: ErrorAlertProps) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4"
      role="alert"
    >
      <p className="text-sm font-medium text-red-800">{title}</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
    </div>
  );
}
