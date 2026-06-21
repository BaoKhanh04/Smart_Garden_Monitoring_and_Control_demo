export interface User {
  id: number
  email: string
  name: string
  role: 'OWNER' | 'MEMBER'
  garden_access: string[]
}

export interface Garden {
  id: string
  name: string
  area_m2: number
  crop_type: string
  description?: string
  cover_image_url: string
  device_count: number
  device_online: number
  created_at: string
}

export interface SensorReading {
  temp: number
  humidity: number
  zone: number
}

export interface RelayStatus {
  mode: 'auto' | 'manual' | 'fallback'
  relays: {
    pump: boolean
    fan: boolean
    light: boolean
    shade: boolean
  }
}

export interface Notification {
  id: string
  level: 'info' | 'warning' | 'critical'
  source: string
  message: string
  timestamp: string
  read: boolean
  suggested_action?: {
    label: string
    route?: string
    device?: string
    state?: number
  }
}

export interface IrrigationSchedule {
  id: string
  time: string
  duration_minutes: number
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED'
  predicted_by: string
  reason: string
}

export interface ThresholdConfig {
  system_mode: 'auto' | 'manual' | 'fallback'
  thresholds: {
    temperature: { min: number; max: number }
    air_humidity: { min: number; max: number }
    soil_moisture: { min: number; max: number }
    ph: { min: number; max: number }
    light_lux: { min: number; max: number }
  }
}

export interface Rule {
  id: string
  name: string
  sensor: string
  operator: '<' | '>' | '=' | '<=' | '>='
  value: number
  device: string
  action: 'ON' | 'OFF'
  enabled: boolean
}

export interface FarmingLogEntry {
  id: string
  type: 'fertilizing' | 'spraying' | 'harvesting' | 'manual_watering'
  label: string
  timestamp: string
  note: string
  sensor_snapshot?: { temp: number; soil_moisture: number; ph: number }
  created_by: string
}

export interface DeviceHealth {
  device_id: string
  name: string
  type: 'sensor' | 'camera' | 'edge_node' | 'service'
  status: 'online' | 'warning' | 'offline'
  rssi?: number
  free_heap_mb?: number
  uptime_hours?: number
  last_seen?: string
}

export interface Recommendation {
  id: string
  category: 'disease' | 'irrigation' | 'temperature' | 'light'
  icon: string
  priority: 'critical' | 'should_do_soon' | 'recommended'
  title: string
  description: string
  quick_action?: {
    label: string
    route?: string
    device?: string
    state?: number
  }
  created_at: string
}

export interface DiseaseScan {
  id: string
  timestamp: string
  image_url: string
  annotated_image_url: string
  detections: { class: string; confidence: number; box: number[] }[]
  status: 'Healthy' | 'Diseased'
  recommendation: string
}

export interface WaterUsageData {
  summary: { total_liters: number; change_pct: number; saved_vs_baseline_pct: number }
  daily: { date: string; liters: number; zone1: number; zone2: number; baseline_liters: number }[]
}

export interface PowerUsageData {
  summary: { total_kwh: number; estimated_cost_vnd: number; change_pct: number }
  by_device: { device: string; label: string; kwh: number; pct: number; abnormal: boolean }[]
  daily: { date: string; kwh: number }[]
}

export interface DiseaseRisk {
  disease: string
  risk_pct: number
  trend_7d: number[]
  factors: { label: string; contribution_pct: number }[]
}

export interface HarvestPrediction {
  garden_id: string
  crop_type: string
  predicted_harvest_date: string
  days_remaining: number
  confidence: 'high' | 'medium' | 'low'
  estimated_yield: string
  growth_stage: string
  growth_stages_completed: string[]
  growth_stages_remaining: string[]
}

export interface GrowthPhoto {
  week: number
  date: string
  image_url: string
  height_cm: number
  leaf_count: number
}

export interface WeatherData {
  current: { temp_c: number; weather_code: string; humidity_pct: number }
  alert: { active: boolean; severity: string; message: string }
  daily: { date: string; weather_code: string; temp_max: number; temp_min: number; rain_chance_pct: number }[]
}

export interface Member {
  id: number
  name: string
  email: string
  role: 'OWNER' | 'MEMBER'
  joined_at: string
  garden_access: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
}
