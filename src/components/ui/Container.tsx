type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: Props) {
  return (
    <div className={`mx-auto w-full max-w-[82rem] px-6 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}
