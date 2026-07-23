# Database Schema

PostgreSQL 16 with Prisma ORM. The schema has 30 models organized into the following domains.

---

## Enums

| Enum                | Values                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| `GstRate`           | GST_0, GST_5, GST_12, GST_18, GST_28                                                                   |
| `PaymentMode`       | CASH, UPI, CARD, BANK_TRANSFER, STORE_CREDIT                                                           |
| `ReturnCondition`   | RESELLABLE, DAMAGED, DEFECTIVE                                                                         |
| `CreditNoteStatus`  | ACTIVE, REDEEMED, EXPIRED                                                                              |
| `StockMovementType` | PURCHASE, SALE, RETURN, DAMAGE, ADJUSTMENT, OPENING_STOCK                                              |
| `AdjustmentReason`  | PHYSICAL_COUNT, DAMAGE, EXPIRED, LOST, CORRECTION                                                      |
| `PurchaseStatus`    | DRAFT, PENDING, ORDERED, RECEIVED, CANCELLED                                                           |
| `PaymentStatus`     | PENDING, PARTIAL, PAID                                                                                 |
| `ExpenseCategory`   | RENT, SALARY, UTILITIES, ELECTRICITY, MAINTENANCE, TRANSPORTATION, MARKETING, PACKAGING, MISCELLANEOUS |

---

## Store & Settings

### Store

Central entity. Every record is scoped to a store.

- **Fields:** id, name, code (unique), ownerName, panNumber, address, city, state, pincode, phone, email, website, gstin, logo, currency, timezone, language, financialYear, isActive, soft-delete
- **Relations:** users, categories, brands, variants, suppliers, customers, purchases, sales, returns, credit notes, stock movements, expenses, settings (invoice/gst/barcode/printer), backups, audit logs, notifications

### InvoiceSetting

One per store. Invoice prefix, starting number, receipt footer, terms, thank-you message, A4/thermal templates.

### GstSetting

One per store. GST enabled/disabled, default mode (EXCLUSIVE/INCLUSIVE), per-rate enable flags.

### BarcodeSetting

One per store. Barcode type (CODE128), label dimensions, labels-per-row, show price/SKU/variant.

### PrinterSetting

One per store. Printer type (thermal/a4), name, paper size, margins, font size, auto-print, copies.

---

## Authentication & Authorization

### Role

- **Fields:** id, name (unique), description
- **Relations:** userRoles

### User

- **Fields:** id, email (unique), phone, passwordHash, firstName, lastName, isActive, storeId, soft-delete
- **Relations:** store, userRoles, createdBy (self), purchases, sales, returns, stock movements, expenses, credit notes, backups, audit logs, notifications, notificationSetting, userPreference, refreshTokens

### RefreshToken

- **Fields:** id, token (unique), userId, expiresAt
- **Relations:** user

### UserRole

Join table between User and Role (many-to-many).

- **Composite PK:** (userId, roleId)

---

## Product Catalog

### Category

Hierarchical (self-referencing parent/children).

- **Fields:** id, name, slug (unique), description, parentId, storeId, soft-delete
- **Relations:** store, parent, children, products

### Brand

- **Fields:** id, name, slug (unique), description, storeId, soft-delete
- **Relations:** store, products

### Product

- **Fields:** id, name, slug (unique), description, tags (string[]), categoryId, brandId, isActive, soft-delete
- **Relations:** category, brand, variants, images

### ProductImage

- **Fields:** id, productId, url, alt, isPrimary, sortOrder
- **Relations:** product (cascade delete)

### ProductVariant

Size/color specific variant with pricing and stock.

- **Fields:** id, productId, sku, barcode (unique), barcodeType, barcodeImagePath, size, color, purchasePrice, sellingPrice, gstPercentage, stockQuantity, reorderLevel, isActive, storeId, soft-delete
- **Unique constraints:** (productId, sku), (productId, size, color)
- **Relations:** product, store, purchaseItems, saleItems, returnItems, stockMovements

---

## Suppliers & Purchases

### Supplier

- **Fields:** id, name, contactPerson, email, phone (unique), address, city, state, pincode, gstin (unique), isActive, storeId, soft-delete
- **Relations:** store, purchases

### Purchase

- **Fields:** id, invoiceNumber (unique), supplierId, purchaseDate, subtotal, discountAmount, taxAmount, grandTotal, status, paymentStatus, paymentMode, notes, storeId, createdById, soft-delete
- **Relations:** supplier, store, createdBy, items

