import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Filter, X } from 'lucide-react';
import type { BookingsListProps } from '../../../lib/types/phoneBookingTypes';
import { BookingCard } from './BookingCard';
import { LoadingSpinner, EmptyState } from './phoneBookingComponents';

export const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  loading,
  filterService,
  filterDate,
  filterStatus,
  isFilterActive,
  onFilterServiceChange,
  onFilterDateChange,
  onFilterStatusChange,
  onClearFilters,
  onRefresh,
  onEditBooking,
  onRemoveBooking,
  onStatusUpdate,
  uniqueServices,
  onNavigateToRegister
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0 flex items-center gap-2">
          <Clock className="w-6 h-6 text-rose-500" />
          Bookings
          {bookings.length > 0 && (
            <span className="bg-rose-100 text-rose-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {bookings.length}
            </span>
          )}
        </h2>
        
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterService}
              onChange={(e) => onFilterServiceChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            >
              <option value="all">All Services</option>
              {uniqueServices.filter(service => service !== 'all').map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          
          <input
            type="date"
            value={filterDate}
            onChange={(e) => onFilterDateChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
          />

          {isFilterActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
              type="button"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </motion.button>
          )}

          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-rose-300 transition-colors text-sm flex items-center gap-2"
            type="button"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {loading ? (
            <LoadingSpinner text="Loading bookings..." />
          ) : bookings.length === 0 ? (
            <EmptyState
              description={
                isFilterActive 
                  ? 'No bookings match your filters. Try changing your filters or clear them to see all bookings.' 
                  : 'No bookings found — register one now!'
              }
              action={
                isFilterActive && (
                  <button
                    onClick={onClearFilters}
                    className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    type="button"
                  >
                    Clear Filters
                  </button>
                )
              }
            />
          ) : (
            bookings.map((booking, index) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                index={index}
                onEdit={onEditBooking}
                onRemove={onRemoveBooking}
                onStatusUpdate={onStatusUpdate}
                onNavigateToRegister={() => onNavigateToRegister?.(booking)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};