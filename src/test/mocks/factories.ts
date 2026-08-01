import type { Chalet, ChaletImage, ChaletWithImages, Profile, PageView } from "@/types/database";

let counter = 0;
function nextId() {
  counter++;
  return `test-id-${counter}`;
}

export function buildChalet(overrides: Partial<Chalet> = {}): Chalet {
  const id = overrides.id || nextId();
  return {
    id,
    name: "Test Chalet",
    slug: "test-chalet",
    tagline: "A beautiful chalet",
    capacity: "4-6 guests",
    features: ["Pool", "WiFi", "BBQ"],
    weekday_price: 200,
    weekend_price: 300,
    check_in: "15:00",
    check_out: "11:00",
    display_order: 0,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

export function buildChaletImage(overrides: Partial<ChaletImage> = {}): ChaletImage {
  const id = overrides.id || nextId();
  return {
    id,
    chalet_id: "chalet-1",
    storage_path: `chalet-1/${id}.jpg`,
    url: `https://test.supabase.co/storage/v1/object/public/chalet-images/chalet-1/${id}.jpg`,
    thumbnail_url: null,
    thumbnail_storage_path: null,
    display_order: 0,
    is_primary: true,
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

export function buildChaletWithImages(overrides: Partial<ChaletWithImages> = {}): ChaletWithImages {
  const chalet = buildChalet(overrides);
  return {
    ...chalet,
    chalet_images: overrides.chalet_images ?? [buildChaletImage({ chalet_id: chalet.id })],
  };
}

export function buildProfile(overrides: Partial<Profile> = {}): Profile {
  const id = overrides.id || nextId();
  return {
    id,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    role: "admin",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

export function buildPageView(overrides: Partial<PageView> = {}): PageView {
  return {
    id: overrides.id || nextId(),
    page_path: "/",
    chalet_slug: null,
    session_id: "session-123",
    user_agent: "test-agent",
    referrer: null,
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

export function resetFactoryCounter() {
  counter = 0;
}
