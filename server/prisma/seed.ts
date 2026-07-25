import { PrismaClient, GstRate } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateBarcode(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.random().toString().slice(2, 6);
  return `K${ts}${rand}`.slice(0, 14);
}

function generateSKU(prefix: string, size: string, color: string): string {
  const s = size ? size.slice(0, 2).toUpperCase() : 'XX';
  const c = color ? color.slice(0, 3).toUpperCase() : 'XXX';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${s}${c}-${rand}`;
}

const COLORS: { name: string; hex: string }[] = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Silver', hex: '#C0C0C0' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const PANT_SIZES = ['28', '30', '32', '34', '36', '38', '40', '42'];
const SAREE_LENGTHS = ['5.5m', '6m', '6.5m', '7m', '8m'];
const LEHENGA_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Custom'];

async function main() {
  console.log('🌱 Seeding database with clothing store data...\n');

  // Clean existing data only when SEED_CLEAN=true (safe for first-time setup)
  if (process.env.SEED_CLEAN === 'true') {
    await prisma.inventoryItem.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.salesReturnItem.deleteMany();
    await prisma.salesReturn.deleteMany();
    await prisma.creditNoteRedemption.deleteMany();
    await prisma.creditNote.deleteMany();
    await prisma.salePayment.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.purchaseItem.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.country.deleteMany();
    await prisma.occasion.deleteMany();
    await prisma.fabric.deleteMany();
    await prisma.hsnCode.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
    console.log('✓ Existing data cleaned');
  }

  // ── Roles ──
  const roles = ['ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_MANAGER'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
  }
  console.log('✓ Roles created');

  // ── Store ──
  const store = await prisma.store.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Kapda Fashion House',
      code: 'MAIN',
      ownerName: 'Rajesh Kumar',
      address: '45, Lajpat Nagar Market',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110024',
      phone: '+91-9876543210',
      email: 'info@kapdafashion.com',
      gstin: '07ABCDE1234F1Z5',
    },
  });
  console.log('✓ Store created: Kapda Fashion House');

  // ── Users ──
  const hash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kapda.com' },
    update: {},
    create: {
      email: 'admin@kapda.com', passwordHash: hash,
      firstName: 'Admin', lastName: 'User',
      phone: '+91-9999999998', isActive: true, storeId: store.id,
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: (await prisma.role.findUnique({ where: { name: 'ADMIN' } }))!.id } },
    update: {}, create: { userId: admin.id, roleId: (await prisma.role.findUnique({ where: { name: 'ADMIN' } }))!.id },
  });
  console.log('✓ Admin user: admin@kapda.com / admin123');

  // ── Brands ──
  const brandData = [
    { name: 'Kapda Classics', description: 'Traditional & everyday wear' },
    { name: 'Zara Collection', description: 'Contemporary fashion for women' },
    { name: 'FabIndia Heritage', description: 'Handloom & artisanal clothing' },
    { name: 'RS Brothers', description: 'Men\'s formal & casual wear' },
    { name: 'Lakshmi Silks', description: 'Premium silk & bridal wear' },
  ];
  const brands: Record<string, string> = {};
  for (const b of brandData) {
    const brand = await prisma.brand.upsert({
      where: { slug: slugify(b.name) },
      update: {},
      create: { name: b.name, slug: slugify(b.name), description: b.description, storeId: store.id },
    });
    brands[b.name] = brand.id;
  }
  console.log('✓ Brands created:', brandData.map(b => b.name).join(', '));

  // ── Master Data: HSN Codes, Fabrics, Occasions, Countries ──
  const hsnData = [
    { code: '6204', description: 'Women\'s suits, lehengas (suits, anarkalis, lehengas)' },
    { code: '5007', description: 'Silk sarees, woven fabrics of silk' },
    { code: '5208', description: 'Cotton fabrics, shirting (cotton cloth, linen blends)' },
    { code: '5209', description: 'Cotton fabrics >200g/m² (chinos, denim)' },
    { code: '5515', description: 'Polyester/synthetic fabrics (poly viscose, suiting)' },
  ];
  const hsnCodes: Record<string, string> = {};
  for (const h of hsnData) {
    const record = await prisma.hsnCode.upsert({
      where: { code: h.code },
      update: { description: h.description },
      create: { code: h.code, description: h.description, storeId: store.id },
    });
    hsnCodes[h.code] = record.id;
  }
  console.log('✓ HSN Codes created');

  const fabricData = ['Cotton', 'Georgette', 'Silk', 'Linen Cotton', 'Silk Blend', 'Poly Viscose', 'Cotton Stretch', 'Wool Blend', 'Velvet', 'Net', 'Cotton Linen'];
  const fabrics: Record<string, string> = {};
  for (const name of fabricData) {
    const record = await prisma.fabric.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), storeId: store.id },
    });
    fabrics[name] = record.id;
  }
  console.log('✓ Fabrics created');

  const occasionData = ['Daily Wear', 'Casual', 'Formal', 'Party', 'Festive', 'Wedding'];
  const occasions: Record<string, string> = {};
  for (const name of occasionData) {
    const record = await prisma.occasion.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), storeId: store.id },
    });
    occasions[name] = record.id;
  }
  console.log('✓ Occasions created');

  const country = await prisma.country.upsert({
    where: { code: 'IN' },
    update: {},
    create: { name: 'India', code: 'IN', slug: 'india', storeId: store.id },
  });
  console.log('✓ Countries seeded');

  // ── Sizes ──
  const sizeNames = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', '40', '42', '5.5m', '6m', '6.5m', '7m', '8m', 'Per Meter', 'Custom'];
  for (let i = 0; i < sizeNames.length; i++) {
    await prisma.size.upsert({
      where: { slug: slugify(sizeNames[i]) },
      update: {},
      create: { name: sizeNames[i], slug: slugify(sizeNames[i]), sortOrder: i, storeId: store.id },
    });
  }
  console.log('✓ Sizes seeded');

  // ── Colors ──
  const colorData: { name: string; hex: string }[] = [
    { name: 'Red', hex: '#FF0000' }, { name: 'Blue', hex: '#0000FF' }, { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' }, { name: 'Green', hex: '#008000' }, { name: 'Yellow', hex: '#FFD700' },
    { name: 'Pink', hex: '#FF69B4' }, { name: 'Purple', hex: '#800080' }, { name: 'Orange', hex: '#FFA500' },
    { name: 'Grey', hex: '#808080' }, { name: 'Navy', hex: '#000080' }, { name: 'Maroon', hex: '#800000' },
    { name: 'Teal', hex: '#008080' }, { name: 'Cream', hex: '#FFFDD0' }, { name: 'Gold', hex: '#FFD700' },
    { name: 'Silver', hex: '#C0C0C0' }, { name: 'Beige', hex: '#F5F5DC' }, { name: 'Brown', hex: '#A52A2A' },
    { name: 'Olive', hex: '#808000' }, { name: 'Peach', hex: '#FFDAB9' }, { name: 'Lavender', hex: '#E6E6FA' },
  ];
  for (const c of colorData) {
    await prisma.color.upsert({
      where: { slug: slugify(c.name) },
      update: { hex: c.hex },
      create: { name: c.name, hex: c.hex, slug: slugify(c.name), storeId: store.id },
    });
  }
  console.log('✓ Colors seeded');

  // ── Categories & Products ──
  const categoryData = [
    {
      name: 'Women Suits', description: 'Salwar kameez, anarkali suits, and designer suits',
      products: [
        {
          name: 'Cotton Printed Salwar Suit',
          brand: 'Kapda Classics', hsnCode: '6204', fabric: 'Cotton', occasion: 'Daily Wear',
          description: 'Comfortable cotton salwar suit with beautiful floral prints. Three-piece set includes salwar, kameez, and dupatta.',
          careInstructions: 'Machine wash cold. Do not bleach. Iron on medium heat.',
          variants: [
            { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Blue', 'Green', 'Pink', 'Purple', 'Maroon'], price: 1299, mrp: 1999, stock: 25 },
          ],
        },
        {
          name: 'Geometric Print Anarkali Suit',
          brand: 'Kapda Classics', hsnCode: '6204', fabric: 'Georgette', occasion: 'Festive',
          description: 'Elegant georgette anarkali suit with geometric prints and embroidered neckline.',
          careInstructions: 'Dry clean recommended.',
          variants: [
            { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Red', 'Navy', 'Green', 'Orange'], price: 1899, mrp: 2999, stock: 15 },
          ],
        },
        {
          name: 'Heavy Embroidered Bridal Suit',
          brand: 'Lakshmi Silks', hsnCode: '6204', fabric: 'Silk', occasion: 'Wedding',
          description: 'Rich silk salwar suit with heavy zari and gotta patti embroidery. Perfect for weddings and special occasions.',
          careInstructions: 'Dry clean only. Store in muslin cloth.',
          variants: [
            { sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Red', 'Maroon', 'Gold', 'Pink'], price: 4999, mrp: 7999, stock: 8 },
          ],
        },
        {
          name: 'Chikankari Cotton Suit',
          brand: 'FabIndia Heritage', hsnCode: '6204', fabric: 'Cotton', occasion: 'Casual',
          description: 'Hand-crafted chikankari work on pure cotton. Lightweight and perfect for summer.',
          careInstructions: 'Hand wash with mild detergent. Dry in shade.',
          variants: [
            { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White', 'Cream', 'Blue', 'Pink'], price: 1599, mrp: 2499, stock: 20 },
          ],
        },
      ],
    },
    {
      name: 'Shirt Cloth', description: 'Premium shirting fabrics by the meter',
      products: [
        {
          name: 'Premium Cotton Shirting Fabric',
          brand: 'RS Brothers', hsnCode: '5208', fabric: 'Cotton', occasion: 'Formal',
          description: 'High-quality 100% cotton shirting fabric. 40s count, 60" width. Sold per meter.',
          careInstructions: 'Machine wash. Iron on high heat.',
          variants: [
            { sizes: ['Per Meter'], colors: ['White', 'Blue', 'Grey', 'Navy', 'Black'], price: 349, mrp: 499, stock: 100 },
          ],
        },
        {
          name: 'Linen Cotton Blend Fabric',
          brand: 'RS Brothers', hsnCode: '5208', fabric: 'Linen Cotton', occasion: 'Casual',
          description: 'Breathable linen-cotton blend fabric. 55" width. Ideal for summer shirts.',
          careInstructions: 'Machine wash gentle. Iron while damp.',
          variants: [
            { sizes: ['Per Meter'], colors: ['White', 'Blue', 'Grey', 'Cream'], price: 449, mrp: 649, stock: 75 },
          ],
        },
        {
          name: 'Striped Formal Shirting Fabric',
          brand: 'Kapda Classics', hsnCode: '5208', fabric: 'Cotton', occasion: 'Formal',
          description: 'Classic striped pattern in premium cotton. 58" width. Business formal quality.',
          careInstructions: 'Machine wash. Iron on high heat.',
          variants: [
            { sizes: ['Per Meter'], colors: ['Blue', 'Grey', 'White', 'Navy'], price: 399, mrp: 599, stock: 60 },
          ],
        },
        {
          name: 'Silk Blend Designer Fabric',
          brand: 'Lakshmi Silks', hsnCode: '5007', fabric: 'Silk Blend', occasion: 'Party',
          description: 'Luxurious silk blend fabric for party wear shirts. 44" width. Available in rich colors.',
          careInstructions: 'Dry clean recommended.',
          variants: [
            { sizes: ['Per Meter'], colors: ['Red', 'Gold', 'Navy', 'Green', 'Purple'], price: 799, mrp: 1199, stock: 40 },
          ],
        },
      ],
    },
    {
      name: 'Men Pant Cloth', description: 'Trouser and pant fabrics by the meter',
      products: [
        {
          name: 'Poly Viscose Trousers Fabric',
          brand: 'RS Brothers', hsnCode: '5515', fabric: 'Poly Viscose', occasion: 'Formal',
          description: 'Durable poly-viscose blend fabric for formal trousers. 58" width. Wrinkle-resistant.',
          careInstructions: 'Machine wash. Dry clean recommended for best results.',
          variants: [
            { sizes: ['Per Meter'], colors: ['Black', 'Grey', 'Navy', 'Brown'], price: 399, mrp: 599, stock: 80 },
          ],
        },
        {
          name: 'Cotton Chino Fabric',
          brand: 'Kapda Classics', hsnCode: '5209', fabric: 'Cotton', occasion: 'Casual',
          description: 'Soft cotton chino fabric for casual pants. 60" width. Comfortable and breathable.',
          careInstructions: 'Machine wash. Iron on medium heat.',
          variants: [
            { sizes: ['Per Meter'], colors: ['Beige', 'Navy', 'Olive', 'Black', 'Grey'], price: 449, mrp: 649, stock: 65 },
          ],
        },
        {
          name: 'Stretch Denim Fabric',
          brand: 'Kapda Classics', hsnCode: '5209', fabric: 'Cotton Stretch', occasion: 'Casual',
          description: 'Premium stretch denim with 2% elastane. 56" width. Comfortable jeans quality.',
          careInstructions: 'Machine wash inside out. Do not bleach.',
          variants: [
            { sizes: ['Per Meter'], colors: ['Blue', 'Black', 'Grey', 'Navy'], price: 549, mrp: 799, stock: 50 },
          ],
        },
        {
          name: 'Wool Blend Suiting Fabric',
          brand: 'RS Brothers', hsnCode: '5515', fabric: 'Wool Blend', occasion: 'Formal',
          description: 'Premium wool blend suiting for tailored trousers. 58" width. Perfect for suits.',
          careInstructions: 'Dry clean only.',
          variants: [
            { sizes: ['Per Meter'], colors: ['Black', 'Grey', 'Navy', 'Brown'], price: 899, mrp: 1299, stock: 30 },
          ],
        },
      ],
    },
    {
      name: 'Lehengas', description: 'Bridal and party wear lehengas',
      products: [
        {
          name: 'Traditional Bridal Lehenga',
          brand: 'Lakshmi Silks', hsnCode: '6204', fabric: 'Silk', occasion: 'Wedding',
          description: 'Heavily embroidered bridal lehenga with zari work. Includes lehenga, blouse, and dupatta.',
          careInstructions: 'Dry clean only. Store in acid-free tissue.',
          variants: [
            { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Red', 'Maroon', 'Gold', 'Pink'], price: 15999, mrp: 25000, stock: 5 },
          ],
        },
        {
          name: 'Velvet Party Wear Lehenga',
          brand: 'Zara Collection', hsnCode: '6204', fabric: 'Velvet', occasion: 'Party',
          description: 'Rich velvet lehenga with resham embroidery. Perfect for cocktail parties and receptions.',
          careInstructions: 'Dry clean only.',
          variants: [
            { sizes: ['S', 'M', 'L', 'XL'], colors: ['Navy', 'Green', 'Maroon', 'Purple', 'Black'], price: 8999, mrp: 14999, stock: 10 },
          ],
        },
        {
          name: 'Net Lehenga Choli',
          brand: 'Zara Collection', hsnCode: '6204', fabric: 'Net', occasion: 'Festive',
          description: 'Flowing net lehenga with sequin work. Lightweight and easy to carry.',
          careInstructions: 'Hand wash or dry clean.',
          variants: [
            { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Pink', 'Blue', 'Purple', 'Gold'], price: 5999, mrp: 9999, stock: 12 },
          ],
        },
        {
          name: 'Cotton Lehenga for Haldi',
          brand: 'FabIndia Heritage', hsnCode: '6204', fabric: 'Cotton', occasion: 'Wedding',
          description: 'Lightweight cotton lehenga with mirror work. Ideal for haldi and mehendi functions.',
          careInstructions: 'Machine wash gentle.',
          variants: [
            { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Yellow', 'Green', 'Orange', 'Pink'], price: 3999, mrp: 5999, stock: 15 },
          ],
        },
      ],
    },
    {
      name: 'Sarees', description: 'Traditional and modern sarees for every occasion',
      products: [
        {
          name: 'Banarasi Silk Saree',
          brand: 'Lakshmi Silks', hsnCode: '5007', fabric: 'Silk', occasion: 'Wedding',
          description: 'Authentic Banarasi silk saree with intricate zari weave. Comes with matching blouse piece.',
          careInstructions: 'Dry clean only. Do not hang for long periods.',
          variants: [
            { sizes: SAREE_LENGTHS.map(() => '6.5m'), colors: ['Red', 'Gold', 'Maroon', 'Green', 'Navy'], price: 12999, mrp: 19999, stock: 8 },
          ],
        },
        {
          name: 'Kanjivaram Silk Saree',
          brand: 'Lakshmi Silks', hsnCode: '5007', fabric: 'Silk', occasion: 'Wedding',
          description: 'Pure Kanjivaram silk saree with traditional temple border. Rich zari work all over.',
          careInstructions: 'Dry clean only. Store separately.',
          variants: [
            { sizes: SAREE_LENGTHS.map(() => '6m'), colors: ['Red', 'Green', 'Blue', 'Purple', 'Gold'], price: 15999, mrp: 24999, stock: 6 },
          ],
        },
        {
          name: 'Cotton Linen Saree',
          brand: 'FabIndia Heritage', hsnCode: '5208', fabric: 'Cotton Linen', occasion: 'Casual',
          description: 'Lightweight cotton-linen saree for everyday elegance. Comfortable and breathable.',
          careInstructions: 'Machine wash. Iron on medium heat.',
          variants: [
            { sizes: SAREE_LENGTHS.map(() => '6m'), colors: ['White', 'Blue', 'Grey', 'Pink', 'Cream'], price: 1999, mrp: 2999, stock: 25 },
          ],
        },
        {
          name: 'Georgette Printed Saree',
          brand: 'Zara Collection', hsnCode: '6204', fabric: 'Georgette', occasion: 'Party',
          description: 'Trendy georgette saree with digital prints. Lightweight with fall and edging done.',
          careInstructions: 'Hand wash. Iron on low heat.',
          variants: [
            { sizes: SAREE_LENGTHS.map(() => '5.5m'), colors: ['Pink', 'Blue', 'Purple', 'Orange', 'Teal'], price: 2499, mrp: 3999, stock: 20 },
          ],
        },
        {
          name: 'Handloom Cotton Saree',
          brand: 'FabIndia Heritage', hsnCode: '5208', fabric: 'Cotton', occasion: 'Daily Wear',
          description: 'Handwoven cotton saree by local artisans. Each piece is unique with traditional patterns.',
          careInstructions: 'Hand wash with mild soap. Dry in shade.',
          variants: [
            { sizes: SAREE_LENGTHS.map(() => '6m'), colors: ['White', 'Cream', 'Blue', 'Green', 'Red'], price: 1499, mrp: 2499, stock: 30 },
          ],
        },
      ],
    },
  ];

  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(cat.name) },
      update: { description: cat.description },
      create: { name: cat.name, slug: slugify(cat.name), description: cat.description, storeId: store.id },
    });

    for (const prod of cat.products) {
      const product = await prisma.product.upsert({
        where: { slug: slugify(prod.name) },
        update: {},
        create: {
          name: prod.name,
          slug: slugify(prod.name),
          description: prod.description,
          categoryId: category.id,
          brandId: brands[prod.brand],
          hsnCodeId: hsnCodes[prod.hsnCode],
          fabricId: fabrics[prod.fabric],
          occasionId: occasions[prod.occasion],
          countryOfOriginId: country.id,
          careInstructions: prod.careInstructions,
          tags: [prod.fabric, prod.occasion, cat.name],
          isActive: true,
        },
      });

      for (const v of prod.variants) {
        const usedSizes = prod.name.includes('Saree') ? SAREE_LENGTHS
          : prod.name.includes('Fabric') || prod.name.includes('Cloth') ? ['Per Meter']
          : ['S', 'M', 'L', 'XL', 'XXL'];

        for (const size of usedSizes) {
          for (const colorName of v.colors) {
            const colorObj = COLORS.find(c => c.name === colorName) || { name: colorName, hex: '#CCCCCC' };
            const sku = generateSKU(category.name.slice(0, 3).toUpperCase(), size, colorName);
            const barcode = generateBarcode();

            await prisma.productVariant.create({
              data: {
                productId: product.id,
                sku,
                barcode,
                barcodeType: 'CODE128',
                size: size === 'Per Meter' ? null : size,
                color: colorName,
                colorHex: colorObj.hex,
                fabric: prod.fabric,
                purchasePrice: Math.round(v.price * 0.6 * 100) / 100,
                sellingPrice: v.price,
                mrp: v.mrp,
                gstPercentage: 'GST_5' as GstRate,
                stockQuantity: v.stock,
                reorderLevel: 5,
                storeId: store.id,
              },
            });
          }
        }
      }
    }
    console.log(`✓ ${cat.name} — ${cat.products.length} products with variants`);
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('   Login: admin@kapda.com / admin123');
  console.log(`   Total brands: ${brandData.length}`);
  console.log(`   Total categories: ${categoryData.length}`);
  console.log(`   Total products: ${categoryData.reduce((s, c) => s + c.products.length, 0)}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
