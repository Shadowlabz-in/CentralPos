--
-- PostgreSQL database dump
--

\restrict 87aEKN8sz8mFipOaFoTGkkue4txH2LRJjMMI9Ui66rMMETxizsRwI3fWQvLUfcC

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AdjustmentReason; Type: TYPE; Schema: public; Owner: central_one
--

CREATE TYPE public."AdjustmentReason" AS ENUM (
    'PHYSICAL_COUNT',
    'DAMAGE',
    'EXPIRED',
    'LOST',
    'CORRECTION'
);


ALTER TYPE public."AdjustmentReason" OWNER TO central_one;

--
-- Name: CreditNoteStatus; Type: TYPE; Schema: public; Owner: central_one
--

CREATE TYPE public."CreditNoteStatus" AS ENUM (
    'ACTIVE',
    'REDEEMED',
    'EXPIRED'
);


ALTER TYPE public."CreditNoteStatus" OWNER TO central_one;

--
-- Name: ExpenseCategory; Type: TYPE; Schema: public; Owner: central_one
--

CREATE TYPE public."ExpenseCategory" AS ENUM (
    'RENT',
    'SALARY',
    'UTILITIES',
    'ELECTRICITY',
    'MAINTENANCE',
    'TRANSPORTATION',
    'MARKETING',
    'PACKAGING',
    'MISCELLANEOUS'
);


ALTER TYPE public."ExpenseCategory" OWNER TO central_one;

--
-- Name: GstRate; Type: TYPE; Schema: public; Owner: central_one
--

CREATE TYPE public."GstRate" AS ENUM (
    'GST_0',
    'GST_5',
    'GST_12',
    'GST_18',
    'GST_28'
);


ALTER TYPE public."GstRate" OWNER TO central_one;

--
-- Name: PaymentMode; Type: TYPE; Schema: public; Owner: central_one
--

CREATE TYPE public."PaymentMode" AS ENUM (
    'CASH',
    'UPI',
    'CARD',
    'BANK_TRANSFER',
    'STORE_CREDIT'
);


ALTER TYPE public."PaymentMode" OWNER TO central_one;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: central_one
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID'
);


ALTER TYPE public."PaymentStatus" OWNER TO central_one;

--
-- Name: PurchaseStatus; Type: TYPE; Schema: public; Owner: central_one
--

CREATE TYPE public."PurchaseStatus" AS ENUM (
    'DRAFT',
    'PENDING',
    'ORDERED',
    'RECEIVED',
    'CANCELLED'
);


ALTER TYPE public."PurchaseStatus" OWNER TO central_one;

--
-- Name: ReturnCondition; Type: TYPE; Schema: public; Owner: central_one
--

CREATE TYPE public."ReturnCondition" AS ENUM (
    'RESELLABLE',
    'DAMAGED',
    'DEFECTIVE'
);


ALTER TYPE public."ReturnCondition" OWNER TO central_one;

--
-- Name: StockMovementType; Type: TYPE; Schema: public; Owner: central_one
--

CREATE TYPE public."StockMovementType" AS ENUM (
    'PURCHASE',
    'SALE',
    'RETURN',
    'DAMAGE',
    'ADJUSTMENT',
    'OPENING_STOCK'
);


ALTER TYPE public."StockMovementType" OWNER TO central_one;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO central_one;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    "userId" uuid,
    action text NOT NULL,
    module text NOT NULL,
    "recordId" text,
    details jsonb,
    "ipAddress" text,
    "storeId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO central_one;

