'use client'

import { useState } from 'react'
import { Calendar, MapPin, Users, Tag } from 'lucide-react'
import { format } from 'date-fns'

export default function EventCard({ event, onRegister, isRegistered, registerLoading }) {
  const categoryColors = {
    Technical: 'bg-indigo-100 text-indigo-700',
    Cultural: 'bg-amber-100 text-amber-700',
    Sports: 'bg-emerald-100 text-emerald-700',
    Workshop: 'bg-blue-100 text-blue-700',
    Social: 'bg-pink-100 text-pink-700',
    Academic: 'bg-violet-100 text-violet-700',
  }

  const categoryName = event.categories?.name || 'General'
  const colorClass = categoryColors[categoryName] || 'bg-stone-100 text-stone-600'

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg hover:border-stone-200 transition-all duration-300 flex flex-col">

      {event.image_url ? (
        <div className="h-44 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
          <Calendar size={32} className="text-stone-300" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">

        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
            {categoryName}
          </span>
          {event.status === 'ongoing' && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
              🔴 Live
            </span>
          )}
          {event.status === 'completed' && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">
              Completed
            </span>
          )}
        </div>

        <h3 className="font-bold text-stone-900 text-lg leading-snug mb-2 line-clamp-2">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2 mb-4 mt-auto">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <Calendar size={14} className="flex-shrink-0 text-stone-400" />
            <span>{format(new Date(event.date), 'EEE, MMM d · h:mm a')}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <MapPin size={14} className="flex-shrink-0 text-stone-400" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          {event.capacity && (
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <Users size={14} className="flex-shrink-0 text-stone-400" />
              <span>Capacity: {event.capacity}</span>
            </div>
          )}
        </div>

        {event.status !== 'completed' && (
          <button
            onClick={() => onRegister(event.id, isRegistered)}
            disabled={registerLoading}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRegistered
                ? 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600 border border-stone-200'
                : 'bg-stone-900 text-white hover:bg-stone-700'
            }`}
          >
            {registerLoading ? 'Updating...' : isRegistered ? '✓ Registered — Cancel?' : 'Register Now'}
          </button>
        )}

        {event.status === 'completed' && (
          <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-stone-50 text-stone-400 border border-stone-100">
            Event Ended
          </div>
        )}
      </div>
    </div>
  )
}