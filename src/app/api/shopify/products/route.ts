// ============================================================================
// PPW Email Engine — Shopify Products API
// GET /api/shopify/products
// Tests the Shopify access token and fetches live product data.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_STORE = "peakprimalwellness.myshopify.com";

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  status: string;
  tags: string;
  variants: Array<{
    id: number;
    price: string;
    compare_at_price: string | null;
  }>;
  images: Array<{
    id: number;
    src: string;
  }>;
  created_at: string;
  updated_at: string;
}

async function shopifyFetch(endpoint: string, params?: Record<string, string>) {
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "SHOPIFY_ACCESS_TOKEN is not set. Add it in Vercel project settings."
    );
  }

  const url = new URL(`https://${SHOPIFY_STORE}/admin/api/2024-01/${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("mode") || "test";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 250);
  const collection = searchParams.get("collection");

  try {
    if (mode === "test") {
      // Quick connection test — fetch shop info + a few products
      const [shopData, productsData] = await Promise.all([
        shopifyFetch("shop.json"),
        shopifyFetch("products.json", { limit: "5", fields: "id,title,handle,vendor,product_type,status,tags" }),
      ]);

      const productCount = await shopifyFetch("products/count.json");

      return NextResponse.json({
        status: "connected",
        shop: {
          name: shopData.shop.name,
          domain: shopData.shop.domain,
          myshopifyDomain: shopData.shop.myshopify_domain,
          plan: shopData.shop.plan_display_name,
          currency: shopData.shop.currency,
        },
        products: {
          total: productCount.count,
          sample: productsData.products.map((p: ShopifyProduct) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            vendor: p.vendor,
            type: p.product_type,
            status: p.status,
          })),
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (mode === "products") {
      // Full product fetch with pagination support
      const params: Record<string, string> = {
        limit: limit.toString(),
        status: "active",
      };

      if (collection) {
        // Fetch by collection
        const collectionProducts = await shopifyFetch(
          `collections/${collection}/products.json`,
          params
        );
        return NextResponse.json({
          products: collectionProducts.products,
          count: collectionProducts.products.length,
        });
      }

      const data = await shopifyFetch("products.json", params);
      return NextResponse.json({
        products: data.products,
        count: data.products.length,
      });
    }

    if (mode === "collections") {
      const data = await shopifyFetch("custom_collections.json", { limit: "50" });
      const smartData = await shopifyFetch("smart_collections.json", { limit: "50" });

      return NextResponse.json({
        customCollections: data.custom_collections,
        smartCollections: smartData.smart_collections,
        total:
          data.custom_collections.length + smartData.smart_collections.length,
      });
    }

    return NextResponse.json(
      { error: "Invalid mode. Use: test, products, or collections" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Shopify API error:", message);

    const isAuthError =
      message.includes("401") || message.includes("403") || message.includes("ACCESS_TOKEN");

    return NextResponse.json(
      {
        status: "error",
        error: message,
        hint: isAuthError
          ? "Check that SHOPIFY_ACCESS_TOKEN is correctly set in Vercel environment variables."
          : "Check the Shopify API connection and try again.",
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