--
-- Name: backups; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.backups (
    id uuid NOT NULL,
    "storeId" uuid NOT NULL,
    filename text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer,
    status text DEFAULT 'COMPLETED'::text NOT NULL,
    notes text,
    "createdById" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.backups OWNER TO central_one;

--
-- Name: barcode_settings; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.barcode_settings (
    id uuid NOT NULL,
    "storeId" uuid NOT NULL,
    "barcodeType" text DEFAULT 'CODE128'::text NOT NULL,
    "labelWidth" integer DEFAULT 50 NOT NULL,
    "labelHeight" integer DEFAULT 30 NOT NULL,
    "labelsPerRow" integer DEFAULT 2 NOT NULL,
    "showPrice" boolean DEFAULT true NOT NULL,
    "showSku" boolean DEFAULT true NOT NULL,
    "showVariant" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.barcode_settings OWNER TO central_one;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.brands (
    id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "storeId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.brands OWNER TO central_one;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "parentId" uuid,
    "storeId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.categories OWNER TO central_one;

--
-- Name: credit_note_redemptions; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.credit_note_redemptions (
    id uuid NOT NULL,
    "creditNoteId" uuid NOT NULL,
    "saleId" uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.credit_note_redemptions OWNER TO central_one;

--
-- Name: credit_notes; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.credit_notes (
    id uuid NOT NULL,
    "creditNoteNumber" text NOT NULL,
    "customerId" uuid,
    "salesReturnId" uuid,
    "originalSaleId" uuid,
    amount numeric(12,2) NOT NULL,
    "availableAmount" numeric(12,2) NOT NULL,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiryDate" timestamp(3) without time zone,
    status public."CreditNoteStatus" DEFAULT 'ACTIVE'::public."CreditNoteStatus" NOT NULL,
    "redeemedAt" timestamp(3) without time zone,
    notes text,
    "storeId" uuid NOT NULL,
    "createdById" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.credit_notes OWNER TO central_one;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.customers (
    id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    city text,
    state text,
    pincode text,
    gstin text,
    "loyaltyPoints" integer DEFAULT 0 NOT NULL,
    "storeId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.customers OWNER TO central_one;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.expenses (
    id uuid NOT NULL,
    category public."ExpenseCategory" NOT NULL,
    amount numeric(12,2) NOT NULL,
    description text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paymentMode" public."PaymentMode",
    "storeId" uuid NOT NULL,
    "createdById" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.expenses OWNER TO central_one;

--
-- Name: gst_settings; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.gst_settings (
    id uuid NOT NULL,
    "storeId" uuid NOT NULL,
    "isGstEnabled" boolean DEFAULT true NOT NULL,
    "defaultMode" text DEFAULT 'EXCLUSIVE'::text NOT NULL,
    "rate0Enabled" boolean DEFAULT true NOT NULL,
    "rate5Enabled" boolean DEFAULT true NOT NULL,
    "rate12Enabled" boolean DEFAULT true NOT NULL,
    "rate18Enabled" boolean DEFAULT true NOT NULL,
    "rate28Enabled" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.gst_settings OWNER TO central_one;

--
-- Name: invoice_settings; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.invoice_settings (
    id uuid NOT NULL,
    "storeId" uuid NOT NULL,
    prefix text DEFAULT 'INV'::text NOT NULL,
    "startingNumber" integer DEFAULT 1 NOT NULL,
    "receiptFooter" text,
    "termsAndConditions" text,
    "thankYouMessage" text,
    "a4Template" text,
    "thermal58Template" text,
    "thermal80Template" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoice_settings OWNER TO central_one;

--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.notification_settings (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "lowStockAlert" boolean DEFAULT true NOT NULL,
    "outOfStockAlert" boolean DEFAULT true NOT NULL,
    "dailySalesSummary" boolean DEFAULT false NOT NULL,
    "newUserAlert" boolean DEFAULT true NOT NULL,
    "backupAlert" boolean DEFAULT true NOT NULL,
    "emailEnabled" boolean DEFAULT false NOT NULL,
    "smsEnabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_settings OWNER TO central_one;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    link text,
    "storeId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO central_one;

--
-- Name: printer_settings; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.printer_settings (
    id uuid NOT NULL,
    "storeId" uuid NOT NULL,
    "printerType" text DEFAULT 'thermal'::text NOT NULL,
    "printerName" text,
    "paperSize" text DEFAULT '80mm'::text NOT NULL,
    margins integer DEFAULT 5 NOT NULL,
    "fontSize" integer DEFAULT 12 NOT NULL,
    "autoPrint" boolean DEFAULT true NOT NULL,
    copies integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.printer_settings OWNER TO central_one;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.product_images (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    url text NOT NULL,
    alt text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_images OWNER TO central_one;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.product_variants (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    sku text NOT NULL,
    barcode text NOT NULL,
    "barcodeType" text DEFAULT 'CODE128'::text NOT NULL,
    "barcodeImagePath" text,
    size text,
    color text,
    "purchasePrice" numeric(10,2) NOT NULL,
    "sellingPrice" numeric(10,2) NOT NULL,
    "gstPercentage" public."GstRate" DEFAULT 'GST_18'::public."GstRate" NOT NULL,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    "reorderLevel" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "storeId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.product_variants OWNER TO central_one;

--
-- Name: products; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    tags text[],
    "categoryId" uuid NOT NULL,
    "brandId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.products OWNER TO central_one;

--
-- Name: purchase_items; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.purchase_items (
    id uuid NOT NULL,
    "purchaseId" uuid NOT NULL,
    "productVariantId" uuid NOT NULL,
    quantity integer NOT NULL,
    "unitCost" numeric(10,2) NOT NULL,
    "totalCost" numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.purchase_items OWNER TO central_one;

--
-- Name: purchases; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.purchases (
    id uuid NOT NULL,
    "invoiceNumber" text NOT NULL,
    "supplierId" uuid NOT NULL,
    "purchaseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "grandTotal" numeric(12,2) NOT NULL,
    status public."PurchaseStatus" DEFAULT 'PENDING'::public."PurchaseStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentMode" public."PaymentMode",
    notes text,
    "storeId" uuid NOT NULL,
    "createdById" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.purchases OWNER TO central_one;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    token text NOT NULL,
    "userId" uuid NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO central_one;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO central_one;

--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.sale_items (
    id uuid NOT NULL,
    "saleId" uuid NOT NULL,
    "productVariantId" uuid NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "gstPercentage" integer DEFAULT 18 NOT NULL,
    "gstAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sale_items OWNER TO central_one;

--
-- Name: sale_payments; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.sale_payments (
    id uuid NOT NULL,
    "saleId" uuid NOT NULL,
    mode public."PaymentMode" NOT NULL,
    amount numeric(12,2) NOT NULL,
    reference text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sale_payments OWNER TO central_one;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.sales (
    id uuid NOT NULL,
    "invoiceNumber" text NOT NULL,
    "customerId" uuid,
    "saleDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "grandTotal" numeric(12,2) NOT NULL,
    "isGst" boolean DEFAULT true NOT NULL,
    notes text,
    "storeId" uuid NOT NULL,
    "createdById" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.sales OWNER TO central_one;

--
-- Name: sales_return_items; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.sales_return_items (
    id uuid NOT NULL,
    "salesReturnId" uuid NOT NULL,
    "saleItemId" uuid NOT NULL,
    "productVariantId" uuid NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    condition public."ReturnCondition" DEFAULT 'RESELLABLE'::public."ReturnCondition" NOT NULL
);


ALTER TABLE public.sales_return_items OWNER TO central_one;

--
-- Name: sales_returns; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.sales_returns (
    id uuid NOT NULL,
    "returnNumber" text NOT NULL,
    "saleId" uuid NOT NULL,
    "returnDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    reason text,
    "storeId" uuid NOT NULL,
    "createdById" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "refundAmount" numeric(12,2),
    "refundDate" timestamp(3) without time zone,
    "refundMethod" public."PaymentMode",
    "refundProcessedById" uuid
);


ALTER TABLE public.sales_returns OWNER TO central_one;

--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.stock_movements (
    id uuid NOT NULL,
    "productVariantId" uuid NOT NULL,
    quantity integer NOT NULL,
    type public."StockMovementType" NOT NULL,
    "purchaseItemId" uuid,
    "saleItemId" uuid,
    "salesReturnItemId" uuid,
    notes text,
    "storeId" uuid NOT NULL,
    "createdById" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "adjustmentReason" public."AdjustmentReason",
    "newStock" integer DEFAULT 0 NOT NULL,
    "previousStock" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.stock_movements OWNER TO central_one;

--
-- Name: stores; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.stores (
    id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text,
    city text,
    state text,
    pincode text,
    phone text,
    email text,
    gstin text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    currency text DEFAULT 'INR'::text NOT NULL,
    "financialYear" text,
    language text DEFAULT 'en'::text NOT NULL,
    logo text,
    "ownerName" text,
    "panNumber" text,
    timezone text DEFAULT 'Asia/Kolkata'::text NOT NULL,
    website text
);


ALTER TABLE public.stores OWNER TO central_one;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.suppliers (
    id uuid NOT NULL,
    name text NOT NULL,
    "contactPerson" text,
    email text,
    phone text,
    address text,
    city text,
    state text,
    pincode text,
    gstin text,
    "storeId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.suppliers OWNER TO central_one;

--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.user_preferences (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    theme text DEFAULT 'light'::text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    "defaultLandingPage" text DEFAULT '/'::text NOT NULL,
    "defaultPrinter" text,
    "defaultPaymentMethod" text,
    "itemsPerPage" integer DEFAULT 20 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_preferences OWNER TO central_one;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.user_roles (
    "userId" uuid NOT NULL,
    "roleId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_roles OWNER TO central_one;

--
-- Name: users; Type: TABLE; Schema: public; Owner: central_one
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    phone text,
    "passwordHash" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "storeId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdById" uuid
);


ALTER TABLE public.users OWNER TO central_one;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8e16a099-bc8f-454b-87f7-1ff1fed14268	4280faa27bf369a214fda148921c20344349059300368cb8bf55879ff4364078	2026-07-17 02:23:31.900099+05:30	20260716205331_add_refresh_token	\N	\N	2026-07-17 02:23:31.81795+05:30	1
7cb02b2e-0e93-44a4-8e04-a0ebd8f0aeef	e77041fdba814eed7183f00d524926e84c7fac77b865bc55ddf111e388c51d09	2026-07-17 02:32:46.713052+05:30	20260716210246_add_product_images	\N	\N	2026-07-17 02:32:46.703895+05:30	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.audit_logs (id, "userId", action, module, "recordId", details, "ipAddress", "storeId", "createdAt") FROM stdin;
\.


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.backups (id, "storeId", filename, "filePath", "fileSize", status, notes, "createdById", "createdAt") FROM stdin;
\.


--
-- Data for Name: barcode_settings; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.barcode_settings (id, "storeId", "barcodeType", "labelWidth", "labelHeight", "labelsPerRow", "showPrice", "showSku", "showVariant", "createdAt", "updatedAt") FROM stdin;
4fecd1ce-4e18-41cf-99b1-307aad7b02ae	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	CODE128	50	30	2	t	t	t	2026-07-16 22:06:10.626	2026-07-16 22:06:10.626
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.brands (id, name, slug, description, "storeId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
06da181d-603b-4a77-a162-f15f39344873	Zara	zara	Spanish clothing brand	\N	2026-07-16 21:03:08.038	2026-07-16 21:03:08.038	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.categories (id, name, slug, description, "parentId", "storeId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
58ef9f9a-b3b3-4f98-b5de-bc8aa590f02c	Men Western Wear	men-western-wear	Western clothing for men	\N	\N	2026-07-16 21:03:07.898	2026-07-16 21:03:07.898	\N
bb8d89ee-9740-48b0-b3c2-706357278e95	Women Ethnic & Festive Wear	women-ethnic-festive-wear	\N	\N	\N	2026-07-16 21:03:07.95	2026-07-16 21:03:21.267	\N
\.


--
-- Data for Name: credit_note_redemptions; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.credit_note_redemptions (id, "creditNoteId", "saleId", amount, "createdAt") FROM stdin;
5ce656a1-6ad3-4ad1-a940-d932d97ae59b	33c35582-3b6b-4dab-bc81-598fe3b2b97f	ce82fbea-e636-4c31-95ef-9afe70c30b82	250.00	2026-07-16 21:57:23.812
\.


--
-- Data for Name: credit_notes; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.credit_notes (id, "creditNoteNumber", "customerId", "salesReturnId", "originalSaleId", amount, "availableAmount", "issueDate", "expiryDate", status, "redeemedAt", notes, "storeId", "createdById", "createdAt", "updatedAt", "deletedAt") FROM stdin;
33c35582-3b6b-4dab-bc81-598fe3b2b97f	CN-20260717-VQ4T	cc187920-565b-4876-bcf1-e3a1509eb557	\N	\N	500.00	250.00	2026-07-16 21:57:23.562	\N	ACTIVE	\N	Goodwill credit	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:57:23.562	2026-07-16 21:57:23.81	\N
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.customers (id, name, email, phone, address, city, state, pincode, gstin, "loyaltyPoints", "storeId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
cc187920-565b-4876-bcf1-e3a1509eb557	Amit Sharma	amit@example.com	+91-9876540001	\N	\N	\N	\N	\N	0	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	2026-07-16 21:32:11.536	2026-07-16 21:32:11.536	\N
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.expenses (id, category, amount, description, date, "paymentMode", "storeId", "createdById", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: gst_settings; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.gst_settings (id, "storeId", "isGstEnabled", "defaultMode", "rate0Enabled", "rate5Enabled", "rate12Enabled", "rate18Enabled", "rate28Enabled", "createdAt", "updatedAt") FROM stdin;
da0d3ed5-802a-4082-9248-b06c2d2ff122	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	t	EXCLUSIVE	t	t	t	t	t	2026-07-16 22:06:10.563	2026-07-16 22:06:10.563
\.


--
-- Data for Name: invoice_settings; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.invoice_settings (id, "storeId", prefix, "startingNumber", "receiptFooter", "termsAndConditions", "thankYouMessage", "a4Template", "thermal58Template", "thermal80Template", "createdAt", "updatedAt") FROM stdin;
defe4986-a808-4d7d-a10f-d4eb1ae37812	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	INV-	1	Thank you!	\N	\N	\N	\N	\N	2026-07-16 22:06:10.434	2026-07-16 22:06:10.497
\.


--
-- Data for Name: notification_settings; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.notification_settings (id, "userId", "lowStockAlert", "outOfStockAlert", "dailySalesSummary", "newUserAlert", "backupAlert", "emailEnabled", "smsEnabled", "createdAt", "updatedAt") FROM stdin;
d19d76b8-3f4b-463e-89e6-c762a22f10c9	699b2cd2-0824-4be9-a18e-771a17a2488b	t	t	f	t	t	f	f	2026-07-16 22:06:16.286	2026-07-16 22:06:16.286
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.notifications (id, "userId", title, message, type, "isRead", link, "storeId", "createdAt") FROM stdin;
\.


--
-- Data for Name: printer_settings; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.printer_settings (id, "storeId", "printerType", "printerName", "paperSize", margins, "fontSize", "autoPrint", copies, "createdAt", "updatedAt") FROM stdin;
6b7d50f0-6076-4613-b103-a9c55ee1ce60	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	thermal	\N	80mm	5	12	t	1	2026-07-16 22:06:10.693	2026-07-16 22:06:10.693
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.product_images (id, "productId", url, alt, "isPrimary", "sortOrder", "createdAt", "updatedAt") FROM stdin;
f6d5d254-705f-4d30-bcc4-dfc898d1a4c4	05a9c67b-637f-489e-bd2e-f25a750a0d82	/uploads/1784235801190-672849626.jpg	\N	t	0	2026-07-16 21:03:21.195	2026-07-16 21:03:21.195
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.product_variants (id, "productId", sku, barcode, "barcodeType", "barcodeImagePath", size, color, "purchasePrice", "sellingPrice", "gstPercentage", "stockQuantity", "reorderLevel", "isActive", "storeId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
2e7229b7-7730-4884-b512-beb695cf9cc3	05a9c67b-637f-489e-bd2e-f25a750a0d82	POLO-BLK-L	8901234567891	CODE128	\N	L	Black	550.00	999.00	GST_18	30	5	t	\N	2026-07-16 21:03:08.417	2026-07-16 21:03:21.341	2026-07-16 21:03:21.341
d988daa3-9258-401b-bcc7-23ee2c3d89b7	a1e9191c-3c8d-4860-856a-597378d4ee64	DENIM-BLU-M	8901000000001	CODE128	\N	M	Blue	800.00	1499.00	GST_12	45	5	t	\N	2026-07-16 21:19:31.329	2026-07-16 21:22:07.795	2026-07-16 21:22:07.795
fb854bda-40af-4660-951a-6cbc19f437c1	05a9c67b-637f-489e-bd2e-f25a750a0d82	POLO-BLK-M	8901234567890	CODE128	\N	M	Black	500.00	949.00	GST_18	44	10	t	\N	2026-07-16 21:03:08.322	2026-07-16 21:58:27.836	\N
6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	a1e9191c-3c8d-4860-856a-597378d4ee64	DENIM-BLU-L	8901000000002	CODE128	/uploads/barcodes/barcode-6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d.png	L	Blue	850.00	1599.00	GST_12	25	5	t	\N	2026-07-16 21:19:31.371	2026-07-16 21:58:27.841	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.products (id, name, slug, description, tags, "categoryId", "brandId", "createdAt", "updatedAt", "deletedAt", "isActive") FROM stdin;
05a9c67b-637f-489e-bd2e-f25a750a0d82	Polo T-Shirt	polo-t-shirt	Classic polo t-shirt	\N	58ef9f9a-b3b3-4f98-b5de-bc8aa590f02c	06da181d-603b-4a77-a162-f15f39344873	2026-07-16 21:03:08.187	2026-07-16 21:03:21.383	2026-07-16 21:03:21.382	t
a1e9191c-3c8d-4860-856a-597378d4ee64	Denim Jacket	denim-jacket	\N	\N	58ef9f9a-b3b3-4f98-b5de-bc8aa590f02c	06da181d-603b-4a77-a162-f15f39344873	2026-07-16 21:19:31.27	2026-07-16 21:19:31.27	\N	t
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.purchase_items (id, "purchaseId", "productVariantId", quantity, "unitCost", "totalCost", "createdAt", "updatedAt") FROM stdin;
5accab3b-6d3b-46f2-9188-60316c62edf9	79b40da1-2d8b-448b-bb44-a70c5f61a278	d988daa3-9258-401b-bcc7-23ee2c3d89b7	50	800.00	40000.00	2026-07-16 21:20:56.89	2026-07-16 21:20:56.89
3ce544fc-050d-4cd7-8852-211ea15f151f	79b40da1-2d8b-448b-bb44-a70c5f61a278	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	30	850.00	25500.00	2026-07-16 21:20:56.89	2026-07-16 21:20:56.89
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.purchases (id, "invoiceNumber", "supplierId", "purchaseDate", subtotal, "discountAmount", "taxAmount", "grandTotal", status, "paymentStatus", "paymentMode", notes, "storeId", "createdById", "createdAt", "updatedAt", "deletedAt") FROM stdin;
79b40da1-2d8b-448b-bb44-a70c5f61a278	INV-2026-004	cfa04312-a844-4ab4-85cd-abd145846fea	2026-07-16 00:00:00	65500.00	0.00	7860.00	73360.00	RECEIVED	PAID	CASH	\N	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:20:56.89	2026-07-16 21:20:56.89	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.refresh_tokens (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
af4118c0-e1c2-4fbd-9283-d1d07b9a1041	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWNjZGM3Ny03YjQyLTQxOWItYjY2Yi1lMTNjN2Y4YjZhYzIiLCJlbWFpbCI6ImNhc2hpZXJAa2FwZGEuY29tIiwicm9sZXMiOlsiQ0FTSElFUiJdLCJpYXQiOjE3ODQyMzU0NDcsImV4cCI6MTc4NDg0MDI0N30.V-ymilKFeSY0Gz8wfX6qXK8tYKB99tmoYkeIIivEZxg	a1ccdc77-7b42-419b-b66b-e13c7f8b6ac2	2026-07-23 20:57:27.262	2026-07-16 20:57:27.263
fa8c8cdc-67c2-4ea9-8d9c-e70349f47556	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWNjZGM3Ny03YjQyLTQxOWItYjY2Yi1lMTNjN2Y4YjZhYzIiLCJlbWFpbCI6ImNhc2hpZXJAa2FwZGEuY29tIiwicm9sZXMiOlsiQ0FTSElFUiJdLCJqdGkiOiI5NGU4Njk4ZS04OGI3LTRkMTYtYjIyYi03MTg5ODIxNmFlNTkiLCJpYXQiOjE3ODQyMzU0OTgsImV4cCI6MTc4NDg0MDI5OH0.jO355aYqOpZ2q86N_auJi2riNEOYep7NJclhvZq495o	a1ccdc77-7b42-419b-b66b-e13c7f8b6ac2	2026-07-23 20:58:18.432	2026-07-16 20:58:18.432
4b22be25-d08f-48b0-93c2-600c584fa5fd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWNjZGM3Ny03YjQyLTQxOWItYjY2Yi1lMTNjN2Y4YjZhYzIiLCJlbWFpbCI6ImNhc2hpZXJAa2FwZGEuY29tIiwicm9sZXMiOlsiQ0FTSElFUiJdLCJqdGkiOiJiZDU5ODVlNi1mZGZjLTQ2OTYtOGJjMy0yZDczMzkyODlhMTciLCJpYXQiOjE3ODQyMzU4MDEsImV4cCI6MTc4NDg0MDYwMX0.p9jjjxxopZE9P5ehyyDKRHloS4qPI-9ONw20OFilqJ0	a1ccdc77-7b42-419b-b66b-e13c7f8b6ac2	2026-07-23 21:03:21.035	2026-07-16 21:03:21.036
d25ce5ab-377d-49b5-a220-c9d9447d4ddb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWNjZGM3Ny03YjQyLTQxOWItYjY2Yi1lMTNjN2Y4YjZhYzIiLCJlbWFpbCI6ImNhc2hpZXJAa2FwZGEuY29tIiwicm9sZXMiOlsiQ0FTSElFUiJdLCJqdGkiOiIyNTRlOWM0MC1kZDNiLTRjYjQtOGFkYy1kZmQ0ZGU0MWZmMDQiLCJpYXQiOjE3ODQyMzU4NzEsImV4cCI6MTc4NDg0MDY3MX0.VS0Hv2DZhsM8-uZq-FxxKkcCqNxiLvYBlt9-sj-UEwI	a1ccdc77-7b42-419b-b66b-e13c7f8b6ac2	2026-07-23 21:04:31.373	2026-07-16 21:04:31.374
711e0800-83b4-4154-8d1a-b93c6aa918a7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWNjZGM3Ny03YjQyLTQxOWItYjY2Yi1lMTNjN2Y4YjZhYzIiLCJlbWFpbCI6ImNhc2hpZXJAa2FwZGEuY29tIiwicm9sZXMiOlsiQ0FTSElFUiJdLCJzdG9yZUlkIjoiMWY1YmUxN2ItMjFmZS00ZjY5LWFkM2MtYWEyZGVmZTYyNzJkIiwianRpIjoiYjRlY2U4MzktM2M0Ni00YzE1LTk2OTAtMDRlNzQ0ZTA0ODg5IiwiaWF0IjoxNzg0MjM2OTE2LCJleHAiOjE3ODQ4NDE3MTZ9.nAeRbKs1kNdIsSIafSmufw7HJhJ0bhG6DbisSYTZY8s	a1ccdc77-7b42-419b-b66b-e13c7f8b6ac2	2026-07-23 21:21:56.072	2026-07-16 21:21:56.073
81f2d409-b88c-4f6e-85ca-c2b204e28014	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiIzYTg2ZjQ5YS1mYjc5LTQzMDUtYmVjZS1lNDk0YzFiZGJmOTYiLCJpYXQiOjE3ODQyMzc1MzEsImV4cCI6MTc4NDg0MjMzMX0.5spNCXFlOyoGbQwEfH79sZDqr_0AHgOhUvbGXhNn1II	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:32:11.497	2026-07-16 21:32:11.499
82cbf860-ac61-42d4-bcd5-f6f59d9fa0d7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiIzMTQ4NzI1Ni04NGRlLTQ1MGYtYmQyMC00OTRiM2UzMjJhYzciLCJpYXQiOjE3ODQyMzc1NDEsImV4cCI6MTc4NDg0MjM0MX0.sB4kT-B4Puw_XM1BBF1Pr6WbleCZoHU8WhXAbS0aaS8	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:32:21.929	2026-07-16 21:32:21.93
409a75bd-ff7b-461f-8298-8982bee3b860	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiJhODlmMWFiYy00YTE4LTRhZTYtOTAyOS1lOGFhYzliNDZmN2YiLCJpYXQiOjE3ODQyMzc1NTIsImV4cCI6MTc4NDg0MjM1Mn0.DBYc7Xqp4kc563lx6_GS7qeqTrv5HS7P5Qq5pf3NJs8	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:32:32.969	2026-07-16 21:32:32.97
685aff22-c191-4c31-b8a0-0fb610ddbedf	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiIxOTEzZTMwNi02NTJmLTRhYTctYmVkMC1mYWE2MWRhOTEzMDUiLCJpYXQiOjE3ODQyMzc1NjUsImV4cCI6MTc4NDg0MjM2NX0.Qyx6IP11LdYOUP4dMvktkHXpTlXjoYamDJ2dsJgi3_w	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:32:45.802	2026-07-16 21:32:45.803
7956814f-d9e3-414c-87c2-d85e8cf69139	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiJlYjEwNjY3ZC00OTc1LTQ2NWMtOTliNy0zNjVhZjI4OTFhMGUiLCJpYXQiOjE3ODQyMzc1NzgsImV4cCI6MTc4NDg0MjM3OH0.7CRbWyQcLL9oikfOsBSUAnaNUjVaagikeH_bngp3BgA	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:32:58.312	2026-07-16 21:32:58.313
68b00467-7ffe-4041-b074-98651ddcd04f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiIyMDBjZjdiNS01Y2EwLTQzMTItYTQ4Ni1jMTk3ZWQwNDRmYjkiLCJpYXQiOjE3ODQyMzc1ODMsImV4cCI6MTc4NDg0MjM4M30.GsMilAl8Upt1KLIMiYTbADITu-9ORry10U3BtNDNqqY	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:33:03.416	2026-07-16 21:33:03.417
63834c38-386c-442e-b06b-282a8cd2c3fb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiIyMmE0ZjMxYi0yNjUzLTQyYTItYThjNy1iNjU0NTM5NWZhOWMiLCJpYXQiOjE3ODQyMzc1ODksImV4cCI6MTc4NDg0MjM4OX0.QhgysqsAlq8hWtzmpCQxOtUbNPAtsugk22auoubF9sI	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:33:09.181	2026-07-16 21:33:09.182
079ab4f3-9b95-4646-a07b-8534e4f12351	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiI1NDI0NTU4Yy04ZTk1LTRlNWYtOWY2ZC00ZWM2ZDk4MTExZjEiLCJpYXQiOjE3ODQyMzc1OTYsImV4cCI6MTc4NDg0MjM5Nn0.2wmKRYGSCMs1wQTRjc2Ngbl9I8Kw-03tqcr6V4O0YgA	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:33:16.937	2026-07-16 21:33:16.938
ae045eb0-90e8-4ce8-bbb6-aed203778e6f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiJkMTRhMjZlZC00OTM4LTRmZDQtYTUzZS0xYjU0MmQ5N2NiYWUiLCJpYXQiOjE3ODQyMzc3NDIsImV4cCI6MTc4NDg0MjU0Mn0.5oGLW3BRUmsmLIJQ6L-QldIGcBAg_lHn4TFOOizAwgk	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:35:42.231	2026-07-16 21:35:42.233
2f529aef-1106-476c-a2a0-30343ac4f06f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiI3ZTJhNTllZS1hYzUxLTRiMTgtODY3Yi1mOWEwZWE2MDU3MmEiLCJpYXQiOjE3ODQyMzc5NzIsImV4cCI6MTc4NDg0Mjc3Mn0.flDOPtyll6p1v5o-WLQNJUtGR6AD7wL9T_2s2QkMlbw	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:39:32.925	2026-07-16 21:39:32.927
5f662a7e-d834-4f7e-a8e0-7d2a93a0f5cc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiI3MjRlNTAyOS02NjFjLTRmOTQtOGJmYy1hODkyZmM2MzNmMWIiLCJpYXQiOjE3ODQyMzc5ODQsImV4cCI6MTc4NDg0Mjc4NH0.LrAjJa5Vy1114rrB5TFDD_pnmg10b3nsH2hu_Icl8Vo	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:39:44.33	2026-07-16 21:39:44.331
024c44fb-29ab-4ac0-910c-a2c4ba4e7bd2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWNjZGM3Ny03YjQyLTQxOWItYjY2Yi1lMTNjN2Y4YjZhYzIiLCJlbWFpbCI6ImNhc2hpZXJAa2FwZGEuY29tIiwicm9sZXMiOlsiQ0FTSElFUiJdLCJzdG9yZUlkIjoiMWY1YmUxN2ItMjFmZS00ZjY5LWFkM2MtYWEyZGVmZTYyNzJkIiwianRpIjoiZTFlZTViOTItOTI2Mi00ZDU3LWE5NmYtMDQ1YWQ2YjZjZDI3IiwiaWF0IjoxNzg0MjM3OTg1LCJleHAiOjE3ODQ4NDI3ODV9.IQuvMTWka8yHBvJvyuA16Q1LY_jaazK1-LGeuAVRjTI	a1ccdc77-7b42-419b-b66b-e13c7f8b6ac2	2026-07-23 21:39:45.196	2026-07-16 21:39:45.197
889af6dc-6b8c-4acd-9e92-ee83aaa92ebf	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiI2MDViMjFlNi01NmNiLTRiODEtYTc2ZS02Mzg3Y2RkZTRjOTQiLCJpYXQiOjE3ODQyMzkwMTgsImV4cCI6MTc4NDg0MzgxOH0.13JeN6QK4sJ_fqp5B3saf7GPf87PdBZBQnJaQ4YPNk4	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:56:58.308	2026-07-16 21:56:58.31
9fc03a40-fc5d-4c19-a25c-968aa7740993	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiIwMGZhYTQyOC0xM2Q4LTQ5MmYtYTYwZS1jY2QyODQ4MTY2YzMiLCJpYXQiOjE3ODQyMzkwMjcsImV4cCI6MTc4NDg0MzgyN30.kmLc5Xam8IMbn35sMG3pzFWFb2CKgBI9AgxFMkBWmXo	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:57:07.152	2026-07-16 21:57:07.153
82b09a2a-492e-450b-989e-17f6be715483	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiI0ZjcxMDA0My00Y2NjLTQ4NzYtYjNmNC0xN2E2YjhhMzdkYWMiLCJpYXQiOjE3ODQyMzkwNDIsImV4cCI6MTc4NDg0Mzg0Mn0.8OBLtYUmqHP0kKoJIz0a1I5cbdb8Cx8-cmab-n8brhY	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:57:22.727	2026-07-16 21:57:22.728
57e40c9d-a8f5-4da7-8ed7-d4635a28d509	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWNjZGM3Ny03YjQyLTQxOWItYjY2Yi1lMTNjN2Y4YjZhYzIiLCJlbWFpbCI6ImNhc2hpZXJAa2FwZGEuY29tIiwicm9sZXMiOlsiQ0FTSElFUiJdLCJzdG9yZUlkIjoiMWY1YmUxN2ItMjFmZS00ZjY5LWFkM2MtYWEyZGVmZTYyNzJkIiwianRpIjoiZWY3YWM5YjgtOWMwNy00NjA3LWI3MDgtZWU1YzdkNzFkOWM4IiwiaWF0IjoxNzg0MjM5MDQzLCJleHAiOjE3ODQ4NDM4NDN9.afq7bElM42liHrROXY2QUJLnds1sXyExs34Hx0q-po8	a1ccdc77-7b42-419b-b66b-e13c7f8b6ac2	2026-07-23 21:57:23.189	2026-07-16 21:57:23.189
d262b9dc-8931-4032-9d56-a5fa8ef16fce	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiJmODRmMjMwZS04MTI3LTQ2OGYtODZiYy1iYjY0ZDQ5NWFhZDYiLCJpYXQiOjE3ODQyMzkwNTQsImV4cCI6MTc4NDg0Mzg1NH0.8bT0nGFNl5D3O55tRCpiu64bE7y5iE2_uR2TxzMFeAQ	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:57:34.901	2026-07-16 21:57:34.902
cff872f0-f3b1-4482-9518-7247f3c9f96c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiI5Y2ViMWJhMy03YTQ4LTRlZDMtOWM5YS0wNDY4ZWEyY2ZhNzQiLCJpYXQiOjE3ODQyMzkxMDcsImV4cCI6MTc4NDg0MzkwN30.eV5GZ49S1-KansMvfqymV7E4bkH2FXIEbE8IWMXRczE	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:58:27.263	2026-07-16 21:58:27.265
23c08974-9e17-406c-8dd0-466b4d172e43	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiJlZGVlN2ZjNC1hNWVmLTQ1MDUtOTljZi05MmYyMGE3ZGQ4NTQiLCJpYXQiOjE3ODQyMzkxMTYsImV4cCI6MTc4NDg0MzkxNn0.CbZoXS3nPaWlzKSJRuB6P0qilDBC8EqwmaaAR5LKjm4	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 21:58:36.239	2026-07-16 21:58:36.24
29087ff9-5ce2-459e-9f64-bd37ec27e747	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiI5NjQ1MWQzYy0yODQ3LTQ1ODQtYTM4OC0wMGQzZmMwYjMwZTYiLCJpYXQiOjE3ODQyMzk1NjUsImV4cCI6MTc4NDg0NDM2NX0.fnMHxOojsO4x3h_Qi0Wx-4u-4cVWk7VnxKCeixL_Tyw	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 22:06:05.029	2026-07-16 22:06:05.03
17d0944e-95b3-479c-866a-33495690838b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiJhMTE5YTczOC00Y2QzLTQ5NTgtOGE4NS1kNjRmZmE4YmM3YWIiLCJpYXQiOjE3ODQyMzk1NzAsImV4cCI6MTc4NDg0NDM3MH0.sB4fBOeSPj6nE8OXDTyR3KK5Xs0fwN3CBBJsOPETjt8	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 22:06:10.336	2026-07-16 22:06:10.337
275d4a40-abd8-4031-8b09-a2184b7b2bf3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiI2ZTVhZWUxZS1hNzI2LTQ2NWUtYTdlZi1lOTY1MTliZGM3MmIiLCJpYXQiOjE3ODQyMzk1NzYsImV4cCI6MTc4NDg0NDM3Nn0.T8_hFK_fuaxqEYpr2zGsGMFLuxaPDTIIisOpuCvpsMY	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 22:06:16.061	2026-07-16 22:06:16.062
44360441-92f7-4488-a25a-93420c402176	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTliMmNkMi0wODI0LTRiZTktYTE4ZS03NzFhMTdhMjQ4OGIiLCJlbWFpbCI6ImFkbWluQGthcGRhLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sInN0b3JlSWQiOiIxZjViZTE3Yi0yMWZlLTRmNjktYWQzYy1hYTJkZWZlNjI3MmQiLCJqdGkiOiJiMGE2NTg2My05NTg2LTRjYzEtODY4ZS04NzE3OTk3MWU3OWEiLCJpYXQiOjE3ODQyMzk1ODEsImV4cCI6MTc4NDg0NDM4MX0.glh08vloB3Coindnzpy9m_ZRa5iCSNI1VXOJqRKesZk	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-23 22:06:21.485	2026-07-16 22:06:21.487
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.roles (id, name, description, "createdAt", "updatedAt") FROM stdin;
861c504c-8de6-4d38-8aad-cb1123cc5382	ADMIN	Full system access	2026-07-16 20:53:36.909	2026-07-16 20:53:36.909
1eb517c6-b8ec-4665-a666-423ab7419e69	MANAGER	Manage inventory, products, customers, view reports	2026-07-16 20:53:36.918	2026-07-16 20:53:36.918
4430f9fb-065f-4996-8302-9025ba92fb78	CASHIER	Generate bills, search products, view customers	2026-07-16 20:53:36.92	2026-07-16 20:53:36.92
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.sale_items (id, "saleId", "productVariantId", quantity, "unitPrice", "gstPercentage", "gstAmount", "totalPrice", "createdAt", "updatedAt") FROM stdin;
beed8809-05b6-41f6-8dff-0ae8a5b140c2	b15a86ef-1ce6-4eaf-b93c-010129fefca5	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	1	1599.00	12	0.00	1599.00	2026-07-16 21:32:22.497	2026-07-16 21:32:22.497
e2f84b4e-3bd0-4a16-b036-c00be9f3b9be	80c7727a-d71a-4b82-b737-58355497a75f	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	1	1599.00	12	0.00	1599.00	2026-07-16 21:32:33.321	2026-07-16 21:32:33.321
e4c49809-65af-48a2-b28d-1df1079f2f8e	9a256cb1-49f1-476c-a017-ecd8599b5556	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	2	800.00	12	192.00	1600.00	2026-07-16 21:33:09.361	2026-07-16 21:33:09.361
e9f20118-4175-4cc4-aeda-dbb279fc7291	fab000ca-8543-4edd-8ec4-3ede7f7ae4a8	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	2	1599.00	12	383.76	3198.00	2026-07-16 21:35:42.784	2026-07-16 21:35:42.784
54c01daa-754d-448b-97db-9be79c2898e5	ce82fbea-e636-4c31-95ef-9afe70c30b82	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	1	500.00	12	0.00	500.00	2026-07-16 21:57:23.735	2026-07-16 21:57:23.735
ae047551-e5e1-4242-8563-fbb5b4eb726f	4b7f9c67-af21-48d3-baef-e48db04cd98e	fb854bda-40af-4660-951a-6cbc19f437c1	2	500.00	18	0.00	1000.00	2026-07-16 21:58:27.494	2026-07-16 21:58:27.494
bea9c1be-7b4f-4d0c-ac86-d4749ae6f809	784d1062-e15d-4523-9f4d-d6a5c610108b	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	1	1599.00	0	0.00	1599.00	2026-07-16 21:58:27.838	2026-07-16 21:58:27.838
\.


--
-- Data for Name: sale_payments; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.sale_payments (id, "saleId", mode, amount, reference, "createdAt") FROM stdin;
24841178-429c-41d0-957c-7dd1ece71cc0	b15a86ef-1ce6-4eaf-b93c-010129fefca5	CASH	1599.00	\N	2026-07-16 21:32:22.497
1dce14e0-eab8-4b51-877c-0de2d1ed98d2	80c7727a-d71a-4b82-b737-58355497a75f	CASH	1599.00	\N	2026-07-16 21:32:33.321
f178409f-2759-4c28-b80d-3d929a0482de	9a256cb1-49f1-476c-a017-ecd8599b5556	CASH	1792.00	\N	2026-07-16 21:33:09.361
125a02d8-f78e-481d-bd7a-0022330ff677	fab000ca-8543-4edd-8ec4-3ede7f7ae4a8	CASH	3581.76	\N	2026-07-16 21:35:42.784
1b1825db-4ba8-434b-872f-f96dbad4db47	ce82fbea-e636-4c31-95ef-9afe70c30b82	CASH	500.00	\N	2026-07-16 21:57:23.735
ea4a1493-9305-43d2-9052-c3b21a72872b	ce82fbea-e636-4c31-95ef-9afe70c30b82	STORE_CREDIT	250.00	CN-20260717-VQ4T	2026-07-16 21:57:23.814
cad15fc2-3f48-42ed-965d-849a74a717bd	4b7f9c67-af21-48d3-baef-e48db04cd98e	CASH	1000.00	\N	2026-07-16 21:58:27.494
d46b2ed5-5f51-47ef-b500-a4e081caf2cf	784d1062-e15d-4523-9f4d-d6a5c610108b	CASH	1099.00	\N	2026-07-16 21:58:27.838
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.sales (id, "invoiceNumber", "customerId", "saleDate", subtotal, "discountAmount", "taxAmount", "grandTotal", "isGst", notes, "storeId", "createdById", "createdAt", "updatedAt", "deletedAt") FROM stdin;
b15a86ef-1ce6-4eaf-b93c-010129fefca5	POS-20260717-3ZMK	\N	2026-07-16 21:32:22.495	1599.00	0.00	0.00	1599.00	f	\N	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:32:22.497	2026-07-16 21:32:22.497	\N
80c7727a-d71a-4b82-b737-58355497a75f	POS-20260717-Q50K	\N	2026-07-16 21:32:33.32	1599.00	0.00	0.00	1599.00	f	\N	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:32:33.321	2026-07-16 21:32:33.321	\N
9a256cb1-49f1-476c-a017-ecd8599b5556	POS-20260717-9YMG	cc187920-565b-4876-bcf1-e3a1509eb557	2026-07-16 21:33:09.36	1600.00	0.00	192.00	1792.00	t	\N	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:33:09.361	2026-07-16 21:33:17.176	2026-07-16 21:33:17.175
fab000ca-8543-4edd-8ec4-3ede7f7ae4a8	POS-20260717-V3NH	cc187920-565b-4876-bcf1-e3a1509eb557	2026-07-16 21:35:42.782	3198.00	0.00	383.76	3581.76	t	\N	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:35:42.784	2026-07-16 21:35:42.784	\N
ce82fbea-e636-4c31-95ef-9afe70c30b82	POS-20260717-8ESQ	\N	2026-07-16 21:57:23.734	500.00	0.00	0.00	500.00	f	\N	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:57:23.735	2026-07-16 21:57:23.735	\N
4b7f9c67-af21-48d3-baef-e48db04cd98e	POS-20260717-69WR	\N	2026-07-16 21:58:27.493	1000.00	0.00	0.00	1000.00	f	\N	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:58:27.494	2026-07-16 21:58:27.494	\N
784d1062-e15d-4523-9f4d-d6a5c610108b	EXC-MRO1WANR	\N	2026-07-16 21:58:27.837	1599.00	0.00	0.00	1599.00	f	Exchange from POS-20260717-69WR	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:58:27.838	2026-07-16 21:58:27.838	\N
\.


--
-- Data for Name: sales_return_items; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.sales_return_items (id, "salesReturnId", "saleItemId", "productVariantId", quantity, "unitPrice", "totalAmount", reason, "createdAt", "updatedAt", condition) FROM stdin;
1a571e6e-a156-404a-b117-dc4420102d5f	61a70917-77ad-4076-8ad3-ac1197faffba	e9f20118-4175-4cc4-aeda-dbb279fc7291	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	1	1599.00	1599.00	\N	2026-07-16 21:57:07.24	2026-07-16 21:57:07.24	RESELLABLE
d2aa1d3d-4db4-4f95-9c98-78342fb6b365	d634bfcb-ee0a-4c96-91ea-81a00672afcc	e9f20118-4175-4cc4-aeda-dbb279fc7291	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	1	1599.00	1599.00	\N	2026-07-16 21:57:23.464	2026-07-16 21:57:23.464	DAMAGED
ff566a5f-35e6-4fb8-a50c-1e38f6a46fd5	3bed9044-9edc-42fe-8068-0e702499e1f9	ae047551-e5e1-4242-8563-fbb5b4eb726f	fb854bda-40af-4660-951a-6cbc19f437c1	1	500.00	500.00	\N	2026-07-16 21:58:27.833	2026-07-16 21:58:27.833	RESELLABLE
\.


--
-- Data for Name: sales_returns; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.sales_returns (id, "returnNumber", "saleId", "returnDate", "totalAmount", reason, "storeId", "createdById", "createdAt", "updatedAt", "deletedAt", "refundAmount", "refundDate", "refundMethod", "refundProcessedById") FROM stdin;
61a70917-77ad-4076-8ad3-ac1197faffba	RTR-20260717-WGO7	fab000ca-8543-4edd-8ec4-3ede7f7ae4a8	2026-07-16 21:57:07.239	1599.00	Wrong size ordered	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:57:07.24	2026-07-16 21:57:23.212	\N	1599.00	2026-07-16 21:57:23.211	UPI	699b2cd2-0824-4be9-a18e-771a17a2488b
d634bfcb-ee0a-4c96-91ea-81a00672afcc	RTR-20260717-2FP8	fab000ca-8543-4edd-8ec4-3ede7f7ae4a8	2026-07-16 21:57:23.463	1599.00	Defective product	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:57:23.464	2026-07-16 21:57:23.464	\N	\N	\N	\N	\N
3bed9044-9edc-42fe-8068-0e702499e1f9	RTR-20260717-MNO3	4b7f9c67-af21-48d3-baef-e48db04cd98e	2026-07-16 21:58:27.832	500.00	Exchange	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:58:27.833	2026-07-16 21:58:27.833	\N	\N	\N	\N	\N
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.stock_movements (id, "productVariantId", quantity, type, "purchaseItemId", "saleItemId", "salesReturnItemId", notes, "storeId", "createdById", "createdAt", "adjustmentReason", "newStock", "previousStock") FROM stdin;
6503f83a-2732-439b-88c7-61e3538784af	d988daa3-9258-401b-bcc7-23ee2c3d89b7	50	PURCHASE	5accab3b-6d3b-46f2-9188-60316c62edf9	\N	\N	Purchase: INV-2026-004	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:20:56.905	\N	50	0
fb70173a-762c-49d8-a0ce-420299d07413	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	30	PURCHASE	3ce544fc-050d-4cd7-8852-211ea15f151f	\N	\N	Purchase: INV-2026-004	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:20:56.912	\N	30	0
4ba29849-0411-47ab-8f95-1b8ca8554143	d988daa3-9258-401b-bcc7-23ee2c3d89b7	-5	DAMAGE	\N	\N	\N	Display piece damaged	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:21:19.433	DAMAGE	45	50
bcc979a4-1d68-4494-9792-c1d8a96e9ab8	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	-1	SALE	\N	beed8809-05b6-41f6-8dff-0ae8a5b140c2	\N	Sale POS-20260717-3ZMK	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:32:22.514	\N	29	30
bc4fc0e0-4784-4470-860e-5316f678de05	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	-1	SALE	\N	e2f84b4e-3bd0-4a16-b036-c00be9f3b9be	\N	Sale POS-20260717-Q50K	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:32:33.328	\N	28	29
a4b44361-de67-4436-8a95-bfb0ab21ebef	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	-2	SALE	\N	e4c49809-65af-48a2-b28d-1df1079f2f8e	\N	Sale POS-20260717-9YMG	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:33:09.366	\N	26	28
96c0d3c2-2f77-4753-9770-16d676f7a0bb	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	2	RETURN	\N	\N	\N	Cancelled sale POS-20260717-9YMG	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:33:17.179	\N	28	26
33b1654b-52b4-4e51-8b14-112cb296719d	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	-2	SALE	\N	e9f20118-4175-4cc4-aeda-dbb279fc7291	\N	Sale POS-20260717-V3NH	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:35:42.813	\N	26	28
291be647-2be8-428b-ba2c-3814413ef359	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	1	RETURN	\N	\N	1a571e6e-a156-404a-b117-dc4420102d5f	Return RTR-20260717-WGO7 - RESELLABLE	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:57:07.257	\N	27	26
07234726-0b47-402c-b773-f5c0cd3e124b	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	-1	DAMAGE	\N	\N	d2aa1d3d-4db4-4f95-9c98-78342fb6b365	Return RTR-20260717-2FP8 - DAMAGED	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:57:23.467	\N	27	27
55038795-20ac-47df-8fa6-f18232f82d0d	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	-1	SALE	\N	54c01daa-754d-448b-97db-9be79c2898e5	\N	Sale POS-20260717-8ESQ	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:57:23.741	\N	26	27
eae4510a-5d1c-4191-af34-b8ee1ad8eb62	fb854bda-40af-4660-951a-6cbc19f437c1	-2	SALE	\N	ae047551-e5e1-4242-8563-fbb5b4eb726f	\N	Sale POS-20260717-69WR	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:58:27.504	\N	43	45
b8c5cc7a-eed6-45c2-85c0-caaa230a6f14	fb854bda-40af-4660-951a-6cbc19f437c1	1	RETURN	\N	\N	\N	Exchange return RTR-20260717-MNO3	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:58:27.837	\N	44	43
e39ccd50-cf47-4ac0-8574-9ed3bbde1279	6e4b71d7-6d24-4c2b-9bf3-b2633b2c661d	-1	SALE	\N	bea9c1be-7b4f-4d0c-ac86-d4749ae6f809	\N	Exchange sale EXC-MRO1WANR	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	699b2cd2-0824-4be9-a18e-771a17a2488b	2026-07-16 21:58:27.842	\N	25	26
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.stores (id, name, code, address, city, state, pincode, phone, email, gstin, "isActive", "createdAt", "updatedAt", "deletedAt", currency, "financialYear", language, logo, "ownerName", "panNumber", timezone, website) FROM stdin;
1f5be17b-21fe-4f69-ad3c-aa2defe6272d	Main Store	MAIN	123 Main Street	New Delhi	Delhi	\N	+91-9999999999	store@central_one.com	07ABCDE1234F1Z5	t	2026-07-16 20:53:36.922	2026-07-16 20:53:36.922	\N	INR	\N	en	\N	\N	\N	Asia/Kolkata	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.suppliers (id, name, "contactPerson", email, phone, address, city, state, pincode, gstin, "storeId", "createdAt", "updatedAt", "deletedAt", "isActive") FROM stdin;
cfa04312-a844-4ab4-85cd-abd145846fea	Fashion Fabrics Co.	Rajesh Kumar	rajesh@ffc.com	+91-9876543210	\N	\N	\N	\N	07ABCDE1234F1Z5	\N	2026-07-16 21:19:30.984	2026-07-16 21:19:30.984	\N	t
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.user_preferences (id, "userId", theme, language, "defaultLandingPage", "defaultPrinter", "defaultPaymentMethod", "itemsPerPage", "createdAt", "updatedAt") FROM stdin;
d88c07e3-8b9d-450c-a323-ab7799c33698	699b2cd2-0824-4be9-a18e-771a17a2488b	dark	en	/	\N	\N	25	2026-07-16 22:06:16.084	2026-07-16 22:06:16.153
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.user_roles ("userId", "roleId", "createdAt") FROM stdin;
699b2cd2-0824-4be9-a18e-771a17a2488b	861c504c-8de6-4d38-8aad-cb1123cc5382	2026-07-16 20:53:37.233
cc75a6d0-7b55-4120-81a5-e883b8453e5d	1eb517c6-b8ec-4665-a666-423ab7419e69	2026-07-16 20:53:37.516
a1ccdc77-7b42-419b-b66b-e13c7f8b6ac2	4430f9fb-065f-4996-8302-9025ba92fb78	2026-07-16 20:53:37.796
f46680f4-cd54-4da6-adc8-ac247335fd55	4430f9fb-065f-4996-8302-9025ba92fb78	2026-07-16 20:57:19.034
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: central_one
--

COPY public.users (id, email, phone, "passwordHash", "firstName", "lastName", "isActive", "storeId", "createdAt", "updatedAt", "deletedAt", "createdById") FROM stdin;
cc75a6d0-7b55-4120-81a5-e883b8453e5d	manager@central_one.com	+91-9999999997	$2b$12$hadS0wM3lIvAyeOrua97hemNXtsD6s20r9uxZjqKttZT0bD9f8MmS	Manager	User	t	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	2026-07-16 20:53:37.512	2026-07-16 20:53:37.512	\N	699b2cd2-0824-4be9-a18e-771a17a2488b
a1ccdc77-7b42-419b-b66b-e13c7f8b6ac2	cashier@central_one.com	+91-9999999996	$2b$12$5Yd/FxUmYsSXeZBugI9dsucFT6.lAekMeNnsX8XOhsJbZOqqxL2Ge	Cashier	User	t	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	2026-07-16 20:53:37.793	2026-07-16 20:53:37.793	\N	699b2cd2-0824-4be9-a18e-771a17a2488b
f46680f4-cd54-4da6-adc8-ac247335fd55	test2@central_one.com	\N	$2b$12$aESY2Dc42YNMP0LRr1L/k.P0lwvYsXDS2Mz7y.tEczQ87dhoxfo46	Test	\N	t	\N	2026-07-16 20:57:19.027	2026-07-16 20:57:19.027	\N	699b2cd2-0824-4be9-a18e-771a17a2488b
699b2cd2-0824-4be9-a18e-771a17a2488b	admin@central_one.com	+91-9999999998	$2b$12$C4OOTXKO/9W7OQpEgXpFke9.7uvbsUljLY4nYEmX3X.U5x2mA9v92	Admin	User	t	1f5be17b-21fe-4f69-ad3c-aa2defe6272d	2026-07-16 20:53:37.228	2026-07-16 21:22:10.669	\N	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: backups backups_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_pkey PRIMARY KEY (id);


--
-- Name: barcode_settings barcode_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.barcode_settings
    ADD CONSTRAINT barcode_settings_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: credit_note_redemptions credit_note_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.credit_note_redemptions
    ADD CONSTRAINT credit_note_redemptions_pkey PRIMARY KEY (id);


--
-- Name: credit_notes credit_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT credit_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: gst_settings gst_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.gst_settings
    ADD CONSTRAINT gst_settings_pkey PRIMARY KEY (id);


--
-- Name: invoice_settings invoice_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.invoice_settings
    ADD CONSTRAINT invoice_settings_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: printer_settings printer_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.printer_settings
    ADD CONSTRAINT printer_settings_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_items purchase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sale_payments sale_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sale_payments
    ADD CONSTRAINT sale_payments_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sales_return_items sales_return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales_return_items
    ADD CONSTRAINT sales_return_items_pkey PRIMARY KEY (id);


--
-- Name: sales_returns sales_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT sales_returns_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY ("userId", "roleId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_module_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX audit_logs_module_idx ON public.audit_logs USING btree (module);


--
-- Name: audit_logs_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "audit_logs_storeId_idx" ON public.audit_logs USING btree ("storeId");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: backups_createdAt_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "backups_createdAt_idx" ON public.backups USING btree ("createdAt");


--
-- Name: backups_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "backups_storeId_idx" ON public.backups USING btree ("storeId");


--
-- Name: barcode_settings_storeId_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "barcode_settings_storeId_key" ON public.barcode_settings USING btree ("storeId");


--
-- Name: brands_slug_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX brands_slug_idx ON public.brands USING btree (slug);


--
-- Name: brands_slug_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX brands_slug_key ON public.brands USING btree (slug);


--
-- Name: brands_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "brands_storeId_idx" ON public.brands USING btree ("storeId");


--
-- Name: categories_parentId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "categories_parentId_idx" ON public.categories USING btree ("parentId");


--
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: categories_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "categories_storeId_idx" ON public.categories USING btree ("storeId");


--
-- Name: credit_note_redemptions_creditNoteId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "credit_note_redemptions_creditNoteId_idx" ON public.credit_note_redemptions USING btree ("creditNoteId");


--
-- Name: credit_note_redemptions_saleId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "credit_note_redemptions_saleId_idx" ON public.credit_note_redemptions USING btree ("saleId");


--
-- Name: credit_notes_creditNoteNumber_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "credit_notes_creditNoteNumber_idx" ON public.credit_notes USING btree ("creditNoteNumber");


--
-- Name: credit_notes_creditNoteNumber_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "credit_notes_creditNoteNumber_key" ON public.credit_notes USING btree ("creditNoteNumber");


--
-- Name: credit_notes_customerId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "credit_notes_customerId_idx" ON public.credit_notes USING btree ("customerId");


--
-- Name: credit_notes_status_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX credit_notes_status_idx ON public.credit_notes USING btree (status);


--
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- Name: customers_phone_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX customers_phone_idx ON public.customers USING btree (phone);


--
-- Name: customers_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "customers_storeId_idx" ON public.customers USING btree ("storeId");


--
-- Name: expenses_category_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX expenses_category_idx ON public.expenses USING btree (category);


--
-- Name: expenses_date_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX expenses_date_idx ON public.expenses USING btree (date);


--
-- Name: expenses_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "expenses_storeId_idx" ON public.expenses USING btree ("storeId");


--
-- Name: gst_settings_storeId_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "gst_settings_storeId_key" ON public.gst_settings USING btree ("storeId");


--
-- Name: invoice_settings_storeId_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "invoice_settings_storeId_key" ON public.invoice_settings USING btree ("storeId");


--
-- Name: notification_settings_userId_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "notification_settings_userId_key" ON public.notification_settings USING btree ("userId");


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_userId_isRead_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "notifications_userId_isRead_idx" ON public.notifications USING btree ("userId", "isRead");


--
-- Name: printer_settings_storeId_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "printer_settings_storeId_key" ON public.printer_settings USING btree ("storeId");


--
-- Name: product_images_productId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "product_images_productId_idx" ON public.product_images USING btree ("productId");


--
-- Name: product_images_productId_isPrimary_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "product_images_productId_isPrimary_idx" ON public.product_images USING btree ("productId", "isPrimary");


--
-- Name: product_variants_barcode_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX product_variants_barcode_idx ON public.product_variants USING btree (barcode);


--
-- Name: product_variants_barcode_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX product_variants_barcode_key ON public.product_variants USING btree (barcode);


--
-- Name: product_variants_isActive_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "product_variants_isActive_idx" ON public.product_variants USING btree ("isActive");


--
-- Name: product_variants_productId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "product_variants_productId_idx" ON public.product_variants USING btree ("productId");


--
-- Name: product_variants_productId_size_color_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "product_variants_productId_size_color_key" ON public.product_variants USING btree ("productId", size, color);


--
-- Name: product_variants_productId_sku_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "product_variants_productId_sku_key" ON public.product_variants USING btree ("productId", sku);


--
-- Name: product_variants_size_color_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX product_variants_size_color_idx ON public.product_variants USING btree (size, color);


--
-- Name: product_variants_sku_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku);


--
-- Name: product_variants_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "product_variants_storeId_idx" ON public.product_variants USING btree ("storeId");


--
-- Name: products_brandId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "products_brandId_idx" ON public.products USING btree ("brandId");


--
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- Name: products_isActive_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "products_isActive_idx" ON public.products USING btree ("isActive");


--
-- Name: products_name_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX products_name_idx ON public.products USING btree (name);


--
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: purchase_items_productVariantId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "purchase_items_productVariantId_idx" ON public.purchase_items USING btree ("productVariantId");


--
-- Name: purchase_items_purchaseId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "purchase_items_purchaseId_idx" ON public.purchase_items USING btree ("purchaseId");


--
-- Name: purchases_invoiceNumber_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "purchases_invoiceNumber_idx" ON public.purchases USING btree ("invoiceNumber");


--
-- Name: purchases_invoiceNumber_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "purchases_invoiceNumber_key" ON public.purchases USING btree ("invoiceNumber");


--
-- Name: purchases_purchaseDate_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "purchases_purchaseDate_idx" ON public.purchases USING btree ("purchaseDate");


--
-- Name: purchases_status_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX purchases_status_idx ON public.purchases USING btree (status);


--
-- Name: purchases_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "purchases_storeId_idx" ON public.purchases USING btree ("storeId");


--
-- Name: purchases_supplierId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "purchases_supplierId_idx" ON public.purchases USING btree ("supplierId");


--
-- Name: refresh_tokens_token_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX refresh_tokens_token_idx ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_userId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "refresh_tokens_userId_idx" ON public.refresh_tokens USING btree ("userId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: sale_items_productVariantId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sale_items_productVariantId_idx" ON public.sale_items USING btree ("productVariantId");


--
-- Name: sale_items_saleId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sale_items_saleId_idx" ON public.sale_items USING btree ("saleId");


--
-- Name: sale_payments_saleId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sale_payments_saleId_idx" ON public.sale_payments USING btree ("saleId");


--
-- Name: sales_customerId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_customerId_idx" ON public.sales USING btree ("customerId");


--
-- Name: sales_invoiceNumber_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_invoiceNumber_idx" ON public.sales USING btree ("invoiceNumber");


--
-- Name: sales_invoiceNumber_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "sales_invoiceNumber_key" ON public.sales USING btree ("invoiceNumber");


--
-- Name: sales_return_items_productVariantId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_return_items_productVariantId_idx" ON public.sales_return_items USING btree ("productVariantId");


--
-- Name: sales_return_items_saleItemId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_return_items_saleItemId_idx" ON public.sales_return_items USING btree ("saleItemId");


--
-- Name: sales_return_items_salesReturnId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_return_items_salesReturnId_idx" ON public.sales_return_items USING btree ("salesReturnId");


--
-- Name: sales_returns_returnNumber_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_returns_returnNumber_idx" ON public.sales_returns USING btree ("returnNumber");


--
-- Name: sales_returns_returnNumber_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "sales_returns_returnNumber_key" ON public.sales_returns USING btree ("returnNumber");


--
-- Name: sales_returns_saleId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_returns_saleId_idx" ON public.sales_returns USING btree ("saleId");


--
-- Name: sales_returns_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_returns_storeId_idx" ON public.sales_returns USING btree ("storeId");


--
-- Name: sales_saleDate_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_saleDate_idx" ON public.sales USING btree ("saleDate");


--
-- Name: sales_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "sales_storeId_idx" ON public.sales USING btree ("storeId");


--
-- Name: stock_movements_createdAt_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "stock_movements_createdAt_idx" ON public.stock_movements USING btree ("createdAt");


--
-- Name: stock_movements_productVariantId_createdAt_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "stock_movements_productVariantId_createdAt_idx" ON public.stock_movements USING btree ("productVariantId", "createdAt");


--
-- Name: stock_movements_productVariantId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "stock_movements_productVariantId_idx" ON public.stock_movements USING btree ("productVariantId");


--
-- Name: stock_movements_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "stock_movements_storeId_idx" ON public.stock_movements USING btree ("storeId");


--
-- Name: stock_movements_type_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX stock_movements_type_idx ON public.stock_movements USING btree (type);


--
-- Name: stores_code_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX stores_code_idx ON public.stores USING btree (code);


--
-- Name: stores_code_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX stores_code_key ON public.stores USING btree (code);


--
-- Name: stores_isActive_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "stores_isActive_idx" ON public.stores USING btree ("isActive");


--
-- Name: suppliers_email_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX suppliers_email_idx ON public.suppliers USING btree (email);


--
-- Name: suppliers_gstin_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX suppliers_gstin_key ON public.suppliers USING btree (gstin);


--
-- Name: suppliers_phone_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX suppliers_phone_idx ON public.suppliers USING btree (phone);


--
-- Name: suppliers_phone_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX suppliers_phone_key ON public.suppliers USING btree (phone);


--
-- Name: suppliers_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "suppliers_storeId_idx" ON public.suppliers USING btree ("storeId");


--
-- Name: user_preferences_userId_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX "user_preferences_userId_key" ON public.user_preferences USING btree ("userId");


--
-- Name: user_roles_roleId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "user_roles_roleId_idx" ON public.user_roles USING btree ("roleId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: central_one
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_isActive_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "users_isActive_idx" ON public.users USING btree ("isActive");


--
-- Name: users_storeId_idx; Type: INDEX; Schema: public; Owner: central_one
--

CREATE INDEX "users_storeId_idx" ON public.users USING btree ("storeId");


--
-- Name: audit_logs audit_logs_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: backups backups_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT "backups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: backups backups_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT "backups_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: barcode_settings barcode_settings_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.barcode_settings
    ADD CONSTRAINT "barcode_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: brands brands_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT "brands_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: credit_note_redemptions credit_note_redemptions_creditNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.credit_note_redemptions
    ADD CONSTRAINT "credit_note_redemptions_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES public.credit_notes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_note_redemptions credit_note_redemptions_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.credit_note_redemptions
    ADD CONSTRAINT "credit_note_redemptions_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credit_notes credit_notes_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT "credit_notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credit_notes credit_notes_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT "credit_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: credit_notes credit_notes_originalSaleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT "credit_notes_originalSaleId_fkey" FOREIGN KEY ("originalSaleId") REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: credit_notes credit_notes_salesReturnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT "credit_notes_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES public.sales_returns(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: credit_notes credit_notes_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT "credit_notes_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customers customers_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expenses expenses_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gst_settings gst_settings_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.gst_settings
    ADD CONSTRAINT "gst_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_settings invoice_settings_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.invoice_settings
    ADD CONSTRAINT "invoice_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notification_settings notification_settings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: printer_settings printer_settings_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.printer_settings
    ADD CONSTRAINT "printer_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_variants product_variants_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_items purchase_items_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT "purchase_items_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_items purchase_items_purchaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT "purchase_items_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES public.purchases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchases purchases_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT "purchases_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchases purchases_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT "purchases_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchases purchases_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT "purchases_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sale_items sale_items_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "sale_items_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sale_items sale_items_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sale_payments sale_payments_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sale_payments
    ADD CONSTRAINT "sale_payments_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales sales_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales sales_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_return_items sales_return_items_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales_return_items
    ADD CONSTRAINT "sales_return_items_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_return_items sales_return_items_saleItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales_return_items
    ADD CONSTRAINT "sales_return_items_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES public.sale_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_return_items sales_return_items_salesReturnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales_return_items
    ADD CONSTRAINT "sales_return_items_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES public.sales_returns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_returns sales_returns_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT "sales_returns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_returns sales_returns_refundProcessedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT "sales_returns_refundProcessedById_fkey" FOREIGN KEY ("refundProcessedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_returns sales_returns_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT "sales_returns_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_returns sales_returns_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT "sales_returns_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales sales_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT "stock_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT "stock_movements_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT "stock_movements_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: suppliers suppliers_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "suppliers_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_preferences user_preferences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: central_one
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public.stores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 87aEKN8sz8mFipOaFoTGkkue4txH2LRJjMMI9Ui66rMMETxizsRwI3fWQvLUfcC

