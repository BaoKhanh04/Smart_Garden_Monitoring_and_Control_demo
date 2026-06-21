import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type {
  Garden, Notification, RelayStatus, ThresholdConfig, Rule,
  FarmingLogEntry, DeviceHealth, Recommendation, DiseaseScan,
  WaterUsageData, PowerUsageData, DiseaseRisk, HarvestPrediction,
  GrowthPhoto, WeatherData, ChatMessage
} from '@/types'
import {
  MOCK_GARDENS, MOCK_NOTIFICATIONS, MOCK_THRESHOLDS,
  MOCK_RULES, MOCK_FARMING_LOGS, MOCK_DEVICES, MOCK_RECOMMENDATIONS,
  MOCK_DISEASE_SCANS, MOCK_WATER_USAGE, MOCK_POWER_USAGE,
  MOCK_DISEASE_RISK, MOCK_HARVEST, MOCK_GROWTH_PHOTOS, MOCK_WEATHER
} from '@/mocks/data'

const ACTIVE_GARDEN_KEY = 'sgmc_active_garden_id'
const THRESHOLDS_KEY = 'sgmc_thresholds_'
const RULES_KEY = 'sgmc_rules_'
const FARMING_LOG_KEY = 'sgmc_farming_log_'
const NOTIFICATIONS_KEY = 'sgmc_notifications_'
const DISMISSED_RECS_KEY = 'sgmc_dismissed_recommendations_'
const MEMBERS_KEY = 'sgmc_members'
const GARDENS_KEY = 'sgmc_gardens'
const CHAT_HISTORY_KEY = 'sgmc_chat_history'

interface AppContextType {
  activeGarden: Garden | null
  gardens: Garden[]
  setActiveGarden: (garden: Garden) => void
  notifications: Notification[]
  unreadCount: number
  markNotificationRead: (id: string) => void
  dismissNotification: (id: string) => void
  relayStatus: RelayStatus
  setRelayStatus: (status: RelayStatus) => void
  thresholds: ThresholdConfig
  updateThresholds: (config: ThresholdConfig) => void
  rules: Rule[]
  addRule: (rule: Rule) => void
  updateRule: (rule: Rule) => void
  deleteRule: (id: string) => void
  farmingLogs: FarmingLogEntry[]
  addFarmingLog: (log: FarmingLogEntry) => void
  deleteFarmingLog: (id: string) => void
  devices: DeviceHealth[]
  recommendations: Recommendation[]
  dismissedRecommendationIds: string[]
  dismissRecommendation: (id: string) => void
  diseaseScans: DiseaseScan[]
  waterUsage: WaterUsageData
  powerUsage: PowerUsageData
  diseaseRisk: DiseaseRisk[]
  harvestPrediction: HarvestPrediction | null
  growthPhotos: GrowthPhoto[]
  weather: WeatherData
  chatHistory: ChatMessage[]
  sendChatMessage: (message: string) => void
  isConnected: boolean
  latestSensorData: Record<string, unknown>
}

const AppContext = createContext<AppContextType | null>(null)

function getGardenId(): string {
  return localStorage.getItem(ACTIVE_GARDEN_KEY) || 'garden_01'
}

