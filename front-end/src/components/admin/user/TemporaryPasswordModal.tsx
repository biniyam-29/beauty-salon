import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../../ui/button';
import type { User } from '../../../hooks/UseUsers';

interface TemporaryPasswordModalProps {
  user: User & { temporary_password: string };
  onClose: () => void;
  isOpen: boolean;
}

export const TemporaryPasswordModal: React.FC<TemporaryPasswordModalProps> = ({
  user,
  onClose,
  isOpen,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.temporary_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            User Created Successfully!
          </h2>
          <p className="text-gray-600">
            An email with the temporary password has been sent to{' '}
            <strong className="text-rose-600">{user.email}</strong>. 
            For your convenience, the password is shown below.
          </p>
          <p className="text-red-600 font-medium mt-2">
            ⚠️ This will only be shown once.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              User Details
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">{user.role.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Temporary Password
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  readOnly
                  value={user.temporary_password}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg font-mono text-lg tracking-wider"
                />
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopy}
                className="px-4 py-3"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This password must be changed on first login.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};