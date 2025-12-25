# Use Case Specifications - LP Shop

## Table 1: Personal Account Management

| Use Case Name | **Personal Account Management (Quản lý tài khoản cá nhân)** |
|--------------|--------------------------------------------------------------|
| **Description** | Allow users to manage their personal accounts, including viewing and updating personal information, changing passwords, viewing notifications, and logging out of the system. |
| **Actors** | Customer (Khách hàng), Admin (Quản trị viên) |
| **Preconditions** | User must be logged in with valid credentials |
| **Basic Flow** | 1. User accesses "My Account" page<br>2. System displays account dashboard<br>3. User selects an option:<br>&nbsp;&nbsp;&nbsp;- View/Edit Personal Information<br>&nbsp;&nbsp;&nbsp;- Change Password<br>&nbsp;&nbsp;&nbsp;- Manage Addresses<br>&nbsp;&nbsp;&nbsp;- View Notifications<br>4. System processes the request<br>5. System displays confirmation |
| **Alternative Flows** | **3a.** User selects "Change Password":<br>&nbsp;&nbsp;3a.1. System prompts for current password<br>&nbsp;&nbsp;3a.2. User enters current and new password<br>&nbsp;&nbsp;3a.3. System validates and updates password<br><br>**3b.** User selects "Personal Information":<br>&nbsp;&nbsp;3b.1. System displays editable form<br>&nbsp;&nbsp;3b.2. User updates information<br>&nbsp;&nbsp;3b.3. System saves changes |
| **Postconditions** | User account information is updated in the database |
| **Frequency** | High - Multiple times per session |

---

## Table 2: Place Order (Đặt hàng)

| Use Case Name | **Place Order (Đặt hàng)** |
|--------------|----------------------------|
| **Description** | Allow customers to create a new order by selecting products from cart, choosing delivery address, payment method, and completing the checkout process. |
| **Actors** | Customer (Khách hàng) |
| **Preconditions** | - User must be logged in<br>- Cart must contain at least one product<br>- Product stock must be available |
| **Basic Flow** | 1. Customer views shopping cart<br>2. Customer clicks "Proceed to Checkout"<br>3. System displays checkout page<br>4. Customer selects/enters delivery address (UC17)<br>5. Customer selects shipping method<br>6. Customer selects payment method (UC11)<br>7. Customer reviews order summary<br>8. Customer confirms order<br>9. System validates order information<br>10. System processes payment<br>11. System creates order record<br>12. System decreases product stock<br>13. System clears shopping cart<br>14. System sends confirmation email<br>15. System displays "Order Success" page |
| **Alternative Flows** | **4a.** No saved address:<br>&nbsp;&nbsp;4a.1. Customer enters new delivery address<br>&nbsp;&nbsp;4a.2. System saves address for future use<br><br>**10a.** Payment fails:<br>&nbsp;&nbsp;10a.1. System displays error message<br>&nbsp;&nbsp;10a.2. Customer retries or selects different payment method<br><br>**9a.** Product out of stock:<br>&nbsp;&nbsp;9a.1. System displays error message<br>&nbsp;&nbsp;9a.2. Customer removes item or updates quantity |
| **Postconditions** | - New order created with status "cho-xac-nhan"<br>- Product stock decreased<br>- Shopping cart cleared<br>- Notification sent to customer<br>- Loyalty points added (if applicable) |
| **Frequency** | High - Core business function |
| **Special Requirements** | - Real-time stock validation<br>- Secure payment processing<br>- Transaction atomicity |

---

## Table 3: Manage Products (Quản lý sản phẩm)