function getSavedOrDefault<T>(key: string, defaultVal: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultVal
  } catch {
    return defaultVal
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [gardens, setGardens] = useState<Garden[]>(() => {
    const saved = localStorage.getItem(GARDENS_KEY)
    return saved ? JSON.parse(saved) : MOCK_GARDENS
  })

  const activeGarden = gardens.find(g => g.id === getGardenId()) || gardens[0] || null

  const setActiveGarden = useCallback((garden: Garden) => {
    localStorage.setItem(ACTIVE_GARDEN_KEY, garden.id)
    setGardens(prev => {
      localStorage.setItem(GARDENS_KEY, JSON.stringify(prev))
      return prev
    })
    window.location.reload()
  }, [])

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    getSavedOrDefault(NOTIFICATIONS_KEY + getGardenId(), MOCK_NOTIFICATIONS)
  )
  const [unreadCount, setUnreadCount] = useState(() =>
    getSavedOrDefault(NOTIFICATIONS_KEY + getGardenId(), MOCK_NOTIFICATIONS).filter(n => !n.read).length
  )

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      localStorage.setItem(NOTIFICATIONS_KEY + getGardenId(), JSON.stringify(updated))
      return updated
    })
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      localStorage.setItem(NOTIFICATIONS_KEY + getGardenId(), JSON.stringify(updated))
      return updated
    })
    setUnreadCount(prev => prev)
  }, [])

  const [relayStatus, setRelayStatus] = useState<RelayStatus>(MOCK_RELAY_STATUS)
  const [thresholds, setThresholds] = useState<ThresholdConfig>(() =>
    getSavedOrDefault(THRESHOLDS_KEY + getGardenId(), MOCK_THRESHOLDS)
  )
  const [rules, setRules] = useState<Rule[]>(() =>
    getSavedOrDefault(RULES_KEY + getGardenId(), MOCK_RULES)
  )
  const [farmingLogs, setFarmingLogs] = useState<FarmingLogEntry[]>(() =>
    getSavedOrDefault(FARMING_LOG_KEY + getGardenId(), MOCK_FARMING_LOGS)
  )
  const [devices] = useState<DeviceHealth[]>(MOCK_DEVICES)
  const [recommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS)
  const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<string[]>(() =>
    getSavedOrDefault(DISMISSED_RECS_KEY + getGardenId(), [])
  )
  const [diseaseScans] = useState<DiseaseScan[]>(MOCK_DISEASE_SCANS)
  const [waterUsage] = useState<WaterUsageData>(MOCK_WATER_USAGE)
  const [powerUsage] = useState<PowerUsageData>(MOCK_POWER_USAGE)
  const [diseaseRisk] = useState<DiseaseRisk[]>(MOCK_DISEASE_RISK)
  const [harvestPrediction] = useState<HarvestPrediction | null>(MOCK_HARVEST)
  const [growthPhotos] = useState<GrowthPhoto[]>(MOCK_GROWTH_PHOTOS)
  const [weather] = useState<WeatherData>(MOCK_WEATHER)

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() =>
    getSavedOrDefault(CHAT_HISTORY_KEY + getGardenId(), [])
  )
  const [isConnected, setIsConnected] = useState(false)
  const [latestSensorData, setLatestSensorData] = useState<Record<string, unknown>>({})
  const wsRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Mock WebSocket simulation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsConnected(true)
      let soil1 = 42.0
      let temp1 = 31.5
      let humidity1 = 68.0
      wsRef.current = setInterval(() => {
        soil1 += (Math.random() - 0.5) * 0.8
        temp1 += (Math.random() - 0.5) * 0.3
        humidity1 += (Math.random() - 0.5) * 0.5
        setLatestSensorData({
          dht1: { temp: parseFloat(temp1.toFixed(1)), humidity: parseFloat(humidity1.toFixed(1)), zone: 1 },
          dht2: { temp: 30.2, humidity: 70.1, zone: 2 },
          dht3: { temp: 29.5, humidity: 72.3, zone: 3 },
          light: { lux: Math.floor(25000 + (Math.random() - 0.5) * 1000) },
          soil1: { moisture_pct: parseFloat(Math.max(15, Math.min(80, soil1)).toFixed(1)) },
          soil2: { moisture_pct: 55.4 },
          ph: { ph_value: 6.4 },
          system_health: { plant_score: soil1 < 30 ? 65 : 94, plant_status: soil1 < 30 ? 'Warning' : 'Excellent' }
        })
      }, 3000)
    }, 500)
    return () => {
      clearTimeout(timeout)
      if (wsRef.current) clearInterval(wsRef.current)
    }
  }, [])

  const updateThresholds = useCallback((config: ThresholdConfig) => {
    setThresholds(config)
    localStorage.setItem(THRESHOLDS_KEY + getGardenId(), JSON.stringify(config))
  }, [])

  const addRule = useCallback((rule: Rule) => {
    setRules(prev => {
      const updated = [...prev, rule]
      localStorage.setItem(RULES_KEY + getGardenId(), JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateRule = useCallback((rule: Rule) => {
    setRules(prev => {
      const updated = prev.map(r => r.id === rule.id ? rule : r)
      localStorage.setItem(RULES_KEY + getGardenId(), JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteRule = useCallback((id: string) => {
    setRules(prev => {
      const updated = prev.filter(r => r.id !== id)
      localStorage.setItem(RULES_KEY + getGardenId(), JSON.stringify(updated))
      return updated
    })
  }, [])

  const addFarmingLog = useCallback((log: FarmingLogEntry) => {
    setFarmingLogs(prev => {
      const updated = [log, ...prev]
      localStorage.setItem(FARMING_LOG_KEY + getGardenId(), JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteFarmingLog = useCallback((id: string) => {
    setFarmingLogs(prev => {
      const updated = prev.filter(l => l.id !== id)
      localStorage.setItem(FARMING_LOG_KEY + getGardenId(), JSON.stringify(updated))
      return updated
    })
  }, [])

  const dismissRecommendation = useCallback((id: string) => {
    setDismissedRecommendationIds(prev => {
      const updated = [...prev, id]
      localStorage.setItem(DISMISSED_RECS_KEY + getGardenId(), JSON.stringify(updated))
      return updated
    })
  }, [])

  const sendChatMessage = useCallback((message: string) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    setChatHistory(prev => {
      const updated = [...prev, userMsg]
      localStorage.setItem(CHAT_HISTORY_KEY + getGardenId(), JSON.stringify(updated))
      return updated
    })

    // Simulate AI typing delay
    setTimeout(() => {
      const aiReplies = [
        'Dựa trên dữ liệu cảm biến hiện tại của vườn, tôi khuyên bạn nên kiểm tra độ ẩm đất ở Zone 1 vì chỉ số đang ở mức 42% — gần ngưỡng tối thiểu. Bạn có thể bật máy bơm thủ công trong 10 phút để cải thiện.',
        'Theo mô hình Random Forest, lịch tưới tiếp theo dự kiến vào lúc 16:30 chiều nay. Tuy nhiên, dự báo thời tiết cho thấy có mưa 80% khả năng vào ngày mai — hệ thống có thể sẽ tự điều chỉnh.',
        'Cây cà chua đang ở giai đoạn ra hoa, cần đảm bảo đủ ánh sáng và độ ẩm. Chỉ số BH1750 hiện tại là 25,200 lux — phù hợp cho giai đoạn này.',
        'Nguy cơ bệnh Đốm nâu đang tăng (68%). Khuyến nghị: phun thuốc Mancozeb 50g/lít vào buổi chiều và bật quạt thông gió để giảm độ ẩm không khí xuống dưới 70%.'
      ]
      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'ai',
        content: aiReplies[Math.floor(Math.random() * aiReplies.length)],
        timestamp: new Date().toISOString()
      }
      setChatHistory(prev => {
        const updated = [...prev, aiMsg]
        localStorage.setItem(CHAT_HISTORY_KEY + getGardenId(), JSON.stringify(updated))
        return updated
      })
    }, 1500)
  }, [])

  return (
    <AppContext.Provider value={{
      activeGarden, gardens, setActiveGarden,
      notifications, unreadCount, markNotificationRead, dismissNotification,
      relayStatus, setRelayStatus,
      thresholds, updateThresholds,
      rules, addRule, updateRule, deleteRule,
      farmingLogs, addFarmingLog, deleteFarmingLog,
      devices, recommendations, dismissedRecommendationIds, dismissRecommendation,
      diseaseScans, waterUsage, powerUsage, diseaseRisk,
      harvestPrediction, growthPhotos, weather,
      chatHistory, sendChatMessage,
      isConnected, latestSensorData
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

const MOCK_RELAY_STATUS: RelayStatus = {
  mode: 'manual',
  relays: { pump: true, fan: false, light: false, shade: true }
}
