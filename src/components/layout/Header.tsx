interface HeaderProps {
  title: string;
  subtitle?: string;
  color?: string;
}

export default function Header({ title, subtitle, color }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5">
      <div className="flex items-center gap-3">
        {color && (
          <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
        )}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