| Use Case Name | **Manage Products (Quản lý sản phẩm)** |
|--------------|----------------------------------------|
| **Description** | Allow administrators to perform CRUD (Create, Read, Update, Delete) operations on products, including adding new products, editing product information, updating stock, and deleting products. |
| **Actors** | Admin (Quản trị viên) |
| **Preconditions** | - Admin must be logged in<br>- Admin must have "quan-tri" role |
| **Basic Flow** | 1. Admin accesses "Product Management" page<br>2. System displays product list with search/filter options<br>3. Admin selects an action:<br>&nbsp;&nbsp;&nbsp;- Add new product<br>&nbsp;&nbsp;&nbsp;- Edit existing product<br>&nbsp;&nbsp;&nbsp;- Delete product<br>&nbsp;&nbsp;&nbsp;- Update stock<br>4. System displays corresponding form/dialog<br>5. Admin enters/updates information<br>6. Admin confirms action<br>7. System validates input<br>8. System saves changes to database<br>9. System displays success message |
| **Alternative Flows** | **3a.** Admin selects "Add Product":<br>&nbsp;&nbsp;3a.1. System displays product creation form<br>&nbsp;&nbsp;3a.2. Admin enters product details (name, price, category, images, etc.)<br>&nbsp;&nbsp;3a.3. Admin uploads product images to Cloudinary<br>&nbsp;&nbsp;3a.4. System auto-generates slug from product name<br>&nbsp;&nbsp;3a.5. System saves new product<br><br>**3b.** Admin selects "Edit Product":<br>&nbsp;&nbsp;3b.1. System displays form with current data<br>&nbsp;&nbsp;3b.2. Admin updates information<br>&nbsp;&nbsp;3b.3. System saves changes<br>&nbsp;&nbsp;3b.4. System updates slug if name changed<br><br>**3c.** Admin selects "Delete Product":<br>&nbsp;&nbsp;3c.1. System checks if product exists in orders<br>&nbsp;&nbsp;3c.2a. If yes: System sets status to "inactive" (soft delete)<br>&nbsp;&nbsp;3c.2b. If no: System deletes product and images (hard delete)<br><br>**7a.** Validation fails:<br>&nbsp;&nbsp;7a.1. System displays error messages<br>&nbsp;&nbsp;7a.2. Admin corrects input |
| **Postconditions** | - Product data updated in database<br>- Product images uploaded to Cloudinary<br>- Product visible/hidden on customer-facing site |
| **Frequency** | Medium - Daily product updates |
| **Special Requirements** | - Image upload to Cloudinary<br>- Automatic slug generation<br>- Soft delete for products in orders<br>- Stock validation |

---

## Table 4: Review Product (Đánh giá sản phẩm)

| Use Case Name | **Review Product (Đánh giá sản phẩm)** |
|--------------|----------------------------------------|
| **Description** | Allow customers to write reviews and rate products they have purchased, including uploading images and providing detailed feedback. |
| **Actors** | Customer (Khách hàng) |
| **Preconditions** | - Customer must be logged in<br>- Customer must have purchased the product<br>- Order status must be "da-giao" (delivered)<br>- Customer has not reviewed this product for this order |
| **Basic Flow** | 1. Customer navigates to "My Orders"<br>2. System displays list of delivered orders<br>3. Customer selects a product to review<br>4. System validates review eligibility<br>5. System displays review form<br>6. Customer selects star rating (1-5)<br>7. Customer enters review title<br>8. Customer enters review content<br>9. (Optional) Customer uploads images<br>10. Customer submits review<br>11. System validates input<br>12. System saves review with status "cho-duyet"<br>13. System updates product rating statistics<br>14. System creates notification for admin<br>15. System displays success message |
| **Alternative Flows** | **4a.** Already reviewed:<br>&nbsp;&nbsp;4a.1. System displays "You have already reviewed this product"<br>&nbsp;&nbsp;4a.2. Use case ends<br><br>**4b.** Order not delivered:<br>&nbsp;&nbsp;4b.1. System displays "You can only review delivered orders"<br>&nbsp;&nbsp;4b.2. Use case ends<br><br>**9a.** Upload images:<br>&nbsp;&nbsp;9a.1. Customer selects images from device<br>&nbsp;&nbsp;9a.2. System uploads to Cloudinary<br>&nbsp;&nbsp;9a.3. System saves image URLs<br><br>**11a.** Validation fails:<br>&nbsp;&nbsp;11a.1. System displays error messages<br>&nbsp;&nbsp;11a.2. Customer corrects input |
| **Postconditions** | - Review created with status "cho-duyet"<br>- Product.soLuongDanhGia increased by 1<br>- Product.danhGiaTrungBinh recalculated<br>- Notification sent to admin<br>- Review pending admin approval |
| **Frequency** | Medium - After product delivery |
| **Special Requirements** | - Composite unique constraint: (sanPham, nguoiDung, donHang)<br>- Image upload to Cloudinary<br>- Auto-calculate average rating<br>- Admin approval workflow |
| **Business Rules** | - One review per product per order<br>- Only for delivered orders<br>- Reviews require admin approval before display |

