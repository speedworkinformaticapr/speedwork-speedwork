import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addNotification: (notification: Notification) => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      set({
        notifications: data as Notification[],
        unreadCount: data.filter((n) => !n.is_read).length,
      })
    }
  },

  markAsRead: async (id) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)

    if (!error) {
      set((state) => {
        const updated = state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.is_read).length,
        }
      })
    }
  },

  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (!error) {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }))
    }
  },

  deleteNotification: async (id) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id)

    if (!error) {
      set((state) => {
        const filtered = state.notifications.filter((n) => n.id !== id)
        return {
          notifications: filtered,
          unreadCount: filtered.filter((n) => !n.is_read).length,
        }
      })
    }
  },

  addNotification: (notification) => {
    set((state) => {
      if (state.notifications.some((n) => n.id === notification.id)) return state
      const newNotifs = [notification, ...state.notifications].slice(0, 50)
      return {
        notifications: newNotifs,
        unreadCount: newNotifs.filter((n) => !n.is_read).length,
      }
    })
  },
}))
