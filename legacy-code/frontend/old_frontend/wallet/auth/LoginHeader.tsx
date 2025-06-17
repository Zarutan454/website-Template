interface LoginHeaderProps {
  title: string;
  subtitle?: string;
}

export const LoginHeader = ({ title, subtitle }: LoginHeaderProps) => {
  return (
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  );
};