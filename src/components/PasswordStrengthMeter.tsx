'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const getStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[@#$%^&+=!]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  
  const getColor = (s: number) => {
    if (s === 0) return 'bg-gray-200';
    if (s === 1) return 'bg-red-500';
    if (s === 2) return 'bg-orange-500';
    if (s === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLabel = (s: number) => {
    if (s === 0) return 'Very Weak';
    if (s === 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-black uppercase italic text-black">Password Strength:</span>
        <span className="text-xs font-black uppercase text-black">{getLabel(strength)}</span>
      </div>
      <div className="h-4 w-full bg-gray-200 border-2 border-black overflow-hidden flex">
        {[1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            initial={{ width: 0 }}
            animate={{ width: strength >= index ? '25%' : '0%' }}
            className={`h-full ${getColor(strength)} ${index < 4 ? 'border-r-2 border-black' : ''}`}
          />
        ))}
      </div>
      <p className="text-[10px] font-bold mt-1 text-black opacity-70">
        Requires 8+ chars, upper/lower, number, and special char (@#$%^&+=!).
      </p>
    </div>
  );
};
