'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, User } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  avatar?: string;
  [key: string]: any;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string, option: Option) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: Option) => {
    onChange(option.id, option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-xl
          bg-white/5 backdrop-blur-md border border-white/10
          text-slate-100 text-sm font-medium
          shadow-2xl hover:bg-white/10 hover:border-white/20
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900
          transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.avatar ? (
                <img
                  src={selectedOption.avatar}
                  alt={selectedOption.name}
                  className="w-6 h-6 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-sky flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
              {selectedOption.name}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto rounded-xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-md"
          >
            <div className="p-1">
              {options.map((option) => {
                const isSelected = option.id === value;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      text-left text-sm transition-all duration-200
                      hover:bg-primary/20 hover:border hover:border-primary/30
                      ${isSelected ? 'bg-primary/20 text-white' : 'text-slate-100'}
                    `}
                  >
                    {/* Avatar/Icon */}
                    {option.avatar ? (
                      <img
                        src={option.avatar}
                        alt={option.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-sky flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Name */}
                    <span className="flex-1 truncate font-medium">
                      {option.name}
                    </span>

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </button>
                );
              })}

              {options.length === 0 && (
                <div className="px-4 py-6 text-center text-slate-400 text-sm">
                  No options available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