---

## Table 5: Update Order Status (Cập nhật trạng thái đơn hàng) - Real-time

| Use Case Name | **Update Order Status (Cập nhật trạng thái đơn hàng)** |
|--------------|--------------------------------------------------------|
| **Description** | Allow administrators to update order status through various stages (confirmed, preparing, shipping, delivered, cancelled) with real-time synchronization to customer mobile app. |
| **Actors** | Admin (Quản trị viên) |
| **Preconditions** | - Admin must be logged in<br>- Order must exist in database |
| **Basic Flow** | 1. Admin accesses "Order Management" page<br>2. System displays order list with filters<br>3. Admin selects an order<br>4. System displays order details<br>5. Admin selects new status from dropdown:<br>&nbsp;&nbsp;&nbsp;- cho-xac-nhan → da-xac-nhan<br>&nbsp;&nbsp;&nbsp;- da-xac-nhan → dang-chuan-bi<br>&nbsp;&nbsp;&nbsp;- dang-chuan-bi → dang-giao<br>&nbsp;&nbsp;&nbsp;- dang-giao → da-giao<br>&nbsp;&nbsp;&nbsp;- Any → da-huy<br>&nbsp;&nbsp;&nbsp;- Any → tra-hang<br>6. System validates status transition<br>7. Admin confirms status change<br>8. System updates order status in database<br>9. System adds entry to lichSuTrangThai array<br>10. System creates notification for customer<br>11. **Real-time Sync**: Mobile app polls every 10 seconds<br>12. Mobile app receives updated order status<br>13. Mobile app updates UI automatically<br>14. System displays success message to admin |
| **Alternative Flows** | **5a.** Admin selects "da-huy" (Cancel):<br>&nbsp;&nbsp;5a.1. System prompts for cancellation reason<br>&nbsp;&nbsp;5a.2. Admin enters reason<br>&nbsp;&nbsp;5a.3. System restores product stock<br>&nbsp;&nbsp;5a.4. If payment completed: System initiates refund<br>&nbsp;&nbsp;5a.5. If points used: System refunds loyalty points<br><br>**5b.** Admin selects "da-giao" (Delivered):<br>&nbsp;&nbsp;5b.1. System updates giaoThanhCongLuc timestamp<br>&nbsp;&nbsp;5b.2. System increases Product.daBan counter<br>&nbsp;&nbsp;5b.3. System adds loyalty points to customer<br><br>**6a.** Invalid status transition:<br>&nbsp;&nbsp;6a.1. System displays error "Cannot change to this status"<br>&nbsp;&nbsp;6a.2. Use case ends<br><br>**11-13.** Real-time synchronization:<br>&nbsp;&nbsp;11a. ProfileScreen polling (every 10s): api.getOrders()<br>&nbsp;&nbsp;12a. System returns latest order data<br>&nbsp;&nbsp;13a. If status changed: Update UI with new badge/color<br>&nbsp;&nbsp;13b. NotificationContext polling: api.getNotifications()<br>&nbsp;&nbsp;13c. Update notification badge count |
| **Postconditions** | - Order.trangThaiDonHang updated<br>- Order.lichSuTrangThai[] appended<br>- Notification created for customer<br>- Product stock adjusted (if cancelled)<br>- Loyalty points updated (if delivered)<br>- Mobile app UI updated via polling |
| **Frequency** | High - Multiple times per order lifecycle |
| **Special Requirements** | - **Real-time polling**: Mobile app polls every 10 seconds<br>- Status validation logic<br>- Transaction atomicity for stock updates<br>- Notification push to customer<br>- Refund integration (if applicable) |
| **Technical Notes** | ```javascript<br>// ProfileScreen.tsx - Real-time polling<br>useEffect(() => {<br>&nbsp;&nbsp;if (!isAuthenticated) return;<br>&nbsp;&nbsp;const interval = setInterval(() => {<br>&nbsp;&nbsp;&nbsp;&nbsp;loadOrders(); // API call<br>&nbsp;&nbsp;}, 10000); // 10 seconds<br>&nbsp;&nbsp;return () => clearInterval(interval);<br>}, [isAuthenticated]);<br>``` |

