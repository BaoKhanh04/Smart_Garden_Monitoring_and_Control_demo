import type {
  Garden, Notification, RelayStatus, ThresholdConfig, Rule,
  FarmingLogEntry, DeviceHealth, Recommendation, DiseaseScan,
  WaterUsageData, PowerUsageData, DiseaseRisk, HarvestPrediction,
  GrowthPhoto, WeatherData
} from '@/types'

export const MOCK_GARDENS: Garden[] = [
  {
    id: 'garden_01',
    name: 'Vườn Sân Thượng',
    area_m2: 6,
    crop_type: 'Rau ăn lá',
    description: 'Khu vườn chính trên sân thượng nhà',
    cover_image_url: 'https://picsum.photos/id/177/400/300',
    device_count: 10,
    device_online: 9,
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'garden_02',
    name: 'Vườn Ban Công',
    area_m2: 2,
    crop_type: 'Cà chua',
    description: 'Ban công hướng nam trồng cà chua bi',
    cover_image_url: 'https://picsum.photos/id/292/400/300',
    device_count: 8,
    device_online: 8,
    created_at: '2026-03-02T00:00:00Z'
  }
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'alert_001',
    level: 'critical',
    source: 'soil1',
    message: 'Độ ẩm đất Zone 1 giảm xuống 14.5% — dưới ngưỡng an toàn (15%)',
    timestamp: '2026-06-21T08:32:00Z',
    read: false,
    suggested_action: { label: 'Bật bơm', device: 'pump', state: 1 }
  },
  {
    id: 'alert_002',
    level: 'warning',
    source: 'disease',
    message: 'AI phát hiện bệnh Đốm nâu (Brown Spot) trên lá cà chua — độ tin cậy 92.5%',
    timestamp: '2026-06-21T08:31:00Z',
    read: false,
    suggested_action: { label: 'Xem ảnh AI', route: '/dashboard/disease-detection' }
  },
  {
    id: 'alert_003',
    level: 'info',
    source: 'system',
    message: 'Lịch tưới tiếp theo dự kiến vào lúc 16:30 chiều nay',
    timestamp: '2026-06-21T08:00:00Z',
    read: true
  },
  {
    id: 'alert_004',
    level: 'warning',
    source: 'weather',
    message: 'Dự báo nắng nóng 39°C vào ngày mai — cân nhắc kéo lưới che nắng sớm',
    timestamp: '2026-06-21T07:00:00Z',
    read: false,
    suggested_action: { label: 'Bật mái che', device: 'shade', state: 1 }
  },
  {
    id: 'alert_005',
    level: 'info',
    source: 'mqtt_broker',
    message: 'MQTT Broker đang offline. Hệ thống đang thử kết nối lại...',
    timestamp: '2026-06-21T07:50:00Z',
    read: false,
    suggested_action: { label: 'Xem thiết bị', route: '/settings/device-health' }
  }
]

export const MOCK_THRESHOLDS: ThresholdConfig = {
  system_mode: 'manual',
  thresholds: {
    temperature: { min: 20, max: 35 },
    air_humidity: { min: 50, max: 80 },
    soil_moisture: { min: 30, max: 70 },
    ph: { min: 6.0, max: 7.0 },
    light_lux: { min: 1000, max: 50000 }
  }
}

export const MOCK_RULES: Rule[] = [
  {
    id: 'rule_001',
    name: 'Tưới tự động khi đất khô',
    sensor: 'soil1',
    operator: '<',
    value: 30,
    device: 'pump',
    action: 'ON',
    enabled: true
  },
  {
    id: 'rule_002',
    name: 'Tắt bơm khi đất đủ ẩm',
    sensor: 'soil1',
    operator: '>',
    value: 70,
    device: 'pump',
    action: 'OFF',
    enabled: true
  },
  {
    id: 'rule_003',
    name: 'Bật quạt khi nhiệt độ cao',
    sensor: 'temperature',
    operator: '>',
    value: 35,
    device: 'fan',
    action: 'ON',
    enabled: false
  }
]

