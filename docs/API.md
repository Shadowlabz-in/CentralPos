# API Reference

Base URL: `http://localhost:4000/api`

All endpoints (except login/refresh) require `Authorization: Bearer <token>` header.

---

## Auth

| Method | Path                        | Auth | Description                              |
| ------ | --------------------------- | ---- | ---------------------------------------- |
| POST   | `/api/auth/login`           | No   | Login with email & password              |
| POST   | `/api/auth/logout`          | Yes  | Invalidate refresh token                 |
| POST   | `/api/auth/refresh`         | No   | Get new access token using refresh token |
| POST   | `/api/auth/change-password` | Yes  | Change current user password             |

## Users

| Method | Path             | Auth           | Description              |
| ------ | ---------------- | -------------- | ------------------------ |
| GET    | `/api/users/me`  | Yes            | Get current user profile |
| GET    | `/api/users`     | ADMIN, MANAGER | List all users           |
| GET    | `/api/users/:id` | ADMIN, MANAGER | Get user by ID           |
| POST   | `/api/users`     | ADMIN          | Create a new user        |
| PATCH  | `/api/users/:id` | ADMIN          | Update user details      |
| DELETE | `/api/users/:id` | ADMIN          | Soft-delete a user       |

## Categories

| Method | Path                  | Auth           | Description            |
| ------ | --------------------- | -------------- | ---------------------- |
| GET    | `/api/categories`     | Yes            | List all categories    |
| GET    | `/api/categories/:id` | Yes            | Get category by ID     |
| POST   | `/api/categories`     | ADMIN, MANAGER | Create a category      |
| PATCH  | `/api/categories/:id` | ADMIN, MANAGER | Update category        |
| DELETE | `/api/categories/:id` | ADMIN          | Soft-delete a category |

## Brands

| Method | Path              | Auth           | Description         |
| ------ | ----------------- | -------------- | ------------------- |
| GET    | `/api/brands`     | Yes            | List all brands     |
| GET    | `/api/brands/:id` | Yes            | Get brand by ID     |
| POST   | `/api/brands`     | ADMIN, MANAGER | Create a brand      |
| PATCH  | `/api/brands/:id` | ADMIN, MANAGER | Update brand        |
| DELETE | `/api/brands/:id` | ADMIN          | Soft-delete a brand |

## Products

| Method | Path                | Auth           | Description                  |
| ------ | ------------------- | -------------- | ---------------------------- |
| GET    | `/api/products`     | Yes            | List products (with filters) |
| GET    | `/api/products/:id` | Yes            | Get product by ID            |
| POST   | `/api/products`     | ADMIN, MANAGER | Create a product             |
| PATCH  | `/api/products/:id` | ADMIN, MANAGER | Update product               |
| DELETE | `/api/products/:id` | ADMIN          | Soft-delete a product        |

## Variants

| Method | Path                                | Auth           | Description                 |
| ------ | ----------------------------------- | -------------- | --------------------------- |
| GET    | `/api/products/:productId/variants` | Yes            | List variants for a product |
| GET    | `/api/variants/:id`                 | Yes            | Get variant by ID           |
| POST   | `/api/products/:productId/variants` | ADMIN, MANAGER | Create a variant            |
| PATCH  | `/api/variants/:id`                 | ADMIN, MANAGER | Update variant              |
| DELETE | `/api/variants/:id`                 | ADMIN          | Soft-delete a variant       |

## Product Images

| Method | Path                                               | Auth           | Description            |
| ------ | -------------------------------------------------- | -------------- | ---------------------- |
| POST   | `/api/products/:productId/images`                  | ADMIN, MANAGER | Upload a single image  |
| POST   | `/api/products/:productId/images/multiple`         | ADMIN, MANAGER | Upload up to 10 images |
| DELETE | `/api/products/:productId/images/:imageId`         | ADMIN, MANAGER | Delete an image        |
| PATCH  | `/api/products/:productId/images/:imageId/primary` | ADMIN, MANAGER | Set image as primary   |

## Suppliers

| Method | Path                 | Auth           | Description            |
| ------ | -------------------- | -------------- | ---------------------- |
| GET    | `/api/suppliers`     | Yes            | List all suppliers     |
| GET    | `/api/suppliers/:id` | Yes            | Get supplier by ID     |
| POST   | `/api/suppliers`     | ADMIN, MANAGER | Create a supplier      |
| PATCH  | `/api/suppliers/:id` | ADMIN, MANAGER | Update supplier        |
| DELETE | `/api/suppliers/:id` | ADMIN          | Soft-delete a supplier |

## Purchases