### PurchaseItem

- **Fields:** id, purchaseId, productVariantId, quantity, unitCost, totalCost
- **Relations:** purchase (cascade delete), productVariant

---

## Customers & Sales

### Customer

- **Fields:** id, name, email, phone, address, city, state, pincode, gstin, loyaltyPoints, storeId, soft-delete
- **Relations:** store, sales, creditNotes

### Sale

- **Fields:** id, invoiceNumber (unique), customerId, saleDate, subtotal, discountAmount, taxAmount, grandTotal, isGst, notes, storeId, createdById, soft-delete
- **Relations:** customer, store, createdBy, items, payments, returns, creditNoteRedemptions, creditNotesOriginal

### SaleItem

- **Fields:** id, saleId, productVariantId, quantity, unitPrice, gstPercentage, gstAmount, totalPrice
- **Relations:** sale (cascade delete), productVariant, returnItems

### SalePayment

- **Fields:** id, saleId, mode (PaymentMode), amount, reference
- **Relations:** sale (cascade delete)

---

## Returns, Exchanges & Credit Notes

### SalesReturn

- **Fields:** id, returnNumber (unique), saleId, returnDate, totalAmount, reason, refundMethod, refundAmount, refundDate, refundProcessedById, storeId, createdById, soft-delete
- **Relations:** sale, store, createdBy, refundProcessedBy, items, creditNotes

### SalesReturnItem

- **Fields:** id, salesReturnId, saleItemId, productVariantId, quantity, unitPrice, totalAmount, reason, condition (ReturnCondition)
- **Relations:** salesReturn (cascade delete), saleItem, productVariant

### CreditNote

- **Fields:** id, creditNoteNumber (unique), customerId, salesReturnId, originalSaleId, amount, availableAmount, issueDate, expiryDate, status, redeemedAt, notes, storeId, createdById, soft-delete
- **Relations:** customer, salesReturn, originalSale, store, createdBy, redemptions

### CreditNoteRedemption

- **Fields:** id, creditNoteId, saleId, amount
- **Relations:** creditNote (cascade delete), sale

---

## Inventory

### StockMovement

Tracks every stock change with before/after snapshots.

- **Fields:** id, productVariantId, quantity, type, previousStock, newStock, adjustmentReason, purchaseItemId, saleItemId, salesReturnItemId, notes, storeId, createdById
- **Relations:** productVariant, store, createdBy

---

## Expenses

### Expense

- **Fields:** id, category (ExpenseCategory), amount, description, date, paymentMode, storeId, createdById, soft-delete
- **Relations:** store, createdBy

---

## System

### AuditLog

- **Fields:** id, userId, action, module, recordId, details (JSON), ipAddress, storeId
- **Relations:** user, store

### Notification

- **Fields:** id, userId, title, message, type (info/warning/success/error), isRead, link, storeId
- **Relations:** user, store

### NotificationSetting

One per user.

- **Fields:** id, userId, lowStockAlert, outOfStockAlert, dailySalesSummary, newUserAlert, backupAlert, emailEnabled, smsEnabled
- **Relations:** user (cascade delete)

### UserPreference

One per user.

- **Fields:** id, userId, theme, language, defaultLandingPage, defaultPrinter, defaultPaymentMethod, itemsPerPage
- **Relations:** user (cascade delete)

### Backup

- **Fields:** id, storeId, filename, filePath, fileSize, status (COMPLETED/FAILED/RESTORED), notes, createdById
- **Relations:** store, createdBy

---

## Entity Relationship Summary

```
Store ────1:N──→ User, Category, Brand, ProductVariant, Supplier,
                 Customer, Purchase, Sale, SalesReturn, CreditNote,
                 StockMovement, Expense, AuditLog, Notification, Backup
Store ────1:1──→ InvoiceSetting, GstSetting, BarcodeSetting, PrinterSetting
User ────1:N──→ Purchase, Sale, SalesReturn, StockMovement, Expense,
                 CreditNote, Backup, AuditLog, Notification, RefreshToken
User ────1:1──→ UserPreference, NotificationSetting
User ────M:N──→ Role (via UserRole)
Product ──1:N──→ ProductVariant, ProductImage
ProductVariant ──1:N──→ PurchaseItem, SaleItem, SalesReturnItem, StockMovement
Sale ────1:N──→ SaleItem, SalePayment, SalesReturn, CreditNoteRedemption
Customer ──1:N──→ Sale, CreditNote
Supplier ──1:N──→ Purchase
```