export const MOCK_FARMING_LOGS: FarmingLogEntry[] = [
  {
    id: 'log_001',
    type: 'spraying',
    label: 'Phun thuốc',
    timestamp: '2026-06-21T08:40:00Z',
    note: 'Phun Mancozeb 50g/lít cho khu vực Zone 1 do phát hiện Đốm nâu.',
    sensor_snapshot: { temp: 31.6, soil_moisture: 42.1, ph: 6.4 },
    created_by: 'Nguyễn Thành Đạt'
  },
  {
    id: 'log_002',
    type: 'fertilizing',
    label: 'Bón phân',
    timestamp: '2026-06-18T07:00:00Z',
    note: 'Bón phân NPK 16-16-8, liều 20g/gốc.',
    sensor_snapshot: { temp: 29.8, soil_moisture: 55.0, ph: 6.5 },
    created_by: 'Nguyễn Thành Đạt'
  },
  {
    id: 'log_003',
    type: 'harvesting',
    label: 'Thu hoạch',
    timestamp: '2026-06-15T09:00:00Z',
    note: 'Thu hoạch rau xanh lần đầu, thu được khoảng 300g.',
    sensor_snapshot: { temp: 28.5, soil_moisture: 50.0, ph: 6.3 },
    created_by: 'Trần Thị Lan'
  }
]

export const MOCK_DEVICES: DeviceHealth[] = [
  { device_id: 'dht22_z1', name: 'DHT22 Zone 1', type: 'sensor', status: 'online', rssi: -52, uptime_hours: 168 },
  { device_id: 'dht22_z2', name: 'DHT22 Zone 2', type: 'sensor', status: 'online', rssi: -58, uptime_hours: 168 },
  { device_id: 'bh1750', name: 'BH1750 Ánh sáng', type: 'sensor', status: 'online', rssi: -49, uptime_hours: 168 },
  { device_id: 'soil_z1', name: 'Soil Moisture Zone 1', type: 'sensor', status: 'warning', rssi: -71, uptime_hours: 2.5 },
  { device_id: 'camera_pi', name: 'Camera Pi NoIR v2', type: 'camera', status: 'online', rssi: -55, uptime_hours: 168 },
  { device_id: 'raspberry_pi', name: 'Raspberry Pi 4B', type: 'edge_node', status: 'online', free_heap_mb: 1820, uptime_hours: 720 },
  { device_id: 'mqtt_broker', name: 'MQTT Broker (Mosquitto)', type: 'service', status: 'offline', last_seen: '2026-06-21T07:50:00Z' }
]

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec_001',
    category: 'disease',
    icon: 'Bug',
    priority: 'critical',
    title: 'Xử lý nguy cơ lan bệnh Đốm nâu',
    description: 'AI phát hiện Brown Spot với độ tin cậy 92.5%. Khuyến nghị phun Mancozeb 50g/lít và giảm độ ẩm không khí xung quanh.',
    quick_action: { label: 'Bật quạt ngay', device: 'fan', state: 1 },
    created_at: '2026-06-21T08:31:00Z'
  },
  {
    id: 'rec_002',
    category: 'irrigation',
    icon: 'Droplets',
    priority: 'recommended',
    title: 'Tối ưu lịch tưới Zone 2',
    description: 'Độ ẩm đất Zone 2 ổn định trên ngưỡng, có thể giảm 1 chu kỳ tưới chiều để tiết kiệm nước.',
    quick_action: { label: 'Xem lịch tưới', route: '/dashboard/irrigation' },
    created_at: '2026-06-21T07:00:00Z'
  },
  {
    id: 'rec_003',
    category: 'temperature',
    icon: 'Thermometer',
    priority: 'should_do_soon',
    title: 'Nhiệt độ Zone 1 sắp vượt ngưỡng',
    description: 'Nhiệt độ hiện tại 33.4°C — ngưỡng tối đa là 35°C. Cân nhắc bật quạt hoặc kéo lưới che nắng.',
    quick_action: { label: 'Bật quạt', device: 'fan', state: 1 },
    created_at: '2026-06-21T06:00:00Z'
  },
  {
    id: 'rec_004',
    category: 'light',
    icon: 'Sun',
    priority: 'recommended',
    title: 'Điều chỉnh ánh sáng cho giai đoạn ra hoa',
    description: 'Cây cà chua đang ở giai đoạn ra hoa. Đảm bảo đủ 10-12 giờ ánh sáng mỗi ngày để tối ưu năng suất.',
    created_at: '2026-06-20T12:00:00Z'
  }
]