| Method | Path                 | Auth                    | Description             |
| ------ | -------------------- | ----------------------- | ----------------------- |
| GET    | `/api/purchases`     | ADMIN, MANAGER, CASHIER | List purchase orders    |
| GET    | `/api/purchases/:id` | ADMIN, MANAGER, CASHIER | Get purchase by ID      |
| POST   | `/api/purchases`     | ADMIN, MANAGER          | Create a purchase order |
| PATCH  | `/api/purchases/:id` | ADMIN, MANAGER          | Update purchase order   |

## Inventory

| Method | Path                                  | Auth           | Description                      |
| ------ | ------------------------------------- | -------------- | -------------------------------- |
| GET    | `/api/inventory/current`              | Yes            | Current stock levels             |
| GET    | `/api/inventory/history`              | Yes            | Stock movement history           |
| GET    | `/api/inventory/low-stock`            | Yes            | Low stock alerts                 |
| GET    | `/api/inventory/valuation`            | Yes            | Inventory valuation              |
| GET    | `/api/inventory/:variantId/movements` | Yes            | Movements for a specific variant |
| POST   | `/api/inventory/adjust`               | ADMIN, MANAGER | Adjust stock quantity            |

## Barcodes

| Method | Path                                  | Auth           | Description                |
| ------ | ------------------------------------- | -------------- | -------------------------- |
| GET    | `/api/barcodes/:barcode`              | Yes            | Look up variant by barcode |
| POST   | `/api/barcodes/regenerate/:variantId` | ADMIN, MANAGER | Regenerate barcode image   |
| GET    | `/api/barcodes/print/:variantId`      | Yes            | Get barcode for printing   |

## Customers

| Method | Path                 | Auth           | Description            |
| ------ | -------------------- | -------------- | ---------------------- |
| GET    | `/api/customers`     | Yes            | List customers         |
| GET    | `/api/customers/:id` | Yes            | Get customer by ID     |
| POST   | `/api/customers`     | ADMIN, MANAGER | Create a customer      |
| PATCH  | `/api/customers/:id` | ADMIN, MANAGER | Update customer        |
| DELETE | `/api/customers/:id` | ADMIN          | Soft-delete a customer |

## Sales (POS)

| Method | Path                     | Auth                    | Description               |
| ------ | ------------------------ | ----------------------- | ------------------------- |
| GET    | `/api/sales`             | Yes                     | List sales (with filters) |
| GET    | `/api/sales/:id`         | Yes                     | Get sale by ID            |
| POST   | `/api/sales/checkout`    | ADMIN, MANAGER, CASHIER | Complete a sale           |
| POST   | `/api/sales/:id/cancel`  | ADMIN                   | Cancel a sale             |
| GET    | `/api/sales/:id/invoice` | Yes                     | Get invoice for a sale    |
| POST   | `/api/sales/:id/reprint` | ADMIN, MANAGER          | Reprint invoice           |

## POS Cart

| Method | Path                        | Auth | Description               |
| ------ | --------------------------- | ---- | ------------------------- |
| GET    | `/api/pos/cart`             | Yes  | Get current cart          |
| POST   | `/api/pos/cart/add`         | Yes  | Add item to cart          |
| POST   | `/api/pos/cart/update`      | Yes  | Update cart item quantity |
| POST   | `/api/pos/cart/remove`      | Yes  | Remove item from cart     |
| POST   | `/api/pos/cart/clear`       | Yes  | Clear the cart            |
| POST   | `/api/pos/cart/hold`        | Yes  | Hold current cart         |
| POST   | `/api/pos/cart/resume/:key` | Yes  | Resume a held cart        |
| GET    | `/api/pos/cart/held`        | Yes  | List all held carts       |

## Returns & Exchanges

| Method | Path               | Auth                    | Description         |
| ------ | ------------------ | ----------------------- | ------------------- |
| GET    | `/api/returns`     | ADMIN, MANAGER, CASHIER | List returns        |
| GET    | `/api/returns/:id` | ADMIN, MANAGER, CASHIER | Get return by ID    |
| POST   | `/api/returns`     | ADMIN, MANAGER, CASHIER | Create a return     |
| POST   | `/api/exchanges`   | ADMIN, MANAGER, CASHIER | Process an exchange |
| POST   | `/api/refunds`     | ADMIN, MANAGER          | Process a refund    |

## Credit Notes

| Method | Path                       | Auth                    | Description          |
| ------ | -------------------------- | ----------------------- | -------------------- |
| GET    | `/api/credit-notes`        | ADMIN, MANAGER, CASHIER | List credit notes    |
| POST   | `/api/credit-notes`        | ADMIN, MANAGER          | Create a credit note |
| POST   | `/api/credit-notes/redeem` | ADMIN, MANAGER, CASHIER | Redeem a credit note |

## Dashboard

