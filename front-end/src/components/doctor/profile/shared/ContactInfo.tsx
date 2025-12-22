import React from "react";
import { Phone, Mail, MapPin, Calendar, User, AlertCircle } from "lucide-react";

interface ContactInfoProps {
  label: string;
  value?: string | number | null;
  icon?: React.ReactElement;
}

const getIconComponent = (label: string): React.ReactElement => {
  switch (label.toLowerCase()) {
    case "phone":
    case "emergency contact phone":
      return <Phone size={18} />;
    case "email":
    case "email address":
      return <Mail size={18} />;
    case "address":
    case "city":
      return <MapPin size={18} />;
    case "date of birth":
      return <Calendar size={18} />;
    case "emergency contact name":
      return <User size={18} />;
    case "age":
      return <User size={18} />;
    default:
      return <AlertCircle size={18} />;
  }
};

export const ContactInfo: React.FC<ContactInfoProps> = ({
  label,
  value,
  icon,
}) => {
  if (!value && value !== 0) return null;

  const displayIcon = icon || getIconComponent(label);

  return (
    <div className="flex items-center gap-3 p-3 bg-rose-50/70 rounded-lg">
      <div className="text-rose-500 flex-shrink-0">{displayIcon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-gray-700 font-semibold">{String(value)}</p>
      </div>
    </div>
  );
};