---

## Table 6: View Notifications (Xem thông báo) - Real-time

| Use Case Name | **View Notifications (Xem thông báo)** |
|--------------|----------------------------------------|
| **Description** | Allow customers to view real-time notifications about order status updates, promotions, and system announcements with automatic polling mechanism. |
| **Actors** | Customer (Khách hàng) |
| **Preconditions** | - Customer must be logged in |
| **Basic Flow** | 1. Customer opens mobile app<br>2. **Real-time Polling**: NotificationContext starts polling every 10 seconds<br>3. System fetches unread notification count<br>4. System updates notification badge<br>5. Customer clicks notification icon<br>6. System displays notification list<br>7. Customer clicks a notification<br>8. System marks notification as read (daDoc = true)<br>9. System navigates to related content (order detail, product, etc.)<br>10. System updates unread count |
| **Alternative Flows** | **6a.** No notifications:<br>&nbsp;&nbsp;6a.1. System displays "No notifications"<br><br>**7a.** Mark all as read:<br>&nbsp;&nbsp;7a.1. Customer clicks "Mark all as read"<br>&nbsp;&nbsp;7a.2. System updates all notifications: daDoc = true<br>&nbsp;&nbsp;7a.3. System resets badge count to 0<br><br>**2-4.** Real-time polling flow:<br>&nbsp;&nbsp;2a. NotificationContext calls api.getNotifications() every 10s<br>&nbsp;&nbsp;3a. Backend returns: {notifications: [], unreadCount: N}<br>&nbsp;&nbsp;4a. Context updates state<br>&nbsp;&nbsp;4b. UI automatically re-renders with new badge |
| **Postconditions** | - Notification.daDoc updated to true<br>- Notification badge count decreased<br>- User navigated to related content |
| **Frequency** | Very High - Continuous background polling |
| **Special Requirements** | - **Real-time polling**: Every 10 seconds<br>- Efficient API calls (only unread count)<br>- Badge update without user interaction<br>- Deep linking to related content |
| **Notification Types** | - **don-hang-moi**: New order created<br>- **don-hang-xac-nhan**: Order confirmed<br>- **don-hang-dang-chuan-bi**: Order being prepared<br>- **don-hang-dang-giao**: Order shipped<br>- **don-hang-giao-thanh-cong**: Order delivered<br>- **don-hang-huy**: Order cancelled<br>- **danh-gia-moi**: New review (for admin)<br>- **khac**: Other announcements |
| **Technical Notes** | ```javascript<br>// NotificationContext.tsx - Real-time polling<br>useEffect(() => {<br>&nbsp;&nbsp;if (!isAuthenticated) return;<br>&nbsp;&nbsp;const interval = setInterval(async () => {<br>&nbsp;&nbsp;&nbsp;&nbsp;const data = await api.getNotifications();<br>&nbsp;&nbsp;&nbsp;&nbsp;setUnreadCount(data.unreadCount);<br>&nbsp;&nbsp;}, 10000);<br>&nbsp;&nbsp;return () => clearInterval(interval);<br>}, [isAuthenticated]);<br>``` |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| **<<extend>>** | Optional extension of base use case |
| **<<include>>** | Required inclusion of another use case |
| **<<inherits>>** | Actor inherits permissions from another actor |
| **⚡** | Real-time feature with polling mechanism |
| **PK** | Primary Key |
| **FK** | Foreign Key |
| **UK** | Unique Key |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Use Cases | 31 |
| Guest Use Cases | 7 |
| Customer Use Cases | 14 |
| Admin Use Cases | 10 |
| Real-time Use Cases (⚡) | 3 (UC12, UC19, UC25) |
| Use Cases with <<include>> | 3 |
| Use Cases with <<extend>> | 3 |

---

**Document Version**: 1.0
**Last Updated**: 2025-12-25
**Project**: LP Shop - E-commerce Platform