| Method | Path                                   | Auth                    | Description                 |
| ------ | -------------------------------------- | ----------------------- | --------------------------- |
| GET    | `/api/dashboard`                       | ADMIN, MANAGER          | Dashboard overview          |
| GET    | `/api/dashboard/profit`                | ADMIN, MANAGER          | Profit metrics              |
| GET    | `/api/dashboard/inventory`             | ADMIN, MANAGER, CASHIER | Inventory summary           |
| GET    | `/api/dashboard/purchases`             | ADMIN, MANAGER          | Purchase summary            |
| GET    | `/api/dashboard/customers`             | ADMIN, MANAGER          | Customer metrics            |
| GET    | `/api/dashboard/sales-chart`           | ADMIN, MANAGER          | Sales chart data            |
| GET    | `/api/dashboard/sales-by-category`     | ADMIN, MANAGER          | Sales breakdown by category |
| GET    | `/api/dashboard/sales-by-brand`        | ADMIN, MANAGER          | Sales breakdown by brand    |
| GET    | `/api/dashboard/top-products`          | ADMIN, MANAGER          | Top selling products        |
| GET    | `/api/dashboard/inventory-value-trend` | ADMIN, MANAGER          | Inventory value over time   |

## Reports

| Method | Path                     | Auth                    | Description             |
| ------ | ------------------------ | ----------------------- | ----------------------- |
| GET    | `/api/reports/sales`     | ADMIN, MANAGER          | Sales report            |
| GET    | `/api/reports/purchases` | ADMIN, MANAGER          | Purchase report         |
| GET    | `/api/reports/inventory` | ADMIN, MANAGER, CASHIER | Inventory report        |
| GET    | `/api/reports/profit`    | ADMIN, MANAGER          | Profit & loss report    |
| GET    | `/api/reports/gst`       | ADMIN, MANAGER          | GST report              |
| GET    | `/api/reports/customers` | ADMIN, MANAGER          | Customer report         |
| GET    | `/api/reports/suppliers` | ADMIN, MANAGER          | Supplier report         |
| GET    | `/api/reports/export`    | ADMIN, MANAGER          | Export data (CSV/Excel) |

## Settings

| Method | Path                    | Auth           | Description             |
| ------ | ----------------------- | -------------- | ----------------------- |
| GET    | `/api/settings/store`   | ADMIN, MANAGER | Get store settings      |
| PATCH  | `/api/settings/store`   | ADMIN          | Update store settings   |
| GET    | `/api/settings/invoice` | ADMIN, MANAGER | Get invoice settings    |
| PATCH  | `/api/settings/invoice` | ADMIN          | Update invoice settings |
| GET    | `/api/settings/gst`     | ADMIN, MANAGER | Get GST settings        |
| PATCH  | `/api/settings/gst`     | ADMIN          | Update GST settings     |
| GET    | `/api/settings/barcode` | ADMIN, MANAGER | Get barcode settings    |
| PATCH  | `/api/settings/barcode` | ADMIN          | Update barcode settings |
| GET    | `/api/settings/printer` | ADMIN, MANAGER | Get printer settings    |
| PATCH  | `/api/settings/printer` | ADMIN          | Update printer settings |

## Audit Logs

| Method | Path              | Auth           | Description                    |
| ------ | ----------------- | -------------- | ------------------------------ |
| GET    | `/api/audit-logs` | ADMIN, MANAGER | List audit logs (with filters) |

## Notifications

| Method | Path                          | Auth | Description                     |
| ------ | ----------------------------- | ---- | ------------------------------- |
| GET    | `/api/notifications`          | Yes  | List user notifications         |
| PATCH  | `/api/notifications/:id/read` | Yes  | Mark notification as read       |
| PATCH  | `/api/notifications/read-all` | Yes  | Mark all as read                |
| GET    | `/api/notification-settings`  | Yes  | Get notification preferences    |
| PATCH  | `/api/notification-settings`  | Yes  | Update notification preferences |

## User Preferences

| Method | Path               | Auth | Description             |
| ------ | ------------------ | ---- | ----------------------- |
| GET    | `/api/preferences` | Yes  | Get user preferences    |
| PATCH  | `/api/preferences` | Yes  | Update user preferences |

## Backup

| Method | Path                                | Auth           | Description              |
| ------ | ----------------------------------- | -------------- | ------------------------ |
| POST   | `/api/settings/backups`             | ADMIN          | Create a database backup |
| GET    | `/api/settings/backups`             | ADMIN, MANAGER | List backups             |
| POST   | `/api/settings/backups/:id/restore` | ADMIN          | Restore from a backup    |

---

## Response Format

All responses follow this structure:

```json
{
  "status": "success",
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 20 }
}
```

Error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```
