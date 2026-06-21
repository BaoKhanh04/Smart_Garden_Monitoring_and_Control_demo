# Tài khoản Test - Smart Garden Control Dashboard

## Tài khoản Demo

### Owner Account (Toàn quyền)

| Field       | Value                |
|-------------|----------------------|
| **Email**   | `owner@sgmc.com`     |
| **Password**| `Password123`        |
| **Role**    | OWNER                 |
| **Name**    | Nguyễn Thành Đạt     |
| **Gardens** | garden_01, garden_02 |

**Quyền truy cập:** Tất cả 23 tính năng bao gồm AI, Analytics, Settings.

### Member Account (Giới hạn)

| Field       | Value                |
|-------------|----------------------|
| **Email**   | `member@sgmc.com`    |
| **Password**| `Password123`        |
| **Role**    | MEMBER               |
| **Name**    | Trần Thị Lan         |
| **Gardens** | garden_01            |

**Quyền truy cập:** Giới hạn 10 tính năng:
- Tổng quan vườn (F-01)
- Camera trực tiếp (F-20)
- Thời tiết (F-10)
- Điều khiển thiết bị - chỉ bật/tắt relay, không đổi chế độ (F-02)
- Lịch tưới - chỉ xem, không Override (F-04)
- Nhật ký canh tác (F-23)
- Theo dõi tăng trưởng - chỉ xem (F-15)
- Thư viện ảnh - chỉ xem (F-21)
- Thông báo (F-05)
- Hồ sơ cá nhân (F-06)

## Gardens

### Garden 01 - Vườn Sân Thượng
- **Crop Type:** Rau ăn lá
- **Area:** 6 m²
- **Devices:** 10 (9 online)

### Garden 02 - Vườn Ban Công
- **Crop Type:** Cà chua
- **Area:** 2 m²
- **Devices:** 8 (8 online)

## Thông tin cảm biến mock

Các cảm biến được cập nhật mỗi 3 giây qua Mock WebSocket:

| Sensor             | Zone | Giá trị mặc định | Ngưỡng an toàn      |
|--------------------|------|-------------------|---------------------|
| Nhiệt độ KK       | 1    | 31.5°C           | 20°C - 35°C         |
| Độ ẩm KK          | 1    | 68%              | 50% - 80%           |
| Nhiệt độ KK       | 2    | 30.2°C           | 20°C - 35°C         |
| Độ ẩm KK          | 2    | 70.1%            | 50% - 80%           |
| Cường độ sáng     | -    | 25,200 lux       | 1,000 - 50,000 lux  |
| Độ ẩm đất         | 1    | 42%              | 30% - 70%           |
| Độ ẩm đất         | 2    | 55%              | 30% - 70%           |
| pH                 | -    | 6.4              | 6.0 - 7.0           |

## Tính năng theo Role

### Owner có thể thấy:
- Tất cả mục trong Sidebar
- Các trang Settings đầy đủ
- Trang AI: Phát hiện bệnh, Dự đoán nguy cơ, Gợi ý AI
- Trang Analytics đầy đủ
- Điều khiển chế độ Auto/Manual/Fallback
- Override lịch tưới

### Member chỉ thấy:
- Sidebar rút gọn (10 mục)
- Settings chỉ có Hồ sơ cá nhân
- Không có trang AI/Analytics
- Điều khiển relay nhưng không đổi chế độ
- Xem lịch tưới nhưng không Override
- Xem ảnh nhưng không xóa

## Cách sử dụng

1. Mở ứng dụng → trang **Đăng nhập**
2. Dùng email/password ở trên để đăng nhập
3. Xem dashboard → thử chuyển đổi giữa Owner và Member
4. Dữ liệu được lưu trong **localStorage** — xóa để reset

## Lưu ý

- Đây là bản **demo frontend** — dữ liệu được mock hoàn toàn
- WebSocket mock chạy mỗi 3 giây, mô phỏng cảm biến thời gian thực
- Mọi thay đổi (ngưỡng, rule, nhật ký) được lưu vào localStorage
- Tất cả tính năng đều có trạng thái Empty, Loading, Error mô phỏng