export const MOCK_DISEASE_SCANS: DiseaseScan[] = [
  {
    id: 'scan_001',
    timestamp: '2026-06-29T08:30:15Z',
    image_url: '/src/assets/lacay.jpg',
    annotated_image_url: '/src/assets/lacay.jpg',
    detections: [
      { class: 'Brown Spot', confidence: 92.5, box: [280, 25, 480, 280] }, // Top-center target rings
      { class: 'Brown Spot', confidence: 89.2, box: [160, 90, 320, 220] },  // Top-left lesion
      { class: 'Brown Spot', confidence: 88.0, box: [220, 310, 640, 510] }, // Bottom-center large lesion
      { class: 'Brown Spot', confidence: 85.4, box: [480, 200, 680, 580] }  // Mid-right vein lesion
    ],
    status: 'Diseased',
    recommendation: 'Phun thuốc Mancozeb (nồng độ 50g/lít) hoặc Chlorothalonil vào buổi chiều mát. Cắt bỏ các lá gốc bị nhiễm nặng để tránh nấm lây lan lên các tầng lá trên. Giảm độ ẩm không khí xung quanh tán lá.'
  },
  {
    id: 'scan_002',
    timestamp: '2026-06-28T17:15:00Z',
    image_url: '/src/assets/lacay1.jpg',
    annotated_image_url: '/src/assets/lacay1.jpg',
    detections: [],
    status: 'Healthy',
    recommendation: 'Cây khỏe mạnh bình thường. Duy trì chế độ chăm sóc và tưới nước tự động theo lịch của vườn.'
  },
  {
    id: 'scan_003',
    timestamp: '2026-06-27T08:00:00Z',
    image_url: '/src/assets/lacay1.jpg',
    annotated_image_url: '/src/assets/lacay1.jpg',
    detections: [],
    status: 'Healthy',
    recommendation: 'Cây sinh trưởng tốt, không có dấu hiệu bệnh hại nấm hay vi khuẩn. Tiếp tục theo dõi định kỳ.'
  }
]


export const MOCK_WATER_USAGE: WaterUsageData = {
  summary: { total_liters: 142.5, change_pct: -8.2, saved_vs_baseline_pct: 27.4 },
  daily: [
    { date: '2026-06-15', liters: 22.0, zone1: 12.0, zone2: 10.0, baseline_liters: 30.0 },
    { date: '2026-06-16', liters: 19.5, zone1: 10.5, zone2: 9.0, baseline_liters: 30.0 },
    { date: '2026-06-17', liters: 21.0, zone1: 11.0, zone2: 10.0, baseline_liters: 30.0 },
    { date: '2026-06-18', liters: 24.0, zone1: 13.0, zone2: 11.0, baseline_liters: 30.0 },
    { date: '2026-06-19', liters: 18.0, zone1: 9.0, zone2: 9.0, baseline_liters: 30.0 },
    { date: '2026-06-20', liters: 20.0, zone1: 10.0, zone2: 10.0, baseline_liters: 30.0 },
    { date: '2026-06-21', liters: 18.0, zone1: 9.5, zone2: 8.5, baseline_liters: 30.0 }
  ]
}

export const MOCK_POWER_USAGE: PowerUsageData = {
  summary: { total_kwh: 14.2, estimated_cost_vnd: 35500, change_pct: 5.1 },
  by_device: [
    { device: 'pump', label: 'Máy bơm', kwh: 3.1, pct: 22, abnormal: false },
    { device: 'fan', label: 'Quạt', kwh: 4.8, pct: 34, abnormal: false },
    { device: 'light', label: 'Đèn LED Grow', kwh: 5.9, pct: 41, abnormal: true },
    { device: 'shade', label: 'Mái che', kwh: 0.4, pct: 3, abnormal: false }
  ],
  daily: [
    { date: '2026-06-15', kwh: 1.9 },
    { date: '2026-06-16', kwh: 2.0 },
    { date: '2026-06-17', kwh: 2.1 },
    { date: '2026-06-18', kwh: 2.3 },
    { date: '2026-06-19', kwh: 1.8 },
    { date: '2026-06-20', kwh: 2.0 },
    { date: '2026-06-21', kwh: 2.1 }
  ]
}

