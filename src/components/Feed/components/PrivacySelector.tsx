import * as React from 'react';

export type PrivacyOption = 'public' | 'friends' | 'private';

interface PrivacySelectorProps {
  value: PrivacyOption;
  onChange: (value: PrivacyOption) => void;
  disabled?: boolean;
}

const PRIVACY_OPTIONS: { value: PrivacyOption; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: 'Öffentlich', icon: <span role="img" aria-label="Öffentlich">🌍</span> },
  { value: 'friends', label: 'Freunde', icon: <span role="img" aria-label="Freunde">👥</span> },
  { value: 'private', label: 'Privat', icon: <span role="img" aria-label="Privat">🔒</span> },
];

const PrivacySelector: React.FC<PrivacySelectorProps> = ({ value, onChange, disabled }) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (option: PrivacyOption) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-1 px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-100 hover:bg-gray-100 dark:hover:bg-dark-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
      >
        {PRIVACY_OPTIONS.find(opt => opt.value === value)?.icon}
        <span>{PRIVACY_OPTIONS.find(opt => opt.value === value)?.label}</span>
        <svg className="ml-1 w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" /></svg>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-40 bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 rounded shadow-lg" role="listbox">
          {PRIVACY_OPTIONS.map(opt => (
            <li
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-50 ${opt.value === value ? 'font-bold' : ''}`}
              onClick={() => handleSelect(opt.value)}
              role="option"
            >
              {opt.icon}
              <span>{opt.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PrivacySelector; 