Tôi tổng hợp lại theo hướng **giao diện AI quét bệnh lá + vẫn giữ Heatmap nhưng tập trung đúng vùng bệnh**.

Mục tiêu giao diện:

> Người dùng nhìn vào là hiểu: "AI đã tìm thấy bệnh ở đâu, bệnh gì, mức độ bao nhiêu"
> Không hiển thị quá nhiều thông tin kỹ thuật.

---

# 1. Khu vực ảnh quét chính (GIỮ + chỉnh)

Hiện tại:

* Lá
* Box đỏ
* Label bệnh
* Heatmap rải toàn lá

Nên đổi thành:

```
ẢNH PHÂN TÍCH

+-----------------------+
|                       |
|       Lá cây          |
|          ███          |
|        ██████         |
|       vùng bệnh       |
|                       |
+-----------------------+

Vùng bệnh phát hiện:
● 1 khu vực

Độ tin cậy:
92.5%
```

Heatmap chỉ nằm quanh vùng:

```
Không nên:

████████████
██  lá   ██
████████████
(nóng khắp nơi)


Nên:

        lá

       🟢🟢
      🟡🔴🟡
       🟢🟢

    vùng bệnh
```

---

# 2. Heatmap Scan (GIỮ)

Nhưng đổi cách hiển thị.

Không:

```
Quét bản đồ nhiệt

Ảnh 1
Ảnh 2
Ảnh 3
Ảnh 4
Ảnh 5
```

Vì nhìn như AI đang thử nghiệm.

Nên:

```
Phân tích vùng bệnh

[Ảnh gốc]

[Heatmap tập trung]

[Vùng AI nhận diện]
```

3 trạng thái:

### Ảnh gốc

```
🍃
```

### Heatmap

```
🍃
  🔴
 🔴🔴
  🔴

```

### Vùng bệnh

```
🍃
 ┌─────┐
 │đốm  │
 └─────┘
```

---

# 3. Bỏ khỏi giao diện

Bỏ:

❌ Tọa độ

```
X:180
Y:195
```

→ chỉ là debug

❌ FPS

```
60 FPS
```

→ không liên quan người dùng

❌ Camera:

```
4K Spectral
```

→ đưa vào cài đặt thiết bị

❌ R-Forest

```
Mô hình xử lý:
R-Forest
```

→ thay bằng:

```
AI Vision Analysis
```

---

# 4. Khung kết quả bên phải (GIỮ)

Thiết kế lại:

```
⚠ CẢNH BÁO BỆNH HẠI


Bệnh đốm nâu

Alternaria solani


Mức độ:
CAO


Độ tin cậy:
92.5%


Vùng ảnh hưởng:
1 vùng


[ Xem phác đồ ]
```

---

# 5. Thêm trạng thái AI

Ngay dưới ảnh:

```
AI ANALYSIS

✓ Đã phát hiện lá
✓ Đã xác định vùng bất thường
✓ Đã phân loại bệnh
✓ Đã đánh giá mức độ
```

---

# 6. Lịch sử quét bên trái

Hiện tại:

```
03:30
12:15
03:00
```

Nên đổi:

```
29/06 03:30

Đốm nâu
92%


28/06 12:15

Bình thường
98%
```

---

# Layout cuối cùng:

```
------------------------------------------------

        ẢNH LÁ                 KẾT QUẢ


        [ Lá cây ]              Bệnh đốm nâu

        [ Heatmap ]             Mức độ: Cao

        [ vùng bệnh ]           Tin cậy:92%

                                [Phác đồ]


------------------------------------------------

Heatmap phân tích vùng bệnh

[Ảnh gốc] [Heatmap] [Khoanh vùng]


------------------------------------------------

Lịch sử quét


------------------------------------------------
```

Kết luận:

Giữ:
✅ Heatmap
✅ Khoanh vùng bệnh
✅ Confidence
✅ Mức độ bệnh

Sửa:

* Heatmap chỉ tập trung quanh vùng bất thường
* Không lan ra toàn lá
* Không hiển thị thông số kỹ thuật ML
* Biến màn hình từ "AI debug" thành "AI nông nghiệp cho người dùng"

Giao diện hiện tại của bạn chỉ cần chỉnh theo hướng này là hợp lý.