export const MOCK_DISEASE_RISK: DiseaseRisk[] = [
  {
    disease: 'Brown Spot',
    risk_pct: 68,
    trend_7d: [40, 45, 50, 58, 62, 65, 68],
    factors: [
      { label: 'Độ ẩm không khí cao liên tục 6 giờ', contribution_pct: 25 },
      { label: 'Nhiệt độ thuận lợi cho nấm bệnh (28-32°C)', contribution_pct: 15 },
      { label: 'Lịch sử từng phát hiện bệnh trong 14 ngày qua', contribution_pct: 28 }
    ]
  },
  {
    disease: 'Powdery Mildew',
    risk_pct: 22,
    trend_7d: [30, 28, 25, 24, 23, 22, 22],
    factors: [{ label: 'Độ ẩm không khí trong ngưỡng an toàn', contribution_pct: -10 }]
  },
  {
    disease: 'Leaf Blight',
    risk_pct: 15,
    trend_7d: [18, 17, 16, 16, 15, 15, 15],
    factors: [{ label: 'Không phát hiện dấu hiệu bất thường gần đây', contribution_pct: -5 }]
  }
]

export const MOCK_HARVEST: HarvestPrediction = {
  garden_id: 'garden_01',
  crop_type: 'Rau ăn lá',
  predicted_harvest_date: '2026-07-03',
  days_remaining: 12,
  confidence: 'high',
  estimated_yield: '2.5 kg',
  growth_stage: 'fruiting',
  growth_stages_completed: ['germination', 'leafing', 'flowering', 'fruiting'],
  growth_stages_remaining: ['ripening']
}

export const MOCK_GROWTH_PHOTOS: GrowthPhoto[] = [
  { week: 1, date: '2026-05-24', image_url: 'https://picsum.photos/id/1080/600/600', height_cm: 5, leaf_count: 4 },
  { week: 2, date: '2026-05-31', image_url: 'https://picsum.photos/id/1081/600/600', height_cm: 11, leaf_count: 7 },
  { week: 3, date: '2026-06-07', image_url: 'https://picsum.photos/id/1082/600/600', height_cm: 18, leaf_count: 10 },
  { week: 4, date: '2026-06-14', image_url: 'https://picsum.photos/id/1083/600/600', height_cm: 27, leaf_count: 14 },
  { week: 5, date: '2026-06-21', image_url: 'https://picsum.photos/id/1084/600/600', height_cm: 35, leaf_count: 17 }
]

export const MOCK_WEATHER: WeatherData = {
  current: { temp_c: 33, weather_code: 'partly_cloudy', humidity_pct: 70 },
  alert: {
    active: true,
    severity: 'warning',
    message: 'Dự báo nắng nóng 39°C vào ngày mai — cân nhắc kéo lưới che nắng sớm.'
  },
  daily: [
    { date: '2026-06-21', weather_code: 'partly_cloudy', temp_max: 33, temp_min: 26, rain_chance_pct: 10 },
    { date: '2026-06-22', weather_code: 'sunny', temp_max: 39, temp_min: 28, rain_chance_pct: 0 },
    { date: '2026-06-23', weather_code: 'rain', temp_max: 29, temp_min: 24, rain_chance_pct: 80 },
    { date: '2026-06-24', weather_code: 'cloudy', temp_max: 30, temp_min: 25, rain_chance_pct: 30 },
    { date: '2026-06-25', weather_code: 'sunny', temp_max: 32, temp_min: 25, rain_chance_pct: 5 },
    { date: '2026-06-26', weather_code: 'partly_cloudy', temp_max: 31, temp_min: 24, rain_chance_pct: 20 },
    { date: '2026-06-27', weather_code: 'sunny', temp_max: 33, temp_min: 26, rain_chance_pct: 10 }
  ]
}

export const MOCK_IRRIGATION_SCHEDULE = [
  {
    id: 'sched_01',
    time: '2026-06-21T10:00:00Z',
    duration_minutes: 15,
    status: 'PENDING' as const,
    predicted_by: 'Random Forest AI',
    reason: 'Độ ẩm đất khu 1 giảm còn 28% (dưới ngưỡng tối thiểu 30%) và không có mưa trong dự báo thời tiết 3 giờ tới.'
  },
  {
    id: 'sched_02',
    time: '2026-06-21T16:30:00Z',
    duration_minutes: 10,
    status: 'PENDING' as const,
    predicted_by: 'Random Forest AI',
    reason: 'Duy trì độ ẩm đất khu 2 trước chu kỳ chiếu sáng buổi tối.'
  }
]